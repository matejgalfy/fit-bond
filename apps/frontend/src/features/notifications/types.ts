import { api } from '@/lib/api';

export type NotificationsGetData = Awaited<
    ReturnType<typeof api.notifications.get>
>['data'];

export type NotificationListResponse = Extract<
    NonNullable<NotificationsGetData>,
    unknown[]
>;

export type Notification = NotificationListResponse[number];
