import { t } from 'elysia';
import { locationInputSchema } from '../locations/locations.schema';

export const updateBaseUserSchema = t.Object({
    email: t.Optional(t.String({ format: 'email' })),
    name: t.Optional(t.String({ minLength: 1, maxLength: 100 })),
    bio: t.Optional(t.String({ maxLength: 500 })),
    profilePictureUrl: t.Optional(t.String({ format: 'uri' })),
});

export const userPreferredLocationSchema = t.Composite([
    locationInputSchema,
    t.Object({
        radius: t.Number({ minimum: 1, maximum: 100 }),
    }),
]);

export const updateProfileSchema = t.Object({
    base: t.Optional(updateBaseUserSchema),
    sportIds: t.Optional(t.Array(t.String({ format: 'uuid' }))),
    location: t.Optional(t.Union([userPreferredLocationSchema, t.Null()])),
});

export const userProfileLocationSchema = t.Object({
    id: t.String(),
    fullAddress: t.String(),
    formattedAddress: t.String(),
    lat: t.Number(),
    lng: t.Number(),
    radius: t.Number(),
});

export const userProfileSchema = t.Object({
    id: t.String(),
    name: t.String(),
    bio: t.Union([t.String(), t.Null()]),
    image: t.Union([t.String(), t.Null()]),
    sports: t.Array(
        t.Object({
            id: t.String({ format: 'uuid' }),
            name: t.String(),
        })
    ),
    location: t.Union([userProfileLocationSchema, t.Null()]),
});

export const userIdParam = t.Object({
    userId: t.String(),
});

export const userNameParam = t.Object({
    name: t.String({ minLength: 1 }),
});

export const eventIdParam = t.Object({
    eventId: t.String({ format: 'uuid' }),
});

export type UserPreferredLocationInput =
    typeof userPreferredLocationSchema.static;
