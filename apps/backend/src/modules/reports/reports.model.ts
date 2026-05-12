import { and, desc, eq, isNull, sql } from 'drizzle-orm';
import type { Database } from '../../db';
import { reports, user } from '../../db/schema';
import type {
    AdminReportFilters,
    CreateReportInput,
    MyReportFilters,
    ReportStatus,
    ReportType,
} from './reports.types';

const targetLabelSql = sql<string | null>`
    CASE ${reports.reportType}::text
        WHEN 'event' THEN (SELECT e2.name FROM events e2 WHERE e2.id::text = ${reports.targetId} LIMIT 1)
        WHEN 'user' THEN (SELECT u2.name FROM "user" u2 WHERE u2.id = ${reports.targetId} LIMIT 1)
        WHEN 'comment' THEN (SELECT c2.content FROM comments c2 WHERE c2.id::text = ${reports.targetId} LIMIT 1)
    END
`;

const adminReportSelection = {
    id: reports.id,
    reporterId: reports.reporterId,
    reportType: reports.reportType,
    targetId: reports.targetId,
    reason: reports.reason,
    status: reports.status,
    resolvedBy: reports.resolvedBy,
    resolution: reports.resolution,
    createdAt: reports.createdAt,
    deletedAt: reports.deletedAt,
    reporterName: user.name,
    targetLabel: targetLabelSql.as('target_label'),
};

export const reportsModel = {
    async create(db: Database, reporterId: string, input: CreateReportInput) {
        const results = await db
            .insert(reports)
            .values({
                reporterId,
                reportType: input.reportType,
                targetId: input.targetId,
                reason: input.reason,
                status: 'pending',
            })
            .returning();

        if (results.length === 0) {
            throw new Error('Failed to create report');
        }
        return results[0];
    },

    async findById(db: Database, id: string) {
        const results = await db
            .select()
            .from(reports)
            .where(and(eq(reports.id, id), isNull(reports.deletedAt)));
        if (results.length === 0) return null;
        return results[0];
    },

    async findPendingDuplicate(
        db: Database,
        reporterId: string,
        reportType: ReportType,
        targetId: string
    ) {
        const results = await db
            .select()
            .from(reports)
            .where(
                and(
                    eq(reports.reporterId, reporterId),
                    eq(reports.reportType, reportType),
                    eq(reports.targetId, targetId),
                    eq(reports.status, 'pending'),
                    isNull(reports.deletedAt)
                )
            );
        if (results.length === 0) return null;
        return results[0];
    },

    async findManyByReporter(
        db: Database,
        reporterId: string,
        filters: MyReportFilters
    ) {
        const conditions = [
            eq(reports.reporterId, reporterId),
            isNull(reports.deletedAt),
        ];
        if (filters.status) {
            conditions.push(eq(reports.status, filters.status));
        }

        const limit = filters.limit ?? 20;
        const offset = filters.offset ?? 0;

        return db
            .select()
            .from(reports)
            .where(and(...conditions))
            .orderBy(desc(reports.createdAt))
            .limit(limit)
            .offset(offset);
    },

    async findManyForAdmin(db: Database, filters: AdminReportFilters) {
        const conditions = [isNull(reports.deletedAt)];
        if (filters.status) {
            conditions.push(eq(reports.status, filters.status));
        }
        if (filters.reportType) {
            conditions.push(eq(reports.reportType, filters.reportType));
        }
        if (filters.reporterId) {
            conditions.push(eq(reports.reporterId, filters.reporterId));
        }

        const limit = filters.limit ?? 20;
        const offset = filters.offset ?? 0;

        return db
            .select(adminReportSelection)
            .from(reports)
            .leftJoin(user, eq(user.id, reports.reporterId))
            .where(and(...conditions))
            .orderBy(desc(reports.createdAt))
            .limit(limit)
            .offset(offset);
    },

    async findByIdForAdmin(db: Database, id: string) {
        const results = await db
            .select(adminReportSelection)
            .from(reports)
            .leftJoin(user, eq(user.id, reports.reporterId))
            .where(and(eq(reports.id, id), isNull(reports.deletedAt)));
        if (results.length === 0) return null;
        return results[0];
    },

    async updateStatus(
        db: Database,
        id: string,
        status: ReportStatus,
        resolvedBy: string,
        resolution: string | null
    ) {
        const results = await db
            .update(reports)
            .set({
                status,
                resolvedBy,
                resolution,
            })
            .where(and(eq(reports.id, id), isNull(reports.deletedAt)))
            .returning();
        if (results.length === 0) return null;
        return results[0];
    },
};

export type ReportsModel = typeof reportsModel;
