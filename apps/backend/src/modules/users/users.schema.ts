import { z } from 'zod';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { user } from '../../db/schema';
import { baseSportSchema } from '../sports/sports.schema';
import { baseLocationSchema } from '../locations/locations.schema';

export const updateBaseUserSchema = createInsertSchema(user, {
    email: () => z.email(),
    name: (schema) => schema.min(1).max(100),
    bio: (schema) => schema.max(500).optional(),
    profilePictureUrl: () => z.url().optional(), // Maybe use only image column TODO
})
    .pick({
        email: true,
        name: true,
        bio: true,
        profilePictureUrl: true,
    })
    .partial();

export const userLocationInputSchema = z.object({
    locationId: z.uuid(),
    radius: z.number().min(1).max(100),
    label: z.string().optional().nullable(),
    isPrimary: z.boolean().default(false),
});

export const updateFullProfileSchema = z.object({
    base: updateBaseUserSchema.optional(),
    sportIds: z.array(z.uuid()).optional(),
    locations: z.array(userLocationInputSchema).optional(),
});

export const PublicUserSchema = createSelectSchema(user).pick({
    id: true,
    name: true,
    bio: true,
    profilePictureUrl: true,
});

export const UserProfileSchema = PublicUserSchema.extend({
    sports: z.array(
        baseSportSchema.pick({
            id: true,
            name: true,
        })
    ),
    locations: z.array(
        baseLocationSchema
            .pick({
                id: true,
                city: true,
            })
            .extend({
                radius: z.number(),
                isPrimary: z.boolean(),
            })
    ),
});

// export const PrivateUserSchema = baseUserSchema.pick(); TODO

export const userIdParam = z.object({
    id: z.string(),
});

export type UpdateFullProfileInput = z.infer<typeof updateFullProfileSchema>;
