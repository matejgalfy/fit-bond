import { and, desc, eq, isNull, sql } from 'drizzle-orm';
import { DEFAULT_PAGE_SIZE, DEFAULT_OFFSET } from '../../utils/pagination';
import type { Database } from '../../db';
import { firstOrNull, firstOrThrow } from '../../utils/query';
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

// The event a report points at, so admins can open it: an event report's target
// is the event itself; a comment report resolves to the event it lives on.
const targetEventIdSql = sql<string | null>`
    CASE ${reports.reportType}::text
        WHEN 'event' THEN ${reports.targetId}
        WHEN 'comment' THEN (SELECT c2.event_id::text FROM comments c2 WHERE c2.id::text = ${reports.targetId} LIMIT 1)
        ELSE NULL
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
    targetEventId: targetEventIdSql.as('target_event_id'),
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

        return firstOrThrow(results, 'Failed to create report');
    },

    async findById(db: Database, id: string) {
        const results = await db
            .select()
            .from(reports)
            .where(and(eq(reports.id, id), isNull(reports.deletedAt)));
        return firstOrNull(results);
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
        return firstOrNull(results);
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

        const limit = filters.limit ?? DEFAULT_PAGE_SIZE;
        const offset = filters.offset ?? DEFAULT_OFFSET;

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

        const limit = filters.limit ?? DEFAULT_PAGE_SIZE;
        const offset = filters.offset ?? DEFAULT_OFFSET;

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
        return firstOrNull(results);
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
        return firstOrNull(results);
    },
};

export type ReportsModel = typeof reportsModel;
