import { eq, and, isNull } from 'drizzle-orm';
import type { Database } from '../../db';
import { user, userPreferredSports, userLocations } from '../../db/schema';
import type { UpdateFullProfileInput } from './users.schema';

export const usersModel = {
    // TODO createUser

    // TODO getPrivateUserProfileById

    async getPublicUserProfileById(db: Database, userId: string) {
        return await db.query.user.findFirst({
            where: and(eq(user.id, userId), isNull(user.deletedAt)),
            with: {
                preferredSports: {
                    with: {
                        sport: true,
                    },
                },
                locations: {
                    with: {
                        location: true,
                    },
                },
            },
        });
    },

    async updateFullProfile(
        db: Database,
        userId: string,
        data: UpdateFullProfileInput
    ) {
        return await db.transaction(async (tx) => {
            if (data.base) {
                await tx
                    .update(user)
                    .set({ ...data.base, updatedAt: new Date() })
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

            if (data.locations) {
                await tx
                    .delete(userLocations)
                    .where(eq(userLocations.userId, userId));
                if (data.locations.length > 0) {
                    await tx.insert(userLocations).values(
                        data.locations.map((loc) => ({
                            userId,
                            locationId: loc.locationId,
                            radius: loc.radius,
                            label: loc.label,
                            isPrimary: loc.isPrimary,
                        }))
                    );
                }
            }

            return { success: true };
        });
    },

    // TODO spytat sa chata, ci to je ok takto pre admina
    async findUserByName(db: Database, name: string) {
        return await db.query.user.findFirst({
            where: and(eq(user.name, name), isNull(user.deletedAt)),
        });
    },

    // TODO ban user
    // TODO unban user
};

export type UsersModel = typeof usersModel;
