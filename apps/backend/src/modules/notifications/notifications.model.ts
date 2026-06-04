import { eq, and, isNull, desc, count } from 'drizzle-orm';
import { DEFAULT_PAGE_SIZE, DEFAULT_OFFSET } from '../../utils/pagination';
import type { Database } from '../../db';
import { firstOrNull } from '../../utils/query';
import { notifications } from '../../db/schema';
import type {
    CreateNotificationInput,
    NotificationFilters,
    PaginationFilters,
} from './notifications.types';

const returnColumns = {
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
};

export const notificationsModel = {
    async create(db: Database, input: CreateNotificationInput) {
        const results = await db
            .insert(notifications)
            .values(input)
            .returning(returnColumns);

        return firstOrNull(results);
    },

    async createMany(db: Database, inputs: CreateNotificationInput[]) {
        if (inputs.length === 0) return [];
        return db.insert(notifications).values(inputs).returning(returnColumns);
    },

    async findAll(db: Database, userId: string, filters: NotificationFilters) {
        const conditions = [
            eq(notifications.userId, userId),
            isNull(notifications.deletedAt),
        ];

        if (filters.type) {
            conditions.push(eq(notifications.type, filters.type));
        }

        const limit = filters.limit ?? DEFAULT_PAGE_SIZE;
        const offset = filters.offset ?? DEFAULT_OFFSET;

        return db
            .select(returnColumns)
            .from(notifications)
            .where(and(...conditions))
            .orderBy(desc(notifications.createdAt))
            .limit(limit)
            .offset(offset);
    },

    async findUnread(db: Database, userId: string, filters: PaginationFilters) {
        const limit = filters.limit ?? DEFAULT_PAGE_SIZE;
        const offset = filters.offset ?? DEFAULT_OFFSET;

        return db
            .select(returnColumns)
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

    async findUnreadCount(db: Database, userId: string) {
        const results = await db
            .select({ value: count() })
            .from(notifications)
            .where(
                and(
                    eq(notifications.userId, userId),
                    eq(notifications.isRead, false),
                    isNull(notifications.deletedAt)
                )
            );
        return results[0]?.value ?? 0;
    },

    async findRawById(db: Database, id: string) {
        const results = await db
            .select()
            .from(notifications)
            .where(
                and(eq(notifications.id, id), isNull(notifications.deletedAt))
            );

        return firstOrNull(results);
    },

    async update(db: Database, id: string, isRead: boolean) {
        const results = await db
            .update(notifications)
            .set({ isRead, readAt: isRead ? new Date() : null })
            .where(
                and(eq(notifications.id, id), isNull(notifications.deletedAt))
            )
            .returning(returnColumns);

        return firstOrNull(results);
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

        return firstOrNull(results);
    },
};

export type NotificationsModel = typeof notificationsModel;
