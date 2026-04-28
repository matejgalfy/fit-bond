import { db } from '../../db';
import { sportsService } from './sports.service';

import type { CreateSportBody } from './sports.schema';

export const sportsController = {
    async list() {
        return sportsService.list(db);
    },

    async getById(id: string) {
        return sportsService.getById(db, id);
    },

    async create(data: CreateSportBody) {
        return sportsService.create(db, data);
    },

    async delete(id: string) {
        await sportsService.delete(db, id);
        return { success: true };
    },
};
