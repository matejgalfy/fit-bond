import { db } from '../../db';
import { adminService } from './admin.service';
import { reportsService } from '../reports/reports.service';

import type {
    AdminUserQueryFilters,
    AdminEventQueryFilters,
    UpdateUserAdminBody,
} from './admin.schema';
import type {
    AdminReportQueryFilters,
    ResolveReportBody,
    RejectReportBody,
} from '../reports/reports.schema';

export const adminController = {
    async listUsers(filters: AdminUserQueryFilters) {
        return adminService.listUsers(db, filters);
    },

    async getUser(id: string) {
        return adminService.getUser(db, id);
    },

    async updateUser(id: string, data: UpdateUserAdminBody) {
        return adminService.updateUser(db, id, data);
    },

    async deleteUser(id: string, actor: { id: string }) {
        await adminService.deleteUser(db, id, actor.id);
        return { success: true };
    },

    async listEvents(filters: AdminEventQueryFilters) {
        return adminService.listEvents(db, filters);
    },

    async listReports(filters: AdminReportQueryFilters) {
        return reportsService.listForAdmin(db, filters);
    },

    async getReport(id: string) {
        return reportsService.getByIdForAdmin(db, id);
    },

    async resolveReport(
        id: string,
        actor: { id: string },
        data: ResolveReportBody
    ) {
        return reportsService.resolve(db, id, actor.id, data.resolution);
    },

    async rejectReport(
        id: string,
        actor: { id: string },
        data: RejectReportBody
    ) {
        return reportsService.reject(db, id, actor.id, data.resolution ?? null);
    },
};
