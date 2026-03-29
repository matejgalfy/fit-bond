import { z } from 'zod';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { events } from '../../db/schema';

export const selectEventSchema = createSelectSchema(events);

export const createEventBody = createInsertSchema(events, {
    name: (schema) => schema.min(1).max(200),
    description: (schema) => schema.max(2000).optional(),
    startTime: () => z.string(),
    duration: (schema) => schema.min(15).max(480),
    capacity: (schema) => schema.min(2).max(200),
    coverImageUrl: (schema) => schema.optional(),
}).pick({
    name: true,
    description: true,
    sportId: true,
    locationId: true,
    skillLevel: true,
    startTime: true,
    duration: true,
    capacity: true,
    isPublic: true,
    coverImageUrl: true,
});

export const updateEventBody = createEventBody
    .omit({ sportId: true, locationId: true })
    .partial();

export const cancelEventBody = z.object({
    reason: z.string().max(500).optional(),
});

export const eventQueryFilters = z.object({
    sportId: z.string().optional(),
    skillLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    city: z.string().optional(),
    fromDate: z.string().optional(),
    toDate: z.string().optional(),
    search: z.string().optional(),
    limit: z.coerce.number().min(1).max(100).optional(),
    offset: z.coerce.number().min(0).optional(),
});

export const eventIdParam = z.object({
    id: z.uuid(),
});

export type CreateEventBody = z.infer<typeof createEventBody>;
export type UpdateEventBody = z.infer<typeof updateEventBody>;
export type EventQueryFilters = z.infer<typeof eventQueryFilters>;
