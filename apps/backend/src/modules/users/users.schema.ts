import { t } from 'elysia';

export const updateBaseUserSchema = t.Object({
    email: t.Optional(t.String({ format: 'email' })),
    name: t.Optional(t.String({ minLength: 1, maxLength: 100 })),
    bio: t.Optional(t.String({ maxLength: 500 })),
    profilePictureUrl: t.Optional(t.String({ format: 'uri' })),
});

export const userLocationInputSchema = t.Object({
    locationId: t.String({ format: 'uuid' }),
    radius: t.Number({ minimum: 1, maximum: 100 }),
    label: t.Optional(t.Union([t.String(), t.Null()])),
    isPrimary: t.Optional(t.Boolean()),
});

export const updateFullProfileSchema = t.Object({
    base: t.Optional(updateBaseUserSchema),
    sportIds: t.Optional(t.Array(t.String({ format: 'uuid' }))),
    locations: t.Optional(t.Array(userLocationInputSchema)),
});

export const userProfileSchema = t.Object({
    id: t.String(),
    name: t.String(),
    bio: t.Union([t.String(), t.Null()]),
    profilePictureUrl: t.Union([t.String(), t.Null()]),
    sports: t.Array(
        t.Object({
            id: t.String({ format: 'uuid' }),
            name: t.String(),
        })
    ),
    locations: t.Array(
        t.Object({
            id: t.String({ format: 'uuid' }),
            city: t.String(),
            radius: t.Number(),
            isPrimary: t.Boolean(),
        })
    ),
});

// export const PrivateUserSchema = baseUserSchema.pick(); TODO

export const userIdParam = t.Object({
    userId: t.String(),
});

export const userNameParam = t.Object({
    name: t.String({ minLength: 1 }),
});
