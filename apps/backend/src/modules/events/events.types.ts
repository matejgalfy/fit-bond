import type { InferSelectModel } from 'drizzle-orm';
import type { events } from '../../db/schema';
import type {
    CreateEventBody,
    UpdateEventBody,
    EventQueryFilters,
} from './events.schema';

export type EventType = InferSelectModel<typeof events>;

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';
export type UserRelation = 'organized' | 'joined' | 'interested';

export type CreateEventInput = CreateEventBody;
export type UpdateEventInput = UpdateEventBody;
export type EventFilters = EventQueryFilters & { isPublic?: boolean };
