import {
    HeartPulse,
    MessageCircle,
    UserPlus,
    XCircle,
    CheckCircle2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { timeAgo } from '@/lib/utils';
import type { Notification } from '../types';

const notificationMeta: Record<
    Notification['type'],
    { icon: LucideIcon; iconWrapClassName: string }
> = {
    comment: {
        icon: MessageCircle,
        iconWrapClassName: 'bg-soft-blue text-primary-blue',
    },
    interest: {
        icon: CheckCircle2,
        iconWrapClassName: 'bg-soft-green text-primary-green',
    },
    participant_joined: {
        icon: UserPlus,
        iconWrapClassName: 'bg-soft-green text-primary-green',
    },
    event_cancelled: {
        icon: XCircle,
        iconWrapClassName: 'bg-soft-red text-primary-red',
    },
    event_update: {
        icon: HeartPulse,
        iconWrapClassName: 'bg-soft-orange text-primary-orange',
    },
};

interface NotificationItemProps {
    notification: Notification;
    onRead: (_: string) => void;
    onOpen: (_: Notification) => void;
}

export function NotificationItem({
    notification,
    onRead,
    onOpen,
}: NotificationItemProps) {
    const meta = notificationMeta[notification.type];
    const Icon = meta.icon;

    return (
        <button
            type="button"
            onClick={() => {
                if (!notification.isRead) {
                    onRead(notification.id);
                }
                onOpen(notification);
            }}
            className={cn(
                'relative w-full rounded-xl border bg-surface px-4 py-3.5 text-left transition-colors duration-200 cursor-pointer',
                !notification.isRead
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
                            !notification.isRead
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
                            !notification.isRead && 'font-bold'
                        )}
                    >
                        {notification.title}
                    </h2>
                    <p className="mt-0.5 text-small leading-5 text-secondary-text">
                        {notification.message}
                    </p>
                    <p className="mt-1 text-tiny text-tertiary-text">
                        {timeAgo(new Date(notification.createdAt))}
                    </p>
                </div>
            </div>
        </button>
    );
}
