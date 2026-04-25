import { Elysia } from 'elysia';
import { notificationsController } from './notifications.controller';
import {
    notificationQueryFilters,
    paginationQueryFilters,
    updateNotificationBody,
    notificationIdParam,
} from './notifications.schema';
import { handleServiceError } from '../../utils/error-handler';
import { authLayer } from '../../auth_middleware';

export const notificationsRoutes = new Elysia({ prefix: '/notifications' })
    .use(authLayer)
    .onError(handleServiceError)
    .get(
        '/',
        ({ query, user }) => notificationsController.list(user.id, query),
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
        ({ query, user }) => notificationsController.listUnread(user.id, query),
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
    .post(
        '/mark-all-read',
        ({ user }) => notificationsController.markAllRead(user),
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
        ({ params, user }) => notificationsController.markRead(params.id, user),
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
            notificationsController.update(params.id, user, body),
        {
            auth: true,
            params: notificationIdParam,
            body: updateNotificationBody,
            detail: {
                tags: ['Notifications'],
                summary: 'Update notification read state',
                description: 'Update the read/unread state of a notification.',
            },
        }
    )
    .delete(
        '/:id',
        ({ params, user }) => notificationsController.delete(params.id, user),
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
