import type { Database } from '../../db';
import { ServiceError } from '../../utils/errors';
import type { EventsService } from '../events/events.service';
import type { CommentsService } from '../comments/comments.service';
import type { UsersService } from '../users/users.service';
import { reportsModel as defaultModel } from './reports.model';
import type { ReportsModel } from './reports.model';
import type {
    AdminReportFilters,
    CreateReportInput,
    MyReportFilters,
} from './reports.types';

export interface ReportsServiceDeps {
    model?: ReportsModel;
    eventsService: Pick<EventsService, 'loadRaw'>;
    commentsService: Pick<CommentsService, 'loadRaw'>;
    usersService: Pick<UsersService, 'getNameById'>;
}

export function createReportsService({
    model = defaultModel,
    eventsService,
    commentsService,
    usersService,
}: ReportsServiceDeps) {
    return {
        async create(
            db: Database,
            reporterId: string,
            input: CreateReportInput
        ) {
            switch (input.reportType) {
                case 'event': {
                    const target = await eventsService.loadRaw(
                        db,
                        input.targetId
                    );
                    if (target.organizerId === reporterId) {
                        throw ServiceError.badRequest(
                            'Cannot report your own event'
                        );
                    }
                    break;
                }
                case 'comment': {
                    const target = await commentsService.loadRaw(
                        db,
                        input.targetId
                    );
                    if (target.userId === reporterId) {
                        throw ServiceError.badRequest(
                            'Cannot report your own comment'
                        );
                    }
                    break;
                }
                case 'user': {
                    if (input.targetId === reporterId) {
                        throw ServiceError.badRequest('Cannot report yourself');
                    }
                    const target = await usersService.getNameById(
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
            return transitionReport(db, id, 'resolved', adminId, resolution);
        },

        async reject(
            db: Database,
            id: string,
            adminId: string,
            resolution: string | null
        ) {
            return transitionReport(db, id, 'rejected', adminId, resolution);
        },
    };

    // Shared pending -> resolved/rejected transition with status guards.
    async function transitionReport(
        db: Database,
        id: string,
        status: 'resolved' | 'rejected',
        adminId: string,
        resolution: string | null
    ) {
        const existing = await model.findById(db, id);
        if (!existing) {
            throw ServiceError.notFound('Report not found');
        }
        if (existing.status !== 'pending') {
            throw ServiceError.conflict(`Report is already ${existing.status}`);
        }

        const updated = await model.updateStatus(
            db,
            id,
            status,
            adminId,
            resolution
        );
        if (!updated) {
            throw ServiceError.notFound('Report not found');
        }
        return updated;
    }
}

export type ReportsService = ReturnType<typeof createReportsService>;
