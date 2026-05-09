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

export interface EventsServiceDeps {
    model?: EventsModel;
    locationsService?: LocationsService;
    usersService?: typeof defaultUsersService;
}

export function createEventsService({
    model = defaultModel,
    locationsService = defaultLocationsService,
    usersService = defaultUsersService,
}: EventsServiceDeps = {}) {
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
            userId: string,
            input: UpdateEventInput
        ) {
            const existing = await model.findById(db, eventId);
            if (!existing) {
                throw ServiceError.notFound('Event not found');
            }
            if (existing.organizerId !== userId) {
                throw ServiceError.forbidden(
                    'Only the organizer can update this event'
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

            return db.transaction(async (tx) => {
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
        },

        async cancel(
            db: Database,
            eventId: string,
            userId: string,
            reason?: string
        ) {
            const existing = await model.findRawById(db, eventId);
            if (!existing) {
                throw ServiceError.notFound('Event not found');
            }
            if (existing.organizerId !== userId) {
                throw ServiceError.forbidden(
                    'Only the organizer can cancel this event'
                );
            }
            if (existing.cancelledAt) {
                throw ServiceError.conflict('Event is already cancelled');
            }

            const cancelledEvent = await model.cancel(db, eventId, reason);

            if (cancelledEvent) {
                    const participants = await usersService.getUsersByEventId(db, eventId);
                    
                    Promise.all(
                        participants.map((p) =>
                            emailService.eventCancelledEmail(p.email, cancelledEvent.name)
                        )
                    ).catch((err) => console.error('Email sending failed:', err));
                }

                return cancelledEvent;
        },

        async delete(db: Database, eventId: string, userId: string) {
            const existing = await model.findRawById(db, eventId);
            if (!existing) {
                throw ServiceError.notFound('Event not found');
            }
            if (existing.organizerId !== userId) {
                throw ServiceError.forbidden(
                    'Only the organizer can delete this event'
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
