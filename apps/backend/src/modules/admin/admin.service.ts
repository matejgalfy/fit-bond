import type { Database } from '../../db';
import type { AdminModel } from './admin.model';
import { adminModel as defaultModel } from './admin.model';
import type {
    AdminUserFilters,
    AdminEventFilters,
    UpdateUserAdminInput,
} from './admin.types';
import { ServiceError } from '../../utils/errors';

export interface AdminServiceDeps {
    model?: AdminModel;
}

export function createAdminService({
    model = defaultModel,
}: AdminServiceDeps = {}) {
    return {
        async listUsers(db: Database, filters: AdminUserFilters) {
            return model.searchUsers(db, filters);
        },

        async getUser(db: Database, id: string) {
            const found = await model.findUserById(db, id);
            if (!found) {
                throw ServiceError.notFound('User not found');
            }
            return found;
        },

        async updateUser(
            db: Database,
            id: string,
            input: UpdateUserAdminInput
        ) {
            const existing = await model.findUserById(db, id);
            if (!existing) {
                throw ServiceError.notFound('User not found');
            }

            const updated = await model.updateUser(db, id, input);
            if (!updated) {
                throw ServiceError.notFound('User not found');
            }
            return updated;
        },

        async deleteUser(db: Database, id: string, actorId: string) {
            if (id === actorId) {
                throw ServiceError.badRequest(
                    'Admins cannot delete their own account'
                );
            }
            const existing = await model.findUserById(db, id);
            if (!existing) {
                throw ServiceError.notFound('User not found');
            }
            if (existing.deletedAt) {
                throw ServiceError.conflict('User is already deleted');
            }

            const deleted = await model.softDeleteUser(db, id);
            if (!deleted) {
                throw ServiceError.notFound('User not found');
            }
            return deleted;
        },

        async listEvents(db: Database, filters: AdminEventFilters) {
            if (filters.userRelation && !filters.userId) {
                throw ServiceError.badRequest(
                    'userId is required when filtering by userRelation'
                );
            }
            if (filters.excludeUserInteractions && !filters.userId) {
                throw ServiceError.badRequest(
                    'userId is required when excludeUserInteractions is true'
                );
            }
            if (filters.userRelation && filters.excludeUserInteractions) {
                throw ServiceError.badRequest(
                    'userRelation and excludeUserInteractions cannot be used together'
                );
            }
            return model.searchEvents(db, filters);
        },
    };
}

export const adminService = createAdminService();
export type AdminService = ReturnType<typeof createAdminService>;
