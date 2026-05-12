import { t } from 'elysia';
import { eventQueryFilters } from '../events/events.schema';

export const adminUserIdParam = t.Object({
    id: t.String(),
});

export const adminUserQueryFilters = t.Object({
    search: t.Optional(t.String()),
    role: t.Optional(t.Union([t.Literal('user'), t.Literal('admin')])),
    banned: t.Optional(t.Boolean()),
    includeDeleted: t.Optional(t.Boolean()),
    limit: t.Optional(t.Integer({ minimum: 1, maximum: 100 })),
    offset: t.Optional(t.Integer({ minimum: 0 })),
});

export const adminEventQueryFilters = t.Composite([
    eventQueryFilters,
    t.Object({
        includeCancelled: t.Optional(t.Boolean()),
        includeDeleted: t.Optional(t.Boolean()),
        includePrivate: t.Optional(t.Boolean()),
    }),
]);

export const banUserBody = t.Object({
    reason: t.String({ minLength: 1, maxLength: 500 }),
});

export const updateUserAdminBody = t.Object({
    name: t.Optional(t.String({ minLength: 1, maxLength: 200 })),
    bio: t.Optional(t.Union([t.String({ maxLength: 1000 }), t.Null()])),
    image: t.Optional(t.Union([t.String({ format: 'uri' }), t.Null()])),
    role: t.Optional(t.Union([t.Literal('user'), t.Literal('admin')])),
});

export type AdminUserQueryFilters = typeof adminUserQueryFilters.static;
export type AdminEventQueryFilters = typeof adminEventQueryFilters.static;
export type BanUserBody = typeof banUserBody.static;
export type UpdateUserAdminBody = typeof updateUserAdminBody.static;
