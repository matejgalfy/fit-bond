import type { Database } from '../../db';
import type { NotificationsModel } from './notifications.model';
import { notificationsModel as defaultModel } from './notifications.model';
import type {
    CreateNotificationInput,
    NotificationFilters,
    PaginationFilters,
} from './notifications.types';
import { ServiceError } from '../../utils/errors';

export interface NotificationsServiceDeps {
    model?: NotificationsModel;
}

export function createNotificationsService({
    model = defaultModel,
}: NotificationsServiceDeps = {}) {
    return {
        async create(db: Database, input: CreateNotificationInput) {
            return model.create(db, input);
        },

        async createMany(db: Database, inputs: CreateNotificationInput[]) {
            return model.createMany(db, inputs);
        },

        async list(db: Database, userId: string, filters: NotificationFilters) {
            return model.findAll(db, userId, filters);
        },

        async listUnread(
            db: Database,
            userId: string,
            filters: PaginationFilters
        ) {
            return model.findUnread(db, userId, filters);
        },

        async update(
            db: Database,
            notificationId: string,
            requestingUserId: string,
            isRead: boolean
        ) {
            const existing = await model.findRawById(db, notificationId);
            if (!existing) {
                throw ServiceError.notFound('Notification not found');
            }
            if (existing.userId !== requestingUserId) {
                throw ServiceError.forbidden(
                    "Cannot update another user's notification"
                );
            }

            const result = await model.update(db, notificationId, isRead);
            if (!result) {
                throw ServiceError.notFound('Notification not found');
            }
            return result;
        },

        async markRead(
            db: Database,
            notificationId: string,
            requestingUserId: string
        ) {
            return this.update(db, notificationId, requestingUserId, true);
        },

        async markAllRead(db: Database, userId: string) {
            await model.markAllRead(db, userId);
            return { success: true };
        },

        async delete(
            db: Database,
            notificationId: string,
            requestingUserId: string
        ) {
            const existing = await model.findRawById(db, notificationId);
            if (!existing) {
                throw ServiceError.notFound('Notification not found');
            }
            if (existing.userId !== requestingUserId) {
                throw ServiceError.forbidden(
                    "Cannot delete another user's notification"
                );
            }

            await model.softDelete(db, notificationId);
            return { success: true };
        },
    };
}

export type NotificationsService = ReturnType<
    typeof createNotificationsService
>;
