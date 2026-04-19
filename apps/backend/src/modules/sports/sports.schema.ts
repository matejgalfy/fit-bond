import { t } from 'elysia';

export const baseSportSchema = t.Object({
    id: t.String({ format: 'uuid' }),
    name: t.String(),
    iconUrl: t.Union([t.String(), t.Null()]),
    description: t.Union([t.String(), t.Null()]),
    deletedAt: t.Union([t.Date(), t.Null()]),
});
