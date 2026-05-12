import { t } from 'elysia';

export const reportTypeSchema = t.Union([
    t.Literal('user'),
    t.Literal('event'),
    t.Literal('comment'),
]);

export const reportStatusSchema = t.Union([
    t.Literal('pending'),
    t.Literal('resolved'),
    t.Literal('rejected'),
]);

export const createReportBody = t.Object({
    reportType: reportTypeSchema,
    targetId: t.String({ minLength: 1, maxLength: 100 }),
    reason: t.String({ minLength: 1, maxLength: 1000 }),
});

export const reportIdParam = t.Object({
    id: t.String({ format: 'uuid' }),
});

export const myReportsQuery = t.Object({
    status: t.Optional(reportStatusSchema),
    limit: t.Optional(t.Integer({ minimum: 1, maximum: 100 })),
    offset: t.Optional(t.Integer({ minimum: 0 })),
});

export const adminReportQueryFilters = t.Object({
    status: t.Optional(reportStatusSchema),
    reportType: t.Optional(reportTypeSchema),
    reporterId: t.Optional(t.String()),
    limit: t.Optional(t.Integer({ minimum: 1, maximum: 100 })),
    offset: t.Optional(t.Integer({ minimum: 0 })),
});

export const resolveReportBody = t.Object({
    resolution: t.String({ minLength: 1, maxLength: 1000 }),
});

export const rejectReportBody = t.Object({
    resolution: t.Optional(t.String({ maxLength: 1000 })),
});

export type CreateReportBody = typeof createReportBody.static;
export type MyReportsQuery = typeof myReportsQuery.static;
export type AdminReportQueryFilters = typeof adminReportQueryFilters.static;
export type ResolveReportBody = typeof resolveReportBody.static;
export type RejectReportBody = typeof rejectReportBody.static;
