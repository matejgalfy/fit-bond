import { useMemo, useState } from 'react';
import {
    Bell,
    HeartPulse,
    MessageCircle,
    UserPlus,
    XCircle,
    CheckCircle2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { createFileRoute } from '@tanstack/react-router';
import { cn } from '@/lib/utils';
import {
    NotificationsTabFilter,
    type NotificationTabValue,
} from '@/features/notifications/components/notifications-tab-filter';
import { MarkAllAsReadButton } from '@/features/notifications/components/mark-all-as-read-button';

export const Route = createFileRoute('/pages/notifications-page')({
    component: RouteComponent,
});

type NotificationType =
    | 'comment'
    | 'participant'
    | 'cancelled'
    | 'updated'
    | 'reply'
    | 'joined';

interface NotificationItem {
    id: number;
    type: NotificationType;
    title: string;
    description: string;
    time: string;
    createdAt: number;
    isUnread: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
    {
        id: 1,
        type: 'comment',
        title: 'New comment on your event',
        description:
            'Jana K. commented on Morning Run in the Park: "Can\'t wait for this!"',
        time: '2 hours ago',
        createdAt: 1713355200000,
        isUnread: true,
    },
    {
        id: 2,
        type: 'participant',
        title: 'New participant joined',
        description: 'Marek R. joined your event Morning Run in the Park.',
        time: '3 hours ago',
        createdAt: 1713351600000,
        isUnread: true,
    },
    {
        id: 3,
        type: 'cancelled',
        title: 'Event cancelled',
        description: 'Evening Cycling Group by Lucia D. has been cancelled.',
        time: '5 hours ago',
        createdAt: 1713344400000,
        isUnread: true,
    },
    {
        id: 4,
        type: 'updated',
        title: 'Event updated',
        description: 'John P. updated Friday Football Match to 7:00 PM.',
        time: '1 day ago',
        createdAt: 1713279600000,
        isUnread: false,
    },
    {
        id: 5,
        type: 'reply',
        title: 'Reply to your comment',
        description:
            'Eva M. replied to your comment on Morning Run in the Park.',
        time: '1 day ago',
        createdAt: 1713272400000,
        isUnread: false,
    },
    {
        id: 6,
        type: 'joined',
        title: 'You joined an event',
        description: 'You successfully joined Basketball 3v3 Tournament.',
        time: '2 days ago',
        createdAt: 1713193200000,
        isUnread: false,
    },
];

const notificationMeta: Record<
    NotificationType,
    {
        icon: LucideIcon;
        iconWrapClassName: string;
    }
> = {
    comment: {
        icon: MessageCircle,
        iconWrapClassName: 'bg-soft-blue text-primary-blue',
    },
    reply: {
        icon: MessageCircle,
        iconWrapClassName: 'bg-soft-blue text-primary-blue',
    },
    participant: {
        icon: UserPlus,
        iconWrapClassName: 'bg-soft-green text-primary-green',
    },
    cancelled: {
        icon: XCircle,
        iconWrapClassName: 'bg-soft-red text-primary-red',
    },
    updated: {
        icon: HeartPulse,
        iconWrapClassName: 'bg-soft-orange text-primary-orange',
    },
    joined: {
        icon: CheckCircle2,
        iconWrapClassName: 'bg-soft-green text-primary-green',
    },
};

function RouteComponent() {
    const [activeFilter, setActiveFilter] =
        useState<NotificationTabValue>('all');
    const [notifications, setNotifications] = useState<NotificationItem[]>(
        INITIAL_NOTIFICATIONS
    );

    const unreadCount = notifications.filter((item) => item.isUnread).length;
    const allCount = notifications.length;

    const sortedNotifications = useMemo(
        () => [...notifications].sort((a, b) => b.createdAt - a.createdAt),
        [notifications]
    );

    const visibleNotifications = useMemo(() => {
        if (activeFilter === 'unread') {
            return sortedNotifications.filter((item) => item.isUnread);
        }

        return sortedNotifications;
    }, [activeFilter, sortedNotifications]);

    const handleMarkAsRead = (id: number) => {
        setNotifications((current) =>
            current.map((item) =>
                item.id === id && item.isUnread
                    ? { ...item, isUnread: false }
                    : item
            )
        );
    };

    const handleMarkAllAsRead = () => {
        setNotifications((current) =>
            current.map((item) => ({ ...item, isUnread: false }))
        );
    };

    return (
        <div className="max-w-200 mx-auto">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="font-heading text-heading font-bold text-primary-text">
                        Notifications
                    </h1>

                    <div className="mt-5">
                        <NotificationsTabFilter
                            value={activeFilter}
                            counts={{
                                all: allCount,
                                unread: unreadCount,
                            }}
                            onValueChange={setActiveFilter}
                        />
                    </div>
                </div>

                <MarkAllAsReadButton
                    disabled={unreadCount === 0}
                    onClick={handleMarkAllAsRead}
                />
            </div>

            <div className="flex flex-col gap-2">
                {visibleNotifications.map((item) => {
                    const meta = notificationMeta[item.type];
                    const Icon = meta.icon;

                    return (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                                handleMarkAsRead(item.id);
                            }}
                            className={cn(
                                'relative w-full rounded-[12px] border bg-surface px-4 py-3.5 text-left transition-colors duration-200 cursor-pointer',
                                item.isUnread
                                    ? 'border-primary-blue/20'
                                    : 'border-outline',
                                'hover:bg-slate-50 dark:hover:bg-slate-700'
                            )}
                        >
                            <div className="flex items-center">
                                <div className="flex w-3.5 items-center justify-start">
                                    <span
                                        className={cn(
                                            'h-2 w-2 rounded-full transition-colors',
                                            item.isUnread
                                                ? 'bg-primary-blue'
                                                : 'bg-transparent'
                                        )}
                                    />
                                </div>

                                <div
                                    className={cn(
                                        'flex h-11 w-11 mr-4.5 shrink-0 items-center justify-center rounded-xl',
                                        meta.iconWrapClassName
                                    )}
                                >
                                    <Icon size={20} />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <h2
                                        className={cn(
                                            'font-subheading text-regular text-primary-text',
                                            item.isUnread && 'font-bold'
                                        )}
                                    >
                                        {item.title}
                                    </h2>
                                    <p className="mt-0.5 text-small leading-5 text-secondary-text">
                                        {item.description}
                                    </p>
                                    <p className="mt-1 text-tiny text-tertiary-text">
                                        {item.time}
                                    </p>
                                </div>
                            </div>
                        </button>
                    );
                })}

                {visibleNotifications.length === 0 ? (
                    <div className="rounded-[14px] border border-outline bg-surface px-5 py-10 text-center">
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
                ) : null}
            </div>
        </div>
    );
}
