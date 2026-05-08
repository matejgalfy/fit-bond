import { t } from 'elysia';
import { locationInputSchema } from '../locations/locations.schema';

export const selectEventSchema = t.Object({
    id: t.String({ format: 'uuid' }),
    organizerId: t.String(),
    locationId: t.String(),
    sportId: t.String({ format: 'uuid' }),
    name: t.String(),
    description: t.Optional(t.Union([t.String(), t.Null()])),
    skillLevel: t.Union([
        t.Literal('beginner'),
        t.Literal('intermediate'),
        t.Literal('advanced'),
    ]),
    startTime: t.Date(),
    duration: t.Number(),
    capacity: t.Number(),
    currentParticipants: t.Number(),
    currentInterested: t.Number(),
    isPublic: t.Boolean(),
    coverImageUrl: t.Optional(t.Union([t.String(), t.Null()])),
    cancelledAt: t.Optional(t.Union([t.Date(), t.Null()])),
    cancellationReason: t.Optional(t.Union([t.String(), t.Null()])),
    createdAt: t.Date(),
    updatedAt: t.Date(),
    deletedAt: t.Optional(t.Union([t.Date(), t.Null()])),
});

export const createEventBody = t.Object({
    name: t.String({ minLength: 1, maxLength: 200 }),
    description: t.Optional(t.String({ maxLength: 2000 })),
    sportId: t.String({ format: 'uuid' }),
    location: locationInputSchema,
    skillLevel: t.Union([
        t.Literal('beginner'),
        t.Literal('intermediate'),
        t.Literal('advanced'),
    ]),
    startTime: t.String({ format: 'date-time' }),
    duration: t.Number({ minimum: 15, maximum: 480 }),
    capacity: t.Number({ minimum: 2, maximum: 200 }),
    isPublic: t.Optional(t.Boolean()),
    coverImageUrl: t.Optional(t.String({ format: 'uri' })),
});

export const updateEventBody = t.Object({
    name: t.Optional(t.String({ minLength: 1, maxLength: 200 })),
    description: t.Optional(t.String({ maxLength: 2000 })),
    location: t.Optional(locationInputSchema),
    skillLevel: t.Optional(
        t.Union([
            t.Literal('beginner'),
            t.Literal('intermediate'),
            t.Literal('advanced'),
        ])
    ),
    startTime: t.Optional(t.String({ format: 'date-time' })),
    duration: t.Optional(t.Number({ minimum: 15, maximum: 480 })),
    capacity: t.Optional(t.Number({ minimum: 2, maximum: 200 })),
    isPublic: t.Optional(t.Boolean()),
    coverImageUrl: t.Optional(t.String({ format: 'uri' })),
});

export const cancelEventBody = t.Object({
    reason: t.Optional(t.String({ maxLength: 500 })),
});

export const eventQueryFilters = t.Object({
    sportId: t.Optional(t.String({ format: 'uuid' })),
    skillLevel: t.Optional(
        t.Union([
            t.Literal('beginner'),
            t.Literal('intermediate'),
            t.Literal('advanced'),
        ])
    ),
    city: t.Optional(t.String()),
    fromDate: t.Optional(t.String({ format: 'date-time' })),
    toDate: t.Optional(t.String({ format: 'date-time' })),
    search: t.Optional(t.String()),
    userId: t.Optional(t.String()),
    userRelation: t.Optional(
        t.Union([
            t.Literal('organized'),
            t.Literal('joined'),
            t.Literal('interested'),
        ])
    ),
    date: t.Optional(t.String({ format: 'date' })),
    excludeUserInteractions: t.Optional(t.Boolean()),
    limit: t.Optional(t.Integer({ minimum: 1, maximum: 100 })),
    offset: t.Optional(t.Integer({ minimum: 0 })),
});

export const eventIdParam = t.Object({
    id: t.String({ format: 'uuid' }),
});

export const userIdParam = t.Object({
    userId: t.String(),
});

export const eventStatsResponse = t.Object({
    organized: t.Integer(),
    interested: t.Integer(),
    joined: t.Integer(),
});

export type CreateEventBody = typeof createEventBody.static;
export type UpdateEventBody = typeof updateEventBody.static;
export type CancelEventBody = typeof cancelEventBody.static;
export type EventQueryFilters = typeof eventQueryFilters.static;
export type EventStatsResponse = typeof eventStatsResponse.static;
