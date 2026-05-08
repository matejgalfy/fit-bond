import type { Database } from '../../db';
import {
    searchAddresses,
    GeocodingError,
    type GeocodeSuggestion,
} from '../../lib/geocoding';
import { ServiceError } from '../../utils/errors';
import { locationsModel as defaultModel } from './locations.model';
import type { LocationsModel } from './locations.model';
import type { LocationInput, LocationSuggestion } from './locations.schema';

export interface LocationsServiceDeps {
    model?: LocationsModel;
    geocoder?: (q: string, limit?: number) => Promise<GeocodeSuggestion[]>;
}

export function createLocationsService({
    model = defaultModel,
    geocoder = searchAddresses,
}: LocationsServiceDeps = {}) {
    return {
        async search(q: string): Promise<LocationSuggestion[]> {
            try {
                const results = await geocoder(q);
                return results.map((r) => ({
                    placeId: r.placeId,
                    displayName: r.displayName,
                    fullAddress: r.fullAddress,
                    formattedAddress: r.formattedAddress,
                    lat: r.lat,
                    lng: r.lng,
                }));
            } catch (err) {
                if (err instanceof GeocodingError) {
                    throw new ServiceError(
                        `Geocoding service unavailable: ${err.message}`,
                        'INTERNAL_ERROR'
                    );
                }
                throw err;
            }
        },

        async findOrCreate(db: Database, input: LocationInput) {
            const row = await model.upsertByPlaceId(db, input);
            return {
                id: row.id,
                fullAddress: row.full_address,
                formattedAddress: row.formatted_address,
                lat: Number(row.lat),
                lng: Number(row.lng),
            };
        },
    };
}

export type LocationsService = ReturnType<typeof createLocationsService>;

export const locationsService = createLocationsService();
