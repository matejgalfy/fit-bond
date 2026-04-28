import { t } from 'elysia';

export const baseSportSchema = t.Object({
    id: t.String({ format: 'uuid' }),
    name: t.String(),
    iconUrl: t.Union([t.String(), t.Null()]),
    description: t.Union([t.String(), t.Null()]),
    deletedAt: t.Union([t.Date(), t.Null()]),
});

export const createSportBody = t.Object({
    name: t.String({ minLength: 1, maxLength: 100 }),
    iconUrl: t.Optional(t.Union([t.String({ format: 'uri' }), t.Null()])),
    description: t.Optional(t.Union([t.String({ maxLength: 500 }), t.Null()])),
});

export const sportIdParam = t.Object({
    id: t.String({ format: 'uuid' }),
});

export type CreateSportBody = typeof createSportBody.static;
export type SportIdParam = typeof sportIdParam.static;
