import { t } from 'elysia';

export const selectCommentSchema = t.Object({
    id: t.String({ format: 'uuid' }),
    eventId: t.String({ format: 'uuid' }),
    userId: t.String(),
    parentCommentId: t.Optional(
        t.Union([t.String({ format: 'uuid' }), t.Null()])
    ),
    content: t.String(),
    deletedBy: t.Optional(t.Union([t.String(), t.Null()])),
    deletionReason: t.Optional(t.Union([t.String(), t.Null()])),
    createdAt: t.Date(),
    updatedAt: t.Date(),
    deletedAt: t.Optional(t.Union([t.Date(), t.Null()])),
});

export const createCommentBody = t.Object({
    content: t.String({ minLength: 1, maxLength: 2000 }),
    parentCommentId: t.Optional(t.String({ format: 'uuid' })),
});

export const updateCommentBody = t.Object({
    content: t.String({ minLength: 1, maxLength: 2000 }),
});

export const deleteCommentBody = t.Object({
    reason: t.Optional(t.String({ maxLength: 500 })),
});

export const commentQueryFilters = t.Object({
    eventId: t.String({ format: 'uuid' }),
    parentCommentId: t.Optional(t.String({ format: 'uuid' })),
    limit: t.Optional(t.Integer({ minimum: 1, maximum: 100 })),
    offset: t.Optional(t.Integer({ minimum: 0 })),
});

export const commentIdParam = t.Object({
    id: t.String({ format: 'uuid' }),
});

export const eventIdParam = t.Object({
    eventId: t.String({ format: 'uuid' }),
});

export type CreateCommentBody = typeof createCommentBody.static;
export type UpdateCommentBody = typeof updateCommentBody.static;
export type DeleteCommentBody = typeof deleteCommentBody.static;
export type CommentQueryFilters = typeof commentQueryFilters.static;
