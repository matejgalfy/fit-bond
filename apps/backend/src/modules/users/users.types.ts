import { userProfileSchema, updateFullProfileSchema } from './users.schema';

export type UserProfile = typeof userProfileSchema.static;
export type UpdateFullProfileInput = typeof updateFullProfileSchema.static;
