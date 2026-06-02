import type { Database } from '../../db';
import type { EventsModel } from './events.model';
import { eventsModel as defaultModel } from './events.model';
import type {
    EventFilters,
    CreateEventInput,
    UpdateEventInput,
} from './events.types';
import { ServiceError } from '../../utils/errors';
import { validateUserRelationFilters } from '../../utils/filter-validators';
import type { LocationsService } from '../locations/locations.service';
import type { EventBus } from '../../lib/eventBus';
import { hasDateTimePassed } from '../../utils/time';
import type { Actor } from '../../utils/actor';

export interface EventsServiceDeps {
    model?: EventsModel;
    locationsService: LocationsService;
    bus: Pick<EventBus, 'emit'>;
}

function canManageEvent(organizerId: string, actor: Actor) {
    return organizerId === actor.id || actor.role === 'admin';
}

export function createEventsService({
    model = defaultModel,
    locationsService,
    bus,
}: EventsServiceDeps) {
    return {
        async list(db: Database, filters: EventFilters) {
            validateUserRelationFilters(filters);
            return model.findAll(db, filters);
        },

        async getById(db: Database, id: string) {
            const event = await model.findById(db, id);
            if (!event) {
                throw ServiceError.notFound('Event not found');
            }
            return event;
        },

        async loadRaw(db: Database, id: string) {
            const event = await model.findRawById(db, id);
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
            if (hasDateTimePassed(input.startTime)) {
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
            actor: Actor,
            input: UpdateEventInput
        ) {
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
            if (input.startTime && hasDateTimePassed(input.startTime)) {
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
                await bus.emit(db, 'event.updated', {
                    eventId,
                    eventName: input.name ?? existing.name,
                    actorId: actor.id,
                });
            }

            return updated;
        },

        async cancel(
            db: Database,
            eventId: string,
            actor: Actor,
            reason?: string
        ) {
            const existing = await this.loadRaw(db, eventId);
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
                await bus.emit(db, 'event.cancelled', {
                    eventId,
                    eventName: cancelledEvent.name,
                    actorId: actor.id,
                });
            }

            return cancelledEvent;
        },

        async delete(db: Database, eventId: string, actor: Actor) {
            const existing = await this.loadRaw(db, eventId);
            if (!canManageEvent(existing.organizerId, actor)) {
                throw ServiceError.forbidden(
                    'Only the organizer or an admin can delete this event'
                );
            }

            await model.softDelete(db, eventId);
            return { success: true };
        },

        async getStatsByUserId(db: Database, userId: string) {
            return model.getStatsByUserId(db, userId);
        },
    };
}

export type EventsService = ReturnType<typeof createEventsService>;
