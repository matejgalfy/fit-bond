import type { InferSelectModel } from 'drizzle-orm';
import type { user } from '../../db/schema';
import type {
    AdminUserQueryFilters,
    AdminEventQueryFilters,
    UpdateUserAdminBody,
} from './admin.schema';

export type UserType = InferSelectModel<typeof user>;

export type AdminUserFilters = AdminUserQueryFilters;
export type AdminEventFilters = AdminEventQueryFilters;
export type UpdateUserAdminInput = UpdateUserAdminBody;
