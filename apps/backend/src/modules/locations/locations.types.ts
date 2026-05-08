import type { InferSelectModel } from 'drizzle-orm';
import type { locations } from '../../db/schema';

export type LocationRow = InferSelectModel<typeof locations>;
