import { t } from 'elysia';
import { eventQueryFilters } from '../events/events.schema';
import { limitQuerySchema, offsetQuerySchema } from '../../utils/pagination';

export const adminUserIdParam = t.Object({
    id: t.String(),
});

export const adminUserQueryFilters = t.Object({
    search: t.Optional(t.String()),
    role: t.Optional(t.Union([t.Literal('user'), t.Literal('admin')])),
    banned: t.Optional(t.Boolean()),
    includeDeleted: t.Optional(t.Boolean()),
    limit: limitQuerySchema,
    offset: offsetQuerySchema,
});

export const adminEventQueryFilters = t.Composite([
    eventQueryFilters,
    t.Object({
        includeCancelled: t.Optional(t.Boolean()),
        includeDeleted: t.Optional(t.Boolean()),
        includePrivate: t.Optional(t.Boolean()),
    }),
]);

export const updateUserAdminBody = t.Object({
    name: t.Optional(t.String({ minLength: 1, maxLength: 200 })),
    bio: t.Optional(t.Union([t.String({ maxLength: 1000 }), t.Null()])),
    image: t.Optional(t.Union([t.String({ format: 'uri' }), t.Null()])),
    role: t.Optional(t.Union([t.Literal('user'), t.Literal('admin')])),
});

export type AdminUserQueryFilters = typeof adminUserQueryFilters.static;
export type AdminEventQueryFilters = typeof adminEventQueryFilters.static;
export type UpdateUserAdminBody = typeof updateUserAdminBody.static;
