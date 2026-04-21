import { db } from '../../db';
import { eventsService } from './events.service';

import type {
    CreateEventBody,
    UpdateEventBody,
    CancelEventBody,
    EventQueryFilters,
} from './events.schema';

export const eventsController = {
    async list(filters: EventQueryFilters) {
        return eventsService.list(db, filters);
    },

    async getById(id: string) {
        return eventsService.getById(db, id);
    },

    async create(user: { id: string }, data: CreateEventBody) {
        return eventsService.create(db, user.id, data);
    },

    async update(id: string, user: { id: string }, data: UpdateEventBody) {
        return eventsService.update(db, id, user.id, data);
    },

    async cancel(id: string, user: { id: string }, data: CancelEventBody) {
        return eventsService.cancel(db, id, user.id, data.reason);
    },

    async delete(id: string, user: { id: string }) {
        await eventsService.delete(db, id, user.id);
        return { success: true };
    },

    async getStatsByUserId(userId: string) {
        return eventsService.getStatsByUserId(db, userId);
    },
};
