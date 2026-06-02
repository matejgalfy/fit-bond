import { Elysia } from 'elysia';
import type { ReportsService } from './reports.service';
import { db } from '../../db';
import {
    createReportBody,
    myReportsQuery,
    adminReportQueryFilters,
    reportIdParam,
    resolveReportBody,
    rejectReportBody,
} from './reports.schema';
import { handleServiceError } from '../../utils/error-handler';
import { authLayer } from '../../auth_middleware';
import { adminLayer } from '../../admin_middleware';

export function createReportsRoutes(reportsService: ReportsService) {
    return new Elysia({ prefix: '/reports' })
        .use(authLayer)
        .onError(handleServiceError)
        .post(
            '/',
            ({ user, body }) => reportsService.create(db, user.id, body),
            {
                auth: true,
                body: createReportBody,
                detail: {
                    tags: ['Reports'],
                    summary: 'Submit a report',
                    description:
                        'Submit a moderation report against an event, comment, or another user. The same reporter cannot file multiple pending reports against the same target.',
                },
            }
        )
        .get(
            '/me',
            ({ user, query }) => reportsService.listMine(db, user.id, query),
            {
                auth: true,
                query: myReportsQuery,
                detail: {
                    tags: ['Reports'],
                    summary: 'List my reports',
                    description:
                        'Retrieve a paginated list of reports submitted by the authenticated user, optionally filtered by status.',
                },
            }
        );
}

export function createReportsAdminRoutes(reportsService: ReportsService) {
    return new Elysia({ prefix: '/admin/reports' })
        .use(adminLayer)
        .onError(handleServiceError)
        .guard({ admin: true }, (app) =>
            app
                .get(
                    '/',
                    ({ query }) => reportsService.listForAdmin(db, query),
                    {
                        query: adminReportQueryFilters,
                        detail: {
                            tags: ['Admin'],
                            summary: 'List reports (admin)',
                            description:
                                'List moderation reports with optional filtering by status, type, and reporter.',
                        },
                    }
                )
                .get(
                    '/:id',
                    ({ params }) =>
                        reportsService.getByIdForAdmin(db, params.id),
                    {
                        params: reportIdParam,
                        detail: {
                            tags: ['Admin'],
                            summary: 'Get report by ID (admin)',
                            description:
                                'Retrieve a single report including its target reference, reason, and resolution metadata.',
                        },
                    }
                )
                .post(
                    '/:id/resolve',
                    ({ params, user, body }) =>
                        reportsService.resolve(
                            db,
                            params.id,
                            user.id,
                            body.resolution
                        ),
                    {
                        params: reportIdParam,
                        body: resolveReportBody,
                        detail: {
                            tags: ['Admin'],
                            summary: 'Resolve report',
                            description:
                                'Mark a pending report as resolved with a required resolution note. Returns 409 if the report is no longer pending.',
                        },
                    }
                )
                .post(
                    '/:id/reject',
                    ({ params, user, body }) =>
                        reportsService.reject(
                            db,
                            params.id,
                            user.id,
                            body.resolution ?? null
                        ),
                    {
                        params: reportIdParam,
                        body: rejectReportBody,
                        detail: {
                            tags: ['Admin'],
                            summary: 'Reject report',
                            description:
                                'Mark a pending report as rejected with an optional resolution note. Returns 409 if the report is no longer pending.',
                        },
                    }
                )
        );
}
