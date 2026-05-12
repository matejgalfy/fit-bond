import { db } from '../../db';
import { reportsService } from './reports.service';

import type { CreateReportBody, MyReportsQuery } from './reports.schema';

export const reportsController = {
    async create(user: { id: string }, data: CreateReportBody) {
        return reportsService.create(db, user.id, data);
    },

    async listMine(user: { id: string }, filters: MyReportsQuery) {
        return reportsService.listMine(db, user.id, filters);
    },
};
