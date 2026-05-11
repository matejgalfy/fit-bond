import { userProfileSchema, updateProfileSchema } from './users.schema';

export type UserProfile = typeof userProfileSchema.static;
export type UpdateProfileInput = typeof updateProfileSchema.static;
