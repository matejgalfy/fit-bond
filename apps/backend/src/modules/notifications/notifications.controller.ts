import { db } from '../../db';
import { notificationsService } from './notifications.service';
import type {
    NotificationQueryFilters,
    PaginationQueryFilters,
    UpdateNotificationBody,
} from './notifications.schema';

export const notificationsController = {
    async list(userId: string, filters: NotificationQueryFilters) {
        return notificationsService.list(db, userId, filters);
    },

    async listUnread(userId: string, filters: PaginationQueryFilters) {
        return notificationsService.listUnread(db, userId, filters);
    },

    async update(
        id: string,
        user: { id: string },
        body: UpdateNotificationBody
    ) {
        return notificationsService.update(db, id, user.id, body.isRead);
    },

    async markRead(id: string, user: { id: string }) {
        return notificationsService.markRead(db, id, user.id);
    },

    async markAllRead(user: { id: string }) {
        await notificationsService.markAllRead(db, user.id);
        return { success: true };
    },

    async delete(id: string, user: { id: string }) {
        await notificationsService.delete(db, id, user.id);
        return { success: true };
    },
};
