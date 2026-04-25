import { eq, and, isNull, desc } from 'drizzle-orm';
import type { Database } from '../../db';
import { notifications } from '../../db/schema';
import type {
    NotificationFilters,
    PaginationFilters,
} from './notifications.types';

export const notificationsModel = {
    async findAll(db: Database, userId: string, filters: NotificationFilters) {
        const conditions = [
            eq(notifications.userId, userId),
            isNull(notifications.deletedAt),
        ];

        if (filters.type) {
            conditions.push(eq(notifications.type, filters.type));
        }

        const limit = filters.limit ?? 20;
        const offset = filters.offset ?? 0;

        return db
            .select({
                id: notifications.id,
                userId: notifications.userId,
                type: notifications.type,
                title: notifications.title,
                message: notifications.message,
                eventId: notifications.eventId,
                relatedUserId: notifications.relatedUserId,
                isRead: notifications.isRead,
                readAt: notifications.readAt,
                createdAt: notifications.createdAt,
            })
            .from(notifications)
            .where(and(...conditions))
            .orderBy(desc(notifications.createdAt))
            .limit(limit)
            .offset(offset);
    },

    async findUnread(db: Database, userId: string, filters: PaginationFilters) {
        const limit = filters.limit ?? 20;
        const offset = filters.offset ?? 0;

        return db
            .select({
                id: notifications.id,
                userId: notifications.userId,
                type: notifications.type,
                title: notifications.title,
                message: notifications.message,
                eventId: notifications.eventId,
                relatedUserId: notifications.relatedUserId,
                isRead: notifications.isRead,
                readAt: notifications.readAt,
                createdAt: notifications.createdAt,
            })
            .from(notifications)
            .where(
                and(
                    eq(notifications.userId, userId),
                    eq(notifications.isRead, false),
                    isNull(notifications.deletedAt)
                )
            )
            .orderBy(desc(notifications.createdAt))
            .limit(limit)
            .offset(offset);
    },

    async findRawById(db: Database, id: string) {
        const results = await db
            .select()
            .from(notifications)
            .where(
                and(eq(notifications.id, id), isNull(notifications.deletedAt))
            );

        if (results.length === 0) return null;
        return results[0];
    },

    async update(db: Database, id: string, isRead: boolean) {
        const results = await db
            .update(notifications)
            .set({ isRead, readAt: isRead ? new Date() : null })
            .where(
                and(eq(notifications.id, id), isNull(notifications.deletedAt))
            )
            .returning({
                id: notifications.id,
                userId: notifications.userId,
                type: notifications.type,
                title: notifications.title,
                message: notifications.message,
                eventId: notifications.eventId,
                relatedUserId: notifications.relatedUserId,
                isRead: notifications.isRead,
                readAt: notifications.readAt,
                createdAt: notifications.createdAt,
            });

        if (results.length === 0) return null;
        return results[0];
    },

    async markAllRead(db: Database, userId: string) {
        await db
            .update(notifications)
            .set({ isRead: true, readAt: new Date() })
            .where(
                and(
                    eq(notifications.userId, userId),
                    eq(notifications.isRead, false),
                    isNull(notifications.deletedAt)
                )
            );
    },

    async softDelete(db: Database, id: string) {
        const results = await db
            .update(notifications)
            .set({ deletedAt: new Date() })
            .where(
                and(eq(notifications.id, id), isNull(notifications.deletedAt))
            )
            .returning();

        if (results.length === 0) return null;
        return results[0];
    },
};

export type NotificationsModel = typeof notificationsModel;
