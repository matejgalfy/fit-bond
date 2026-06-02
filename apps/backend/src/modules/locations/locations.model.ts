import { eq } from 'drizzle-orm';
import type { Database } from '../../db';
import { firstOrNull, firstOrThrow } from '../../utils/query';
import { locations } from '../../db/schema';
import type { LocationInput } from './locations.schema';
import type { LocationRow } from './locations.types';

export const locationsModel = {
    async findById(db: Database, id: string): Promise<LocationRow | null> {
        const results = await db
            .select()
            .from(locations)
            .where(eq(locations.id, id));
        return firstOrNull(results);
    },

    async upsertByPlaceId(
        db: Database,
        input: LocationInput
    ): Promise<LocationRow> {
        const results = await db
            .insert(locations)
            .values({
                id: input.placeId,
                full_address: input.fullAddress,
                formatted_address: input.formattedAddress,
                lat: input.lat.toString(),
                lng: input.lng.toString(),
            })
            .onConflictDoUpdate({
                target: locations.id,
                set: {
                    full_address: input.fullAddress,
                    formatted_address: input.formattedAddress,
                    lat: input.lat.toString(),
                    lng: input.lng.toString(),
                },
            })
            .returning();

        return firstOrThrow(results, 'Failed to upsert location');
    },
};

export type LocationsModel = typeof locationsModel;
