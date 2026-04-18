import { z } from 'zod';
import { UserProfileSchema } from './users.schema';
export type UserProfile = z.infer<typeof UserProfileSchema>;
