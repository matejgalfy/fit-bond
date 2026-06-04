import { Elysia } from 'elysia';
import type { NotificationsService } from './notifications.service';
import { db } from '../../db';
import {
    notificationQueryFilters,
    paginationQueryFilters,
    updateNotificationBody,
    notificationIdParam,
} from './notifications.schema';
import { handleServiceError } from '../../utils/error-handler';
import { authLayer } from '../../auth_middleware';

export function createNotificationsRoutes(
    notificationsService: NotificationsService
) {
    return new Elysia({ prefix: '/notifications' })
        .use(authLayer)
        .onError(handleServiceError)
        .get(
            '/',
            ({ query, user }) => notificationsService.list(db, user.id, query),
            {
                auth: true,
                query: notificationQueryFilters,
                detail: {
                    tags: ['Notifications'],
                    summary: 'List notifications',
                    description:
                        'Retrieve notifications for the authenticated user. Optionally filter by type.',
                },
            }
        )
        .get(
            '/unread',
            ({ query, user }) =>
                notificationsService.listUnread(db, user.id, query),
            {
                auth: true,
                query: paginationQueryFilters,
                detail: {
                    tags: ['Notifications'],
                    summary: 'List unread notifications',
                    description:
                        'Retrieve only unread notifications for the authenticated user.',
                },
            }
        )
        .get(
            '/unread-count',
            async ({ user }) => {
                const count = await notificationsService.getUnreadCount(
                    db,
                    user.id
                );
                return { count };
            },
            {
                auth: true,
                detail: {
                    tags: ['Notifications'],
                    summary: 'Get unread notification count',
                    description:
                        'Retrieve the count of unread notifications for the authenticated user.',
                },
            }
        )
        .post(
            '/mark-all-read',
            ({ user }) => notificationsService.markAllRead(db, user.id),
            {
                auth: true,
                detail: {
                    tags: ['Notifications'],
                    summary: 'Mark all notifications as read',
                    description:
                        'Mark all unread notifications as read for the authenticated user.',
                },
            }
        )
        .post(
            '/:id/read',
            ({ params, user }) =>
                notificationsService.markRead(db, params.id, user.id),
            {
                auth: true,
                params: notificationIdParam,
                detail: {
                    tags: ['Notifications'],
                    summary: 'Mark notification as read',
                    description: 'Mark a specific notification as read.',
                },
            }
        )
        .patch(
            '/:id',
            ({ params, user, body }) =>
                notificationsService.update(
                    db,
                    params.id,
                    user.id,
                    body.isRead
                ),
            {
                auth: true,
                params: notificationIdParam,
                body: updateNotificationBody,
                detail: {
                    tags: ['Notifications'],
                    summary: 'Update notification read state',
                    description:
                        'Update the read/unread state of a notification.',
                },
            }
        )
        .delete(
            '/:id',
            ({ params, user }) =>
                notificationsService.delete(db, params.id, user.id),
            {
                auth: true,
                params: notificationIdParam,
                detail: {
                    tags: ['Notifications'],
                    summary: 'Delete notification',
                    description: 'Soft-delete a notification.',
                },
            }
        );
}
