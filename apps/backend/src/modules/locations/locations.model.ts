import { eq } from 'drizzle-orm';
import type { Database } from '../../db';
import { locations } from '../../db/schema';
import type { LocationInput } from './locations.schema';
import type { LocationRow } from './locations.types';

export const locationsModel = {
    async findById(db: Database, id: string): Promise<LocationRow | null> {
        const results = await db
            .select()
            .from(locations)
            .where(eq(locations.id, id));
        return results.length === 0 ? null : results[0];
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

        if (results.length === 0) {
            throw new Error('Failed to upsert location');
        }
        return results[0];
    },
};

export type LocationsModel = typeof locationsModel;
