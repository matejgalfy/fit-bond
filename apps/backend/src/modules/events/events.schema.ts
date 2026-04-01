import { z } from 'zod';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { events } from '../../db/schema';

export const selectEventSchema = createSelectSchema(events);

export const createEventBody = createInsertSchema(events, {
    name: (schema) => schema.min(1).max(200).describe('Event name'),
    description: (schema) =>
        schema.max(2000).optional().describe('Event description'),
    sportId: (schema) => schema.describe('Sport UUID'),
    locationId: (schema) => schema.describe('Location UUID'),
    skillLevel: (schema) => schema.describe('Required skill level'),
    startTime: () => z.string().describe('Event start time (ISO 8601)'),
    duration: (schema) =>
        schema.min(15).max(480).describe('Duration in minutes'),
    capacity: (schema) =>
        schema.min(2).max(200).describe('Maximum number of participants'),
    isPublic: (schema) =>
        schema.optional().describe('Whether the event is publicly visible'),
    coverImageUrl: (schema) => schema.optional().describe('Cover image URL'),
})
    .pick({
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
    })
    .describe('Create event request body');

export const updateEventBody = createEventBody
    .omit({ sportId: true, locationId: true })
    .partial()
    .describe('Update event request body');

export const cancelEventBody = z
    .object({
        reason: z.string().max(500).optional().describe('Cancellation reason'),
    })
    .describe('Cancel event request body');

export const eventQueryFilters = z
    .object({
        sportId: z.string().optional().describe('Filter by sport ID'),
        skillLevel: z
            .enum(['beginner', 'intermediate', 'advanced'])
            .optional()
            .describe('Filter by skill level'),
        city: z.string().optional().describe('Filter by city name'),
        fromDate: z
            .string()
            .optional()
            .describe('Events starting after this date (ISO 8601)'),
        toDate: z
            .string()
            .optional()
            .describe('Events starting before this date (ISO 8601)'),
        search: z.string().optional().describe('Search events by name'),
        limit: z.coerce
            .number()
            .min(1)
            .max(100)
            .optional()
            .describe('Maximum results per page'),
        offset: z.coerce
            .number()
            .min(0)
            .optional()
            .describe('Number of results to skip'),
    })
    .describe('Event listing filters');

export const eventIdParam = z
    .object({
        id: z.uuid().describe('Event UUID'),
    })
    .describe('Event ID path parameter');

export type CreateEventBody = z.infer<typeof createEventBody>;
export type UpdateEventBody = z.infer<typeof updateEventBody>;
export type CancelEventBody = z.infer<typeof cancelEventBody>;
export type EventQueryFilters = z.infer<typeof eventQueryFilters>;
