import type { Database } from '../../db';
import type { EventsModel } from './events.model';
import { eventsModel as defaultModel } from './events.model';
import type {
    EventFilters,
    CreateEventInput,
    UpdateEventInput,
} from './events.types';
import { ServiceError } from '../../utils/errors';
import {
    locationsService as defaultLocationsService,
    type LocationsService,
} from '../locations/locations.service';
import { usersService as defaultUsersService } from '../users/users.service';
import { emailService } from '../email/email.service';
import {
    notificationsService as defaultNotifications,
    type NotificationsService,
} from '../notifications/notifications.service';

export interface EventsServiceDeps {
    model?: EventsModel;
    locationsService?: LocationsService;
    usersService?: typeof defaultUsersService;
    notifications?: Pick<NotificationsService, 'createMany'>;
}

interface EventActor {
    id: string;
    role?: string;
}

function normalizeActor(actor: string | EventActor): EventActor {
    return typeof actor === 'string' ? { id: actor } : actor;
}

function canManageEvent(organizerId: string, actor: EventActor) {
    return organizerId === actor.id || actor.role === 'admin';
}

export function createEventsService({
    model = defaultModel,
    locationsService = defaultLocationsService,
    usersService = defaultUsersService,
    notifications = defaultNotifications,
}: EventsServiceDeps = {}) {
    async function notifyParticipants(
        db: Database,
        eventId: string,
        excludeUserId: string,
        type: 'event_update' | 'event_cancelled',
        title: string,
        message: string
    ) {
        try {
            const participants = await usersService.getUsersByEventId(
                db,
                eventId
            );
            await notifications.createMany(
                db,
                participants
                    .filter((p) => p.id !== excludeUserId)
                    .map((p) => ({
                        userId: p.id,
                        type,
                        title,
                        message,
                        eventId,
                        relatedUserId: excludeUserId,
                    }))
            );
        } catch (err: unknown) {
            console.error('Notification creation failed:', err);
        }
    }

    return {
        async list(db: Database, filters: EventFilters) {
            // Validate that if userRelation is provided, userId must also be provided
            if (filters.userRelation && !filters.userId) {
                throw ServiceError.badRequest(
                    'userId is required when filtering by userRelation'
                );
            }

            // Validate that if excludeUserInteractions is provided, userId must also be provided
            if (filters.excludeUserInteractions && !filters.userId) {
                throw ServiceError.badRequest(
                    'userId is required when excludeUserInteractions is true'
                );
            }

            // Validate that userRelation and excludeUserInteractions cannot be used together
            if (filters.userRelation && filters.excludeUserInteractions) {
                throw ServiceError.badRequest(
                    'userRelation and excludeUserInteractions cannot be used together'
                );
            }

            return model.findAll(db, filters);
        },

        async getById(db: Database, id: string) {
            const event = await model.findById(db, id);
            if (!event) {
                throw ServiceError.notFound('Event not found');
            }
            return event;
        },

        async create(
            db: Database,
            organizerId: string,
            input: CreateEventInput
        ) {
            if (new Date(input.startTime) <= new Date()) {
                throw ServiceError.badRequest(
                    'Event start time must be in the future'
                );
            }

            return db.transaction(async (tx) => {
                const location = await locationsService.findOrCreate(
                    tx,
                    input.location
                );
                return model.create(tx, organizerId, location.id, input);
            });
        },

        async update(
            db: Database,
            eventId: string,
            actorInput: string | EventActor,
            input: UpdateEventInput
        ) {
            const actor = normalizeActor(actorInput);
            const existing = await model.findById(db, eventId);
            if (!existing) {
                throw ServiceError.notFound('Event not found');
            }
            if (!canManageEvent(existing.organizerId, actor)) {
                throw ServiceError.forbidden(
                    'Only the organizer or an admin can update this event'
                );
            }
            if (existing.cancelledAt) {
                throw ServiceError.conflict('Cannot update a cancelled event');
            }
            if (input.startTime && new Date(input.startTime) <= new Date()) {
                throw ServiceError.badRequest(
                    'Event start time must be in the future'
                );
            }
            if (
                input.capacity !== undefined &&
                input.capacity < existing.currentParticipants
            ) {
                throw ServiceError.badRequest(
                    'Capacity cannot be less than current participants'
                );
            }

            const updated = await db.transaction(async (tx) => {
                let locationId: string | undefined;
                if (input.location) {
                    const location = await locationsService.findOrCreate(
                        tx,
                        input.location
                    );
                    locationId = location.id;
                }
                return model.update(tx, eventId, input, locationId);
            });

            const significant =
                input.startTime !== undefined ||
                input.location !== undefined ||
                (input.capacity !== undefined &&
                    input.capacity !== existing.capacity);

            if (significant) {
                const eventName = input.name ?? existing.name;
                await notifyParticipants(
                    db,
                    eventId,
                    actor.id,
                    'event_update',
                    'Event updated',
                    `${eventName} has been updated. Check the new details.`
                );
            }

            return updated;
        },

        async cancel(
            db: Database,
            eventId: string,
            actorInput: string | EventActor,
            reason?: string
        ) {
            const actor = normalizeActor(actorInput);
            const existing = await model.findRawById(db, eventId);
            if (!existing) {
                throw ServiceError.notFound('Event not found');
            }
            if (!canManageEvent(existing.organizerId, actor)) {
                throw ServiceError.forbidden(
                    'Only the organizer or an admin can cancel this event'
                );
            }
            if (existing.cancelledAt) {
                throw ServiceError.conflict('Event is already cancelled');
            }

            const cancelledEvent = await model.cancel(db, eventId, reason);

            if (cancelledEvent) {
                const participants = await usersService.getUsersByEventId(
                    db,
                    eventId
                );

                Promise.all(
                    participants.map((p) =>
                        emailService.eventCancelledEmail(
                            p.email,
                            cancelledEvent.name
                        )
                    )
                ).catch((err: unknown) => {
                    console.error('Email sending failed:', err);
                });

                await notifyParticipants(
                    db,
                    eventId,
                    actor.id,
                    'event_cancelled',
                    'Event cancelled',
                    `${cancelledEvent.name} has been cancelled.`
                );
            }

            return cancelledEvent;
        },

        async delete(
            db: Database,
            eventId: string,
            actorInput: string | EventActor
        ) {
            const actor = normalizeActor(actorInput);
            const existing = await model.findRawById(db, eventId);
            if (!existing) {
                throw ServiceError.notFound('Event not found');
            }
            if (!canManageEvent(existing.organizerId, actor)) {
                throw ServiceError.forbidden(
                    'Only the organizer or an admin can delete this event'
                );
            }

            await model.softDelete(db, eventId);
        },

        async getStatsByUserId(db: Database, userId: string) {
            return model.getStatsByUserId(db, userId);
        },
    };
}

export const eventsService = createEventsService();
