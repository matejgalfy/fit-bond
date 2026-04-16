import { createSelectSchema } from 'drizzle-zod';
import { sports } from '../../db/schema';
export const baseSportSchema = createSelectSchema(sports);
