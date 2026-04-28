import type { InferSelectModel } from 'drizzle-orm';
import type { sports } from '../../db/schema';
import type { CreateSportBody } from './sports.schema';

export type SportType = InferSelectModel<typeof sports>;

export type CreateSportInput = CreateSportBody;
