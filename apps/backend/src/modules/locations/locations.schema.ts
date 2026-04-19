import { t } from 'elysia';

export const baseLocationSchema = t.Object({
    id: t.String({ format: 'uuid' }),
    address: t.String(),
    city: t.String(),
    country: t.String(),
    lat: t.String(),
    lng: t.String(),
    deletedAt: t.Union([t.Date(), t.Null()]),
});
