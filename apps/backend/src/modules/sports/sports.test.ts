import { test, expect, describe, beforeEach, vi } from 'vitest';
import { createSportsService } from './sports.service';
import { ServiceError } from '../../utils/errors';
import type { SportsModel } from './sports.model';
import type { Database } from '../../db';
import type { SportType, CreateSportInput } from './sports.types';

function makeMockSport(overrides: Partial<SportType> = {}): SportType {
    return {
        id: 'sport-1',
        name: 'Tennis',
        iconUrl: null,
        description: null,
        deletedAt: null,
        ...overrides,
    };
}

function makeMockModel() {
    return {
        findAll: vi.fn(() => Promise.resolve([] as unknown[])),
        findById: vi.fn(() =>
            Promise.resolve(null as Record<string, unknown> | null)
        ),
        findByName: vi.fn(() => Promise.resolve(null as SportType | null)),
        create: vi.fn(() => Promise.resolve(makeMockSport())),
        softDelete: vi.fn(() =>
            Promise.resolve(makeMockSport() as SportType | null)
        ),
    };
}

const fakeDb = {} as unknown as Database;

describe('SportsService', () => {
    let mockModel: ReturnType<typeof makeMockModel>;
    let service: ReturnType<typeof createSportsService>;

    beforeEach(() => {
        mockModel = makeMockModel();
        service = createSportsService(mockModel as unknown as SportsModel);
    });

    describe('list', () => {
        test('delegates to model.findAll', async () => {
            await service.list(fakeDb);
            expect(mockModel.findAll).toHaveBeenCalledWith(fakeDb);
        });

        test('returns results from model', async () => {
            const items = [{ id: '1' }, { id: '2' }];
            mockModel.findAll.mockResolvedValueOnce(items);
            const result = await service.list(fakeDb);
            expect(result).toHaveLength(2);
        });
    });

    describe('getById', () => {
        test('returns sport when found', async () => {
            const sport = makeMockSport();
            mockModel.findById.mockResolvedValueOnce(
                sport as unknown as Record<string, unknown>
            );
            const result = await service.getById(fakeDb, 'sport-1');
            expect(result).toEqual(sport);
        });

        test('throws NOT_FOUND when missing', async () => {
            expect.assertions(2);
            mockModel.findById.mockResolvedValueOnce(null);
            try {
                await service.getById(fakeDb, 'missing');
            } catch (e) {
                expect(e).toBeInstanceOf(ServiceError);
                expect((e as ServiceError).code).toBe('NOT_FOUND');
            }
        });
    });

    describe('create', () => {
        const input: CreateSportInput = { name: 'Padel' };

        test('throws CONFLICT when sport with same name exists', async () => {
            expect.assertions(2);
            mockModel.findByName.mockResolvedValueOnce(
                makeMockSport({ name: 'Padel' })
            );
            try {
                await service.create(fakeDb, input);
            } catch (e) {
                expect(e).toBeInstanceOf(ServiceError);
                expect((e as ServiceError).code).toBe('CONFLICT');
            }
        });

        test('delegates to model.create when name is unique', async () => {
            mockModel.findByName.mockResolvedValueOnce(null);
            await service.create(fakeDb, input);
            expect(mockModel.create).toHaveBeenCalledWith(fakeDb, input);
        });

        test('returns created sport', async () => {
            const created = makeMockSport({ name: 'Padel' });
            mockModel.findByName.mockResolvedValueOnce(null);
            mockModel.create.mockResolvedValueOnce(created);
            const result = await service.create(fakeDb, input);
            expect(result).toEqual(created);
        });
    });

    describe('delete', () => {
        test('throws NOT_FOUND when sport missing', async () => {
            expect.assertions(2);
            mockModel.findById.mockResolvedValueOnce(null);
            try {
                await service.delete(fakeDb, 'missing');
            } catch (e) {
                expect(e).toBeInstanceOf(ServiceError);
                expect((e as ServiceError).code).toBe('NOT_FOUND');
            }
        });

        test('calls softDelete when sport exists', async () => {
            mockModel.findById.mockResolvedValueOnce(
                makeMockSport() as unknown as Record<string, unknown>
            );
            await service.delete(fakeDb, 'sport-1');
            expect(mockModel.softDelete).toHaveBeenCalledWith(
                fakeDb,
                'sport-1'
            );
        });
    });
});
