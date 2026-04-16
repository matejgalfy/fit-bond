import { createSelectSchema } from 'drizzle-zod';
import { locations } from '../../db/schema';
export const baseLocationSchema = createSelectSchema(locations);
