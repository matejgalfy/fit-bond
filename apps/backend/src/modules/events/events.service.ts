import type { Database } from '../../db';
import type { EventsModel } from './events.model';
import { eventsModel as defaultModel } from './events.model';
import type {
    EventFilters,
    CreateEventInput,
    UpdateEventInput,
} from './events.types';
import { ServiceError } from '../../utils/errors';

export function createEventsService(model: EventsModel = defaultModel) {
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

            return model.create(db, organizerId, input);
        },

        async update(
            db: Database,
            eventId: string,
            userId: string,
            input: UpdateEventInput
        ) {
            const existing = await model.findRawById(db, eventId);
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

            return model.update(db, eventId, input);
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

            return model.cancel(db, eventId, reason);
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
