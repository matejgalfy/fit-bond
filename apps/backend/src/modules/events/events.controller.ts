import { db } from '../../db';
import { eventsService, EventsServiceError } from './events.service';
import type {
    CreateEventBody,
    UpdateEventBody,
    CancelEventBody,
    EventQueryFilters,
} from './events.schema';

function requireUserId(headers: Record<string, string | undefined>): string {
    const userId = headers['x-user-id'];
    if (!userId) {
        throw new EventsServiceError(
            'Authentication required',
            'FORBIDDEN',
            401
        );
    }
    return userId;
}

export const eventsController = {
    async list(filters: EventQueryFilters) {
        return eventsService.list(db, filters);
    },

    async getById(id: string) {
        return eventsService.getById(db, id);
    },

    async create(
        headers: Record<string, string | undefined>,
        data: CreateEventBody
    ) {
        const userId = requireUserId(headers);
        return eventsService.create(db, userId, data);
    },

    async update(
        id: string,
        headers: Record<string, string | undefined>,
        data: UpdateEventBody
    ) {
        const userId = requireUserId(headers);
        return eventsService.update(db, id, userId, data);
    },

    async cancel(
        id: string,
        headers: Record<string, string | undefined>,
        data: CancelEventBody
    ) {
        const userId = requireUserId(headers);
        return eventsService.cancel(db, id, userId, data.reason);
    },

    async delete(id: string, headers: Record<string, string | undefined>) {
        const userId = requireUserId(headers);
        await eventsService.delete(db, id, userId);
        return { success: true };
    },
};
