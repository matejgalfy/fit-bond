import { db } from '../../db';
import { eventsService, EventsServiceError } from './events.service';
import {
    createEventBody,
    updateEventBody,
    cancelEventBody,
    eventQueryFilters,
    eventIdParam,
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
    async list(query: Record<string, unknown>) {
        const filters = eventQueryFilters.parse(query);
        return eventsService.list(db, filters);
    },

    async getById(rawId: string) {
        const { id } = eventIdParam.parse({ id: rawId });
        return eventsService.getById(db, id);
    },

    async create(headers: Record<string, string | undefined>, body: unknown) {
        const userId = requireUserId(headers);
        const data = createEventBody.parse(body);
        return eventsService.create(db, userId, data);
    },

    async update(
        rawId: string,
        headers: Record<string, string | undefined>,
        body: unknown
    ) {
        const userId = requireUserId(headers);
        const { id } = eventIdParam.parse({ id: rawId });
        const data = updateEventBody.parse(body);
        return eventsService.update(db, id, userId, data);
    },

    async cancel(
        rawId: string,
        headers: Record<string, string | undefined>,
        body: unknown
    ) {
        const userId = requireUserId(headers);
        const { id } = eventIdParam.parse({ id: rawId });
        const data = cancelEventBody.parse(body);
        return eventsService.cancel(db, id, userId, data.reason);
    },

    async delete(rawId: string, headers: Record<string, string | undefined>) {
        const userId = requireUserId(headers);
        const { id } = eventIdParam.parse({ id: rawId });
        await eventsService.delete(db, id, userId);
        return { success: true };
    },
};
