import type { Database } from '../../db';
import type { AdminModel } from './admin.model';
import { adminModel as defaultModel } from './admin.model';
import type {
    AdminUserFilters,
    AdminEventFilters,
    UpdateUserAdminInput,
} from './admin.types';
import { ServiceError } from '../../utils/errors';
import { validateUserRelationFilters } from '../../utils/filter-validators';

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
            return { success: true };
        },

        async listEvents(db: Database, filters: AdminEventFilters) {
            validateUserRelationFilters(filters);
            return model.searchEvents(db, filters);
        },
    };
}

export type AdminService = ReturnType<typeof createAdminService>;
