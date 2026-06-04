import { api } from '@/lib/api';
import { throwIfError } from '@/lib/api-error';
import type {
    NotificationQueryFilters,
    PaginationQueryFilters,
    UpdateNotificationBody,
} from '../../../../../backend/src/modules/notifications/notifications.schema';

export const notificationQueryKeys = {
    all: ['notifications'] as const,
    lists: () => [...notificationQueryKeys.all, 'list'] as const,
    list: (filters?: NotificationQueryFilters) =>
        [...notificationQueryKeys.lists(), filters ?? null] as const,
    unread: () => [...notificationQueryKeys.all, 'unread'] as const,
    unreadCount: () => [...notificationQueryKeys.all, 'unread-count'] as const,
};

export async function listNotifications(filters?: NotificationQueryFilters) {
    const { data, error } = await api.notifications.get({ query: filters });
    throwIfError(error, 'Failed to fetch notifications');
    return data;
}

export async function listUnreadNotifications(
    filters?: PaginationQueryFilters
) {
    const { data, error } = await api.notifications.unread.get({
        query: filters,
    });
    throwIfError(error, 'Failed to fetch unread notifications');
    return data;
}

export async function getUnreadNotificationsCount() {
    const { data, error } = await api.notifications['unread-count'].get();
    throwIfError(error, 'Failed to fetch unread notifications count');
    return data;
}

export async function updateNotification(
    id: string,
    body: UpdateNotificationBody
) {
    const { data, error } = await api.notifications({ id }).patch(body);
    throwIfError(error, 'Failed to update notification');
    return data;
}

export async function markNotificationRead(id: string) {
    const { data, error } = await api.notifications({ id }).read.post();
    throwIfError(error, 'Failed to mark notification as read');
    return data;
}

export async function markAllNotificationsRead() {
    const { data, error } = await api.notifications['mark-all-read'].post();
    throwIfError(error, 'Failed to mark all notifications as read');
    return data;
}

export async function deleteNotification(id: string) {
    const { data, error } = await api.notifications({ id }).delete();
    throwIfError(error, 'Failed to delete notification');
    return data;
}
