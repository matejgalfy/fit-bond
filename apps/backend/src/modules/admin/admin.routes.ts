import { Elysia } from 'elysia';
import { adminController } from './admin.controller';
import {
    adminUserIdParam,
    adminUserQueryFilters,
    adminEventQueryFilters,
    banUserBody,
    updateUserAdminBody,
} from './admin.schema';
import {
    adminReportQueryFilters,
    reportIdParam,
    resolveReportBody,
    rejectReportBody,
} from '../reports/reports.schema';
import { handleServiceError } from '../../utils/error-handler';
import { authLayer } from '../../auth_middleware';
import { ServiceError } from '../../utils/errors';

export const adminRoutes = new Elysia({ prefix: '/admin' })
    .use(authLayer)
    .onError(handleServiceError)
    .guard(
        {
            auth: true,
            beforeHandle: (ctx) => {
                const role = (ctx as { user?: { role?: string } }).user?.role;
                if (role !== 'admin') {
                    throw ServiceError.forbidden('Admin only');
                }
            },
        },
        (app) =>
            app
                .get(
                    '/users',
                    ({ query }) => adminController.listUsers(query),
                    {
                        query: adminUserQueryFilters,
                        detail: {
                            tags: ['Admin'],
                            summary: 'Search users (admin)',
                            description:
                                'Search and list users with optional filtering by name/email, role, ban status, and inclusion of soft-deleted accounts.',
                        },
                    }
                )
                .get(
                    '/users/:id',
                    ({ params }) => adminController.getUser(params.id),
                    {
                        params: adminUserIdParam,
                        detail: {
                            tags: ['Admin'],
                            summary: 'Get user by ID (admin)',
                            description:
                                'Retrieve the full user record including ban reason, soft-delete state, and timestamps.',
                        },
                    }
                )
                .patch(
                    '/users/:id',
                    ({ params, body }) =>
                        adminController.updateUser(params.id, body),
                    {
                        params: adminUserIdParam,
                        body: updateUserAdminBody,
                        detail: {
                            tags: ['Admin'],
                            summary: 'Update user (admin)',
                            description:
                                'Edit name, bio, image, or role of any user.',
                        },
                    }
                )
                .post(
                    '/users/:id/ban',
                    ({ params, body }) =>
                        adminController.banUser(params.id, body),
                    {
                        params: adminUserIdParam,
                        body: banUserBody,
                        detail: {
                            tags: ['Admin'],
                            summary: 'Ban a user',
                            description:
                                'Permanently ban a user by setting their banned reason. Returns 409 if the user is already banned.',
                        },
                    }
                )
                .post(
                    '/users/:id/unban',
                    ({ params }) => adminController.unbanUser(params.id),
                    {
                        params: adminUserIdParam,
                        detail: {
                            tags: ['Admin'],
                            summary: 'Unban a user',
                            description:
                                'Clear the banned reason from a user, reinstating their access. Returns 409 if the user is not banned.',
                        },
                    }
                )
                .delete(
                    '/users/:id',
                    ({ params, user }) =>
                        adminController.deleteUser(params.id, user),
                    {
                        params: adminUserIdParam,
                        detail: {
                            tags: ['Admin'],
                            summary: 'Delete user (admin)',
                            description:
                                'Soft-delete a user account. Admins cannot delete their own account.',
                        },
                    }
                )
                .get(
                    '/events',
                    ({ query }) => adminController.listEvents(query),
                    {
                        query: adminEventQueryFilters,
                        detail: {
                            tags: ['Admin'],
                            summary: 'Search events (admin)',
                            description:
                                'Search all events including private, cancelled, and soft-deleted records by default. Use the include* flags to narrow results.',
                        },
                    }
                )
                .get(
                    '/reports',
                    ({ query }) => adminController.listReports(query),
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
                    '/reports/:id',
                    ({ params }) => adminController.getReport(params.id),
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
                    '/reports/:id/resolve',
                    ({ params, user, body }) =>
                        adminController.resolveReport(params.id, user, body),
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
                    '/reports/:id/reject',
                    ({ params, user, body }) =>
                        adminController.rejectReport(params.id, user, body),
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
