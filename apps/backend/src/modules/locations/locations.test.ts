import { test, expect, describe, beforeEach, mock } from 'bun:test';
import { createLocationsService } from './locations.service';
import type { LocationsModel } from './locations.model';
import type { Database } from '../../db';
import type { LocationRow } from './locations.types';
import { GeocodingError, type GeocodeSuggestion } from '../../lib/geocoding';
import { ServiceError } from '../../utils/errors';

const fakeDb = {} as unknown as Database;

function makeRow(overrides: Partial<LocationRow> = {}): LocationRow {
    return {
        id: 'liq:42',
        full_address: 'Hlavní 1, Brno, Czech Republic',
        formatted_address: 'Brno, Czech Republic',
        lat: '49.195061',
        lng: '16.606837',
        deletedAt: null,
        ...overrides,
    };
}

function makeSuggestion(
    overrides: Partial<GeocodeSuggestion> = {}
): GeocodeSuggestion {
    return {
        placeId: 'liq:42',
        displayName: 'Hlavní 1, Brno, Czech Republic',
        fullAddress: 'Hlavní 1, Brno, Czech Republic',
        formattedAddress: 'Brno, Czech Republic',
        lat: 49.195061,
        lng: 16.606837,
        ...overrides,
    };
}

describe('LocationsService', () => {
    describe('search', () => {
        test('maps geocoder results to suggestions', async () => {
            const geocoder = mock(() =>
                Promise.resolve([
                    makeSuggestion({ placeId: 'liq:1' }),
                    makeSuggestion({ placeId: 'liq:2' }),
                ])
            );
            const service = createLocationsService({ geocoder });

            const result = await service.search('Brno');

            expect(geocoder).toHaveBeenCalledWith('Brno');
            expect(result).toHaveLength(2);
            expect(result[0].placeId).toBe('liq:1');
            expect(result[0].lat).toBe(49.195061);
        });

        test('translates GeocodingError into ServiceError', async () => {
            const geocoder = mock(() =>
                Promise.reject(new GeocodingError('boom'))
            );
            const service = createLocationsService({ geocoder });

            expect.assertions(2);
            try {
                await service.search('Brno');
            } catch (e) {
                expect(e).toBeInstanceOf(ServiceError);
                expect((e as ServiceError).code).toBe('INTERNAL_ERROR');
            }
        });

        test('rethrows unexpected errors unchanged', async () => {
            const boom = new Error('unexpected');
            const geocoder = mock(() => Promise.reject(boom));
            const service = createLocationsService({ geocoder });

            expect.assertions(1);
            try {
                await service.search('Brno');
            } catch (e) {
                expect(e).toBe(boom);
            }
        });
    });

    describe('findOrCreate', () => {
        let mockModel: { upsertByPlaceId: ReturnType<typeof mock> };
        let service: ReturnType<typeof createLocationsService>;

        beforeEach(() => {
            mockModel = {
                upsertByPlaceId: mock(() => Promise.resolve(makeRow())),
            };
            service = createLocationsService({
                model: mockModel as unknown as LocationsModel,
            });
        });

        test('upserts via the model and returns numeric coords', async () => {
            const result = await service.findOrCreate(fakeDb, {
                placeId: 'liq:42',
                fullAddress: 'Hlavní 1, Brno, Czech Republic',
                formattedAddress: 'Brno, Czech Republic',
                lat: 49.195061,
                lng: 16.606837,
            });

            expect(mockModel.upsertByPlaceId).toHaveBeenCalledTimes(1);
            expect(result.id).toBe('liq:42');
            expect(typeof result.lat).toBe('number');
            expect(result.lat).toBeCloseTo(49.195061, 6);
            expect(result.lng).toBeCloseTo(16.606837, 6);
        });

        test('returns the same row when called twice with the same placeId', async () => {
            const row = makeRow();
            mockModel.upsertByPlaceId = mock(() => Promise.resolve(row));
            service = createLocationsService({
                model: mockModel as unknown as LocationsModel,
            });

            const input = {
                placeId: 'liq:42',
                fullAddress: 'Hlavní 1, Brno, Czech Republic',
                formattedAddress: 'Brno, Czech Republic',
                lat: 49.195061,
                lng: 16.606837,
            };
            const a = await service.findOrCreate(fakeDb, input);
            const b = await service.findOrCreate(fakeDb, input);

            expect(a.id).toBe(b.id);
            expect(mockModel.upsertByPlaceId).toHaveBeenCalledTimes(2);
        });
    });
});
