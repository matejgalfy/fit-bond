import { type Database } from '../../db';
import type { UsersModel } from './users.model';
import type { UserProfile, UpdateFullProfileInput } from './users.types';
import { usersModel as defaultModel } from './users.model';
import { ServiceError } from '../../utils/errors';
import {
    locationsService as defaultLocationsService,
    type LocationsService,
} from '../locations/locations.service';

export interface UsersServiceDeps {
    model?: UsersModel;
    locationsService?: LocationsService;
}

export function createUsersService({
    model = defaultModel,
    locationsService = defaultLocationsService,
}: UsersServiceDeps = {}) {
    return {
        async getUserProfile(
            db: Database,
            userId: string
        ): Promise<UserProfile> {
            const rawUser = await model.getPublicUserProfileById(db, userId);

            if (!rawUser) {
                throw ServiceError.notFound('User not found');
            }

            return {
                id: rawUser.id,
                name: rawUser.name,
                bio: rawUser.bio,
                image: rawUser.image,
                sports: rawUser.preferredSports.map((ps) => ps.sport),
                location: rawUser.preferredLocation
                    ? {
                          id: rawUser.preferredLocation.id,
                          fullAddress: rawUser.preferredLocation.full_address,
                          formattedAddress:
                              rawUser.preferredLocation.formatted_address,
                          lat: Number(rawUser.preferredLocation.lat),
                          lng: Number(rawUser.preferredLocation.lng),
                          radius: rawUser.locationRadius ?? 0,
                      }
                    : null,
            };
        },

        async updateFullProfile(
            db: Database,
            userId: string,
            data: UpdateFullProfileInput
        ) {
            return db.transaction(async (tx) => {
                let resolved:
                    | { locationId: string; radius: number }
                    | null
                    | undefined;
                if (data.location === null) {
                    resolved = null;
                } else if (data.location !== undefined) {
                    const { radius, ...locationInput } = data.location;
                    const location = await locationsService.findOrCreate(
                        tx,
                        locationInput
                    );
                    resolved = { locationId: location.id, radius };
                }

                return model.updateFullProfile(tx, userId, {
                    base: data.base,
                    sportIds: data.sportIds,
                    location: resolved,
                });
            });
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

        async getUsersByEventId(db: Database, eventId: string) {
            return model.getUsersByEventId(db, eventId);
        }
    };
}

export const usersService = createUsersService();
