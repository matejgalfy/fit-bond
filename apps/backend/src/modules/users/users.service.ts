import { type Database } from '../../db';
import type { UsersModel } from './users.model';
import type { PublicUserProfile, UpdateFullProfileInput } from './users.schema';
import { usersModel as defaultModel } from './users.model';
import { ServiceError } from '../../utils/errors';

export function createUsersService(model: UsersModel = defaultModel) {
    return {
        async getPublicProfile(
            db: Database,
            userId: string
        ): Promise<PublicUserProfile> {
            const rawUser = await model.getPublicUserProfileById(db, userId);

            if (!rawUser) {
                throw ServiceError.notFound('User not found');
            }

            return {
                id: rawUser.id,
                name: rawUser.name,
                bio: rawUser.bio,
                profilePictureUrl: rawUser.profilePictureUrl,
                sports: rawUser.preferredSports.map((ps) => ps.sport),
                locations: rawUser.locations.map((ul) => ({
                    id: ul.location.id,
                    city: ul.location.city,
                    radius: ul.radius,
                    isPrimary: ul.isPrimary,
                })),
            };
        },

        async updateFullProfile(
            db: Database,
            userId: string,
            data: UpdateFullProfileInput
        ) {
            return await model.updateFullProfile(db, userId, data);
        },

        // for admin to search
        // TODO add partial name matching, multiple results
        // admin role check
        async findUserByName(db: Database, name: string) {
            const user = await model.findUserByName(db, name);

            if (!user) {
                throw ServiceError.notFound('User not found');
            }

            return user;
        },
    };
}

export const usersService = createUsersService();
