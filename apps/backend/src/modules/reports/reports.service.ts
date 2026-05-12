import type { Database } from '../../db';
import { ServiceError } from '../../utils/errors';
import { eventsModel as defaultEventsModel } from '../events/events.model';
import type { EventsModel } from '../events/events.model';
import { commentsModel as defaultCommentsModel } from '../comments/comments.model';
import type { CommentsModel } from '../comments/comments.model';
import { adminModel as defaultAdminModel } from '../admin/admin.model';
import type { AdminModel } from '../admin/admin.model';
import { reportsModel as defaultModel } from './reports.model';
import type { ReportsModel } from './reports.model';
import type {
    AdminReportFilters,
    CreateReportInput,
    MyReportFilters,
} from './reports.types';

export interface ReportsServiceDeps {
    model?: ReportsModel;
    eventsModel?: Pick<EventsModel, 'findRawById'>;
    commentsModel?: Pick<CommentsModel, 'findRawById'>;
    adminModel?: Pick<AdminModel, 'findUserById'>;
}

export function createReportsService({
    model = defaultModel,
    eventsModel = defaultEventsModel,
    commentsModel = defaultCommentsModel,
    adminModel = defaultAdminModel,
}: ReportsServiceDeps = {}) {
    return {
        async create(
            db: Database,
            reporterId: string,
            input: CreateReportInput
        ) {
            switch (input.reportType) {
                case 'event': {
                    const target = await eventsModel.findRawById(
                        db,
                        input.targetId
                    );
                    if (!target) {
                        throw ServiceError.notFound('Event not found');
                    }
                    break;
                }
                case 'comment': {
                    const target = await commentsModel.findRawById(
                        db,
                        input.targetId
                    );
                    if (!target) {
                        throw ServiceError.notFound('Comment not found');
                    }
                    break;
                }
                case 'user': {
                    if (input.targetId === reporterId) {
                        throw ServiceError.badRequest('Cannot report yourself');
                    }
                    const target = await adminModel.findUserById(
                        db,
                        input.targetId
                    );
                    if (!target) {
                        throw ServiceError.notFound('User not found');
                    }
                    break;
                }
            }

            const duplicate = await model.findPendingDuplicate(
                db,
                reporterId,
                input.reportType,
                input.targetId
            );
            if (duplicate) {
                throw ServiceError.conflict(
                    'You already have a pending report for this target'
                );
            }

            return model.create(db, reporterId, input);
        },

        async getById(db: Database, id: string) {
            const report = await model.findById(db, id);
            if (!report) {
                throw ServiceError.notFound('Report not found');
            }
            return report;
        },

        async getByIdForAdmin(db: Database, id: string) {
            const report = await model.findByIdForAdmin(db, id);
            if (!report) {
                throw ServiceError.notFound('Report not found');
            }
            return report;
        },

        async listMine(
            db: Database,
            reporterId: string,
            filters: MyReportFilters
        ) {
            return model.findManyByReporter(db, reporterId, filters);
        },

        async listForAdmin(db: Database, filters: AdminReportFilters) {
            return model.findManyForAdmin(db, filters);
        },

        async resolve(
            db: Database,
            id: string,
            adminId: string,
            resolution: string
        ) {
            const existing = await model.findById(db, id);
            if (!existing) {
                throw ServiceError.notFound('Report not found');
            }
            if (existing.status !== 'pending') {
                throw ServiceError.conflict(
                    `Report is already ${existing.status}`
                );
            }

            const updated = await model.updateStatus(
                db,
                id,
                'resolved',
                adminId,
                resolution
            );
            if (!updated) {
                throw ServiceError.notFound('Report not found');
            }
            return updated;
        },

        async reject(
            db: Database,
            id: string,
            adminId: string,
            resolution: string | null
        ) {
            const existing = await model.findById(db, id);
            if (!existing) {
                throw ServiceError.notFound('Report not found');
            }
            if (existing.status !== 'pending') {
                throw ServiceError.conflict(
                    `Report is already ${existing.status}`
                );
            }

            const updated = await model.updateStatus(
                db,
                id,
                'rejected',
                adminId,
                resolution
            );
            if (!updated) {
                throw ServiceError.notFound('Report not found');
            }
            return updated;
        },
    };
}

export const reportsService = createReportsService();
export type ReportsService = ReturnType<typeof createReportsService>;
