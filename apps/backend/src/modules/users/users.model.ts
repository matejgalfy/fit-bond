import { eq, and, isNull } from 'drizzle-orm';
import type { Database } from '../../db';
import { user, userPreferredSports } from '../../db/schema';
import type { UpdateProfileInput } from './users.types';
import { eventParticipants } from '../../db/schema';

export interface ResolvedPreferredLocation {
    locationId: string;
    radius: number;
}

export const usersModel = {
    async getUserProfileById(db: Database, userId: string) {
        return await db.query.user.findFirst({
            where: and(eq(user.id, userId), isNull(user.deletedAt)),
            with: {
                preferredSports: {
                    with: {
                        sport: true,
                    },
                },
                preferredLocation: true,
            },
        });
    },

    async updateProfile(
        db: Database,
        userId: string,
        data: Omit<UpdateProfileInput, 'location'> & {
            location?: ResolvedPreferredLocation | null;
        }
    ) {
        return await db.transaction(async (tx) => {
            if (data.base) {
                const { profilePictureUrl, ...rest } = data.base;
                await tx
                    .update(user)
                    .set({
                        ...rest,
                        ...(profilePictureUrl !== undefined && {
                            image: profilePictureUrl,
                        }),
                        updatedAt: new Date(),
                    })
                    .where(and(eq(user.id, userId), isNull(user.deletedAt)));
            }

            if (data.sportIds) {
                await tx
                    .delete(userPreferredSports)
                    .where(eq(userPreferredSports.userId, userId));
                if (data.sportIds.length > 0) {
                    await tx.insert(userPreferredSports).values(
                        data.sportIds.map((sportId) => ({
                            userId,
                            sportId,
                        }))
                    );
                }
            }

            if (data.location !== undefined) {
                await tx
                    .update(user)
                    .set({
                        preferredLocation: data.location
                            ? data.location.locationId
                            : null,
                        locationRadius: data.location
                            ? data.location.radius
                            : null,
                    })
                    .where(and(eq(user.id, userId), isNull(user.deletedAt)));
            }

            return { success: true };
        });
    },

    async getUserNameById(db: Database, userId: string) {
        const results = await db
            .select({ id: user.id, name: user.name })
            .from(user)
            .where(and(eq(user.id, userId), isNull(user.deletedAt)));

        if (results.length === 0) return null;
        return results[0];
    },

    async getUsersByEventId(db: Database, eventId: string) {
        return await db
            .select({
                id: user.id,
                name: user.name,
                email: user.email,
                image: user.image,
            })
            .from(eventParticipants)
            .innerJoin(user, eq(eventParticipants.userId, user.id))
            .where(eq(eventParticipants.eventId, eventId));
    },
};

export type UsersModel = typeof usersModel;
