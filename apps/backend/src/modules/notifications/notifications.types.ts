import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import type { notifications } from '../../db/schema';
import type {
    NotificationQueryFilters,
    PaginationQueryFilters,
    UpdateNotificationBody,
} from './notifications.schema';

export type NotificationType = InferSelectModel<typeof notifications>;
export type NotificationFilters = NotificationQueryFilters;
export type PaginationFilters = PaginationQueryFilters;
export type UpdateNotificationInput = UpdateNotificationBody;

export type CreateNotificationInput = Pick<
    InferInsertModel<typeof notifications>,
    'userId' | 'type' | 'title' | 'message' | 'eventId' | 'relatedUserId'
>;
