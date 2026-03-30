import type { InferSelectModel } from 'drizzle-orm';
import type { events } from '../../db/schema';
import type {
    CreateEventBody,
    UpdateEventBody,
    EventQueryFilters,
} from './events.schema';

export type Event = InferSelectModel<typeof events>;

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

export type CreateEventInput = CreateEventBody;
export type UpdateEventInput = UpdateEventBody;
export type EventFilters = EventQueryFilters & { isPublic?: boolean };
