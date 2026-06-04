import {
    keepPreviousData,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';
import type { NotificationQueryFilters } from '../../../../../backend/src/modules/notifications/notifications.schema';
import type { Notification } from '../types';
import {
    deleteNotification,
    listNotifications,
    listUnreadNotifications,
    getUnreadNotificationsCount,
    markAllNotificationsRead,
    markNotificationRead,
    notificationQueryKeys,
    updateNotification,
} from '../api/notifications-api';

export function useNotifications(filters?: NotificationQueryFilters) {
    return useQuery<Notification[]>({
        queryKey: notificationQueryKeys.list(filters),
        queryFn: () => listNotifications(filters),
        placeholderData: keepPreviousData,
    });
}

export function useUnreadNotifications() {
    return useQuery<Notification[]>({
        queryKey: notificationQueryKeys.unread(),
        queryFn: () => listUnreadNotifications(),
    });
}

export function useUnreadNotificationsCount() {
    return useQuery<{ count: number }>({
        queryKey: notificationQueryKeys.unreadCount(),
        queryFn: () => getUnreadNotificationsCount(),
        refetchInterval: 30000,
    });
}

export function useUpdateNotification() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, isRead }: { id: string; isRead: boolean }) =>
            updateNotification(id, { isRead }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: notificationQueryKeys.all,
            });
        },
    });
}

export function useMarkNotificationRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => markNotificationRead(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: notificationQueryKeys.all,
            });
        },
    });
}

export function useMarkAllNotificationsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => markAllNotificationsRead(),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: notificationQueryKeys.all,
            });
        },
    });
}

export function useDeleteNotification() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deleteNotification(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: notificationQueryKeys.all,
            });
        },
    });
}
