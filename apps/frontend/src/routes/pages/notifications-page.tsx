import { useMemo, useState } from 'react';
import { Bell } from 'lucide-react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import {
    NotificationsTabFilter,
    type NotificationTabValue,
} from '@/features/notifications/components/notifications-tab-filter';
import { MarkAllAsReadButton } from '@/features/notifications/components/mark-all-as-read-button';
import { NotificationItem } from '@/features/notifications/components/notification-item';
import type { Notification } from '@/features/notifications/types';
import {
    useMarkAllNotificationsRead,
    useMarkNotificationRead,
    useNotifications,
} from '@/features/notifications/hooks/notifications';

export const Route = createFileRoute('/pages/notifications-page')({
    component: RouteComponent,
});

function RouteComponent() {
    const [activeFilter, setActiveFilter] =
        useState<NotificationTabValue>('all');

    const navigate = useNavigate();
    const { data: notifications = [] } = useNotifications();
    const markRead = useMarkNotificationRead();
    const markAllRead = useMarkAllNotificationsRead();

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    // Every notification references the event it concerns, so opening one
    // navigates to that event's detail page. Comment notifications also carry
    // the comment id, so the event page can scroll to and highlight it.
    const openNotification = (notification: Notification) => {
        if (!notification.eventId) return;
        void navigate({
            to: '/pages/event-detail-page',
            search: {
                eventId: notification.eventId,
                ...(notification.commentId
                    ? { commentId: notification.commentId }
                    : {}),
            },
        });
    };

    const visibleNotifications = useMemo(() => {
        const sorted = [...notifications].sort(
            (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
        );
        if (activeFilter === 'unread') {
            return sorted.filter((n) => !n.isRead);
        }
        return sorted;
    }, [notifications, activeFilter]);

    return (
        <div className="max-w-200">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="font-heading text-heading font-bold text-primary-text">
                        Notifications
                    </h1>

                    <div className="mt-5">
                        <NotificationsTabFilter
                            value={activeFilter}
                            counts={{
                                all: notifications.length,
                                unread: unreadCount,
                            }}
                            onValueChange={setActiveFilter}
                        />
                    </div>
                </div>

                <MarkAllAsReadButton
                    disabled={unreadCount === 0 || markAllRead.isPending}
                    onClick={() => {
                        markAllRead.mutate();
                    }}
                />
            </div>

            <div className="flex flex-col gap-2">
                {visibleNotifications.map((item) => (
                    <NotificationItem
                        key={item.id}
                        notification={item}
                        onRead={(id) => {
                            markRead.mutate(id);
                        }}
                        onOpen={openNotification}
                    />
                ))}

                {visibleNotifications.length === 0 && (
                    <div className="rounded-2xl border border-outline bg-surface px-5 py-10 text-center">
                        <Bell
                            size={36}
                            className="mx-auto mb-2 text-secondary-text"
                        />
                        <h3 className="mb-1 text-subheading font-semibold text-primary-text">
                            No notifications
                        </h3>
                        <p className="text-small text-secondary-text">
                            You're all caught up!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
