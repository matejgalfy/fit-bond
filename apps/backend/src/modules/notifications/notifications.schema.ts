import { t } from 'elysia';
import { limitQuerySchema, offsetQuerySchema } from '../../utils/pagination';

const notificationTypeUnion = t.Union([
    t.Literal('event_update'),
    t.Literal('event_cancelled'),
    t.Literal('participant_joined'),
    t.Literal('comment'),
    t.Literal('interest'),
]);

export const selectNotificationSchema = t.Object({
    id: t.String({ format: 'uuid' }),
    userId: t.String(),
    type: notificationTypeUnion,
    title: t.String(),
    message: t.String(),
    eventId: t.Optional(t.Union([t.String({ format: 'uuid' }), t.Null()])),
    relatedUserId: t.Optional(t.Union([t.String(), t.Null()])),
    isRead: t.Boolean(),
    readAt: t.Optional(t.Union([t.Date(), t.Null()])),
    createdAt: t.Date(),
});

export const notificationQueryFilters = t.Object({
    type: t.Optional(notificationTypeUnion),
    limit: limitQuerySchema,
    offset: offsetQuerySchema,
});

export const paginationQueryFilters = t.Object({
    limit: limitQuerySchema,
    offset: offsetQuerySchema,
});

export const updateNotificationBody = t.Object({
    isRead: t.Boolean(),
});

export const notificationIdParam = t.Object({
    id: t.String({ format: 'uuid' }),
});

export type NotificationQueryFilters = typeof notificationQueryFilters.static;
export type PaginationQueryFilters = typeof paginationQueryFilters.static;
export type UpdateNotificationBody = typeof updateNotificationBody.static;
