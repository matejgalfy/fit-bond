import type { Database } from '../../db';
import type { EventsModel } from './events.model';
import { eventsModel as defaultModel } from './events.model';
import type {
    EventFilters,
    CreateEventInput,
    UpdateEventInput,
} from './events.types';

export class EventsServiceError extends Error {
    public readonly code:
        | 'NOT_FOUND'
        | 'FORBIDDEN'
        | 'CONFLICT'
        | 'BAD_REQUEST';
    public readonly statusCode: number;

    constructor(
        message: string,
        code: 'NOT_FOUND' | 'FORBIDDEN' | 'CONFLICT' | 'BAD_REQUEST',
        statusCode: number
    ) {
        super(message);
        this.name = 'EventsServiceError';
        this.code = code;
        this.statusCode = statusCode;
    }
}

export function createEventsService(model: EventsModel = defaultModel) {
    return {
        async list(db: Database, filters: EventFilters) {
            return model.findAll(db, filters);
        },

        async getById(db: Database, id: string) {
            const event = await model.findById(db, id);
            if (!event) {
                throw new EventsServiceError(
                    'Event not found',
                    'NOT_FOUND',
                    404
                );
            }
            return event;
        },

        async create(
            db: Database,
            organizerId: string,
            input: CreateEventInput
        ) {
            if (new Date(input.startTime) <= new Date()) {
                throw new EventsServiceError(
                    'Event start time must be in the future',
                    'BAD_REQUEST',
                    400
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
                throw new EventsServiceError(
                    'Event not found',
                    'NOT_FOUND',
                    404
                );
            }
            if (existing.organizerId !== userId) {
                throw new EventsServiceError(
                    'Only the organizer can update this event',
                    'FORBIDDEN',
                    403
                );
            }
            if (existing.cancelledAt) {
                throw new EventsServiceError(
                    'Cannot update a cancelled event',
                    'CONFLICT',
                    409
                );
            }
            if (input.startTime && new Date(input.startTime) <= new Date()) {
                throw new EventsServiceError(
                    'Event start time must be in the future',
                    'BAD_REQUEST',
                    400
                );
            }
            if (
                input.capacity !== undefined &&
                input.capacity < existing.currentParticipants
            ) {
                throw new EventsServiceError(
                    'Capacity cannot be less than current participants',
                    'BAD_REQUEST',
                    400
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
                throw new EventsServiceError(
                    'Event not found',
                    'NOT_FOUND',
                    404
                );
            }
            if (existing.organizerId !== userId) {
                throw new EventsServiceError(
                    'Only the organizer can cancel this event',
                    'FORBIDDEN',
                    403
                );
            }
            if (existing.cancelledAt) {
                throw new EventsServiceError(
                    'Event is already cancelled',
                    'CONFLICT',
                    409
                );
            }

            return model.cancel(db, eventId, reason);
        },

        async delete(db: Database, eventId: string, userId: string) {
            const existing = await model.findRawById(db, eventId);
            if (!existing) {
                throw new EventsServiceError(
                    'Event not found',
                    'NOT_FOUND',
                    404
                );
            }
            if (existing.organizerId !== userId) {
                throw new EventsServiceError(
                    'Only the organizer can delete this event',
                    'FORBIDDEN',
                    403
                );
            }

            await model.softDelete(db, eventId);
        },
    };
}

export const eventsService = createEventsService();
