import { Elysia } from 'elysia';
import type { AdminService } from './admin.service';
import { db } from '../../db';
import {
    adminUserIdParam,
    adminUserQueryFilters,
    adminEventQueryFilters,
    updateUserAdminBody,
} from './admin.schema';
import { handleServiceError } from '../../utils/error-handler';
import { adminLayer } from '../../admin_middleware';

export function createAdminRoutes(adminService: AdminService) {
    return new Elysia({ prefix: '/admin' })
        .use(adminLayer)
        .onError(handleServiceError)
        .guard({ admin: true }, (app) =>
            app
                .get(
                    '/users',
                    ({ query }) => adminService.listUsers(db, query),
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
                    ({ params }) => adminService.getUser(db, params.id),
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
                        adminService.updateUser(db, params.id, body),
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
                .delete(
                    '/users/:id',
                    ({ params, user }) =>
                        adminService.deleteUser(db, params.id, user.id),
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
                    ({ query }) => adminService.listEvents(db, query),
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
        );
}
