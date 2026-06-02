import { test, expect, describe, beforeEach, vi } from 'vitest';
import { createEventsService } from './events.service';
import { ServiceError } from '../../utils/errors';
import type { EventsModel } from './events.model';
import type { Database } from '../../db';
import type {
    EventType,
    CreateEventInput,
    UpdateEventInput,
} from './events.types';

const futureDate = new Date(Date.now() + 86400000).toISOString();
const pastDate = new Date(Date.now() - 86400000).toISOString();

const sampleLocation = {
    placeId: 'liq:42',
    fullAddress: 'Hlavni 1, Brno, Czech Republic',
    formattedAddress: 'Hlavni 1, Brno',
    lat: 49.195061,
    lng: 16.606837,
};

function makeMockLocationsService() {
    return {
        search: vi.fn(() => Promise.resolve([])),
        findOrCreate: vi.fn(() =>
            Promise.resolve({
                id: 'loc-1',
                fullAddress: sampleLocation.fullAddress,
                formattedAddress: sampleLocation.formattedAddress,
                lat: sampleLocation.lat,
                lng: sampleLocation.lng,
            })
        ),
    };
}

function makeFakeDb(): Database {
    const fake = {
        transaction: async <T>(fn: (tx: Database) => Promise<T>) =>
            fn(fake as unknown as Database),
    };
    return fake as unknown as Database;
}

function makeMockBus() {
    return {
        emit: vi.fn(() => Promise.resolve()),
    };
}

type MockEvent = EventType & {
    currentParticipants: number;
    currentInterested: number;
};

function makeMockEvent(overrides: Partial<MockEvent> = {}): MockEvent {
    return {
        id: 'event-1',
        organizerId: 'user-1',
        locationId: 'loc-1',
        sportId: 'sport-1',
        name: 'Morning Run',
        description: 'A casual morning run',
        skillLevel: 'beginner',
        startTime: new Date(futureDate),
        duration: 60,
        capacity: 10,
        currentParticipants: 2,
        currentInterested: 0,
        isPublic: true,
        coverImageUrl: null,
        cancelledAt: null,
        cancellationReason: null,
        createdAt: new Date(),
        updatedAt: new Date(),
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
        findRawById: vi.fn(() => Promise.resolve(null as EventType | null)),
        create: vi.fn(() => Promise.resolve(makeMockEvent())),
        update: vi.fn(() =>
            Promise.resolve(makeMockEvent() as EventType | null)
        ),
        cancel: vi.fn(() =>
            Promise.resolve(makeMockEvent() as EventType | null)
        ),
        softDelete: vi.fn(() =>
            Promise.resolve(makeMockEvent() as EventType | null)
        ),
        getStatsByUserId: vi.fn(() =>
            Promise.resolve({ organized: 0, joined: 0, interested: 0 })
        ),
    };
}

const fakeDb = makeFakeDb();

describe('EventsService', () => {
    let mockModel: ReturnType<typeof makeMockModel>;
    let mockLocationsService: ReturnType<typeof makeMockLocationsService>;
    let mockBus: ReturnType<typeof makeMockBus>;
    let service: ReturnType<typeof createEventsService>;

    beforeEach(() => {
        mockModel = makeMockModel();
        mockLocationsService = makeMockLocationsService();
        mockBus = makeMockBus();
        service = createEventsService({
            model: mockModel as unknown as EventsModel,
            locationsService: mockLocationsService,
            bus: mockBus,
        });
    });

    describe('list', () => {
        test('delegates to model.findAll with filters', async () => {
            const filters = { sportId: 'sport-1', limit: 10 };
            await service.list(fakeDb, filters);
            expect(mockModel.findAll).toHaveBeenCalledWith(fakeDb, filters);
        });

        test('returns results from model', async () => {
            const items = [{ id: '1' }, { id: '2' }];
            mockModel.findAll.mockResolvedValueOnce(items);
            const result = await service.list(fakeDb, {});
            expect(result).toHaveLength(2);
        });

        test('allows filtering by userId and userRelation', async () => {
            const filters = {
                userId: 'user-1',
                userRelation: 'organized' as const,
            };
            await service.list(fakeDb, filters);
            expect(mockModel.findAll).toHaveBeenCalledWith(fakeDb, filters);
        });

        test('throws BAD_REQUEST when userRelation provided without userId', async () => {
            expect.assertions(2);
            try {
                await service.list(fakeDb, { userRelation: 'organized' });
            } catch (e) {
                expect((e as ServiceError).code).toBe('BAD_REQUEST');
                expect((e as ServiceError).message).toContain(
                    'userId is required'
                );
            }
        });

        test('accepts joined userRelation', async () => {
            const filters = {
                userId: 'user-1',
                userRelation: 'joined' as const,
            };
            await service.list(fakeDb, filters);
            expect(mockModel.findAll).toHaveBeenCalledWith(fakeDb, filters);
        });

        test('accepts interested userRelation', async () => {
            const filters = {
                userId: 'user-1',
                userRelation: 'interested' as const,
            };
            await service.list(fakeDb, filters);
            expect(mockModel.findAll).toHaveBeenCalledWith(fakeDb, filters);
        });

        test('allows excluding user interactions for discovery', async () => {
            const filters = { userId: 'user-1', excludeUserInteractions: true };
            await service.list(fakeDb, filters);
            expect(mockModel.findAll).toHaveBeenCalledWith(fakeDb, filters);
        });

        test('throws BAD_REQUEST when excludeUserInteractions provided without userId', async () => {
            expect.assertions(2);
            try {
                await service.list(fakeDb, { excludeUserInteractions: true });
            } catch (e) {
                expect((e as ServiceError).code).toBe('BAD_REQUEST');
                expect((e as ServiceError).message).toContain(
                    'userId is required'
                );
            }
        });

        test('throws BAD_REQUEST when both userRelation and excludeUserInteractions are provided', async () => {
            expect.assertions(2);
            try {
                await service.list(fakeDb, {
                    userId: 'user-1',
                    userRelation: 'organized',
                    excludeUserInteractions: true,
                });
            } catch (e) {
                expect((e as ServiceError).code).toBe('BAD_REQUEST');
                expect((e as ServiceError).message).toContain(
                    'cannot be used together'
                );
            }
        });
    });

    describe('getById', () => {
        test('returns event when found', async () => {
            const event = { id: 'event-1', name: 'Run' };
            mockModel.findById.mockResolvedValueOnce(event);
            const result = await service.getById(fakeDb, 'event-1');
            expect(result).toHaveProperty('id', 'event-1');
        });

        test('throws NOT_FOUND when event does not exist', async () => {
            mockModel.findById.mockResolvedValueOnce(null);
            expect.assertions(3);
            try {
                await service.getById(fakeDb, 'missing');
            } catch (e) {
                expect(e).toBeInstanceOf(ServiceError);
                expect((e as ServiceError).code).toBe('NOT_FOUND');
                expect((e as ServiceError).statusCode).toBe(404);
            }
        });
    });

    describe('create', () => {
        const validInput: CreateEventInput = {
            name: 'Morning Run',
            sportId: 'sport-1',
            location: sampleLocation,
            skillLevel: 'beginner',
            startTime: futureDate,
            duration: 60,
            capacity: 10,
        };

        test('creates event with valid input', async () => {
            const created = makeMockEvent();
            mockModel.create.mockResolvedValueOnce(created);
            const result = await service.create(fakeDb, 'user-1', validInput);
            expect(result).toEqual(created);
            expect(mockLocationsService.findOrCreate).toHaveBeenCalledWith(
                fakeDb,
                sampleLocation
            );
            expect(mockModel.create).toHaveBeenCalledWith(
                fakeDb,
                'user-1',
                'loc-1',
                validInput
            );
        });

        test('throws BAD_REQUEST when start time is in the past', async () => {
            const pastInput = { ...validInput, startTime: pastDate };
            expect.assertions(3);
            try {
                await service.create(fakeDb, 'user-1', pastInput);
            } catch (e) {
                expect((e as ServiceError).code).toBe('BAD_REQUEST');
                expect((e as ServiceError).statusCode).toBe(400);
                expect(
                    mockLocationsService.findOrCreate
                ).not.toHaveBeenCalled();
            }
        });

        test('rolls back the transaction when model.create throws', async () => {
            const tx = {
                rolledBack: false,
            };
            const txDb = {
                transaction: async <T>(fn: (txDb: Database) => Promise<T>) => {
                    try {
                        return await fn(txDb);
                    } catch (err) {
                        tx.rolledBack = true;
                        throw err;
                    }
                },
            } as unknown as Database;

            mockModel.create.mockRejectedValueOnce(new Error('insert failed'));

            expect.assertions(3);
            try {
                await service.create(txDb, 'user-1', validInput);
            } catch (e) {
                expect((e as Error).message).toBe('insert failed');
                expect(tx.rolledBack).toBe(true);
                expect(mockLocationsService.findOrCreate).toHaveBeenCalledTimes(
                    1
                );
            }
        });
    });

    describe('update', () => {
        const updateInput: UpdateEventInput = { name: 'Updated Name' };

        test('updates event when user is organizer', async () => {
            const existing = makeMockEvent({ organizerId: 'user-1' });
            mockModel.findById.mockResolvedValueOnce(existing);
            const updated = makeMockEvent({ name: 'Updated Name' });
            mockModel.update.mockResolvedValueOnce(updated);

            const result = await service.update(
                fakeDb,
                'event-1',
                { id: 'user-1' },
                updateInput
            );
            expect(result).toEqual(updated);
        });

        test('updates event when actor is admin', async () => {
            const existing = makeMockEvent({ organizerId: 'user-1' });
            mockModel.findById.mockResolvedValueOnce(existing);
            const updated = makeMockEvent({ name: 'Updated Name' });
            mockModel.update.mockResolvedValueOnce(updated);

            const result = await service.update(
                fakeDb,
                'event-1',
                { id: 'admin-1', role: 'admin' },
                updateInput
            );

            expect(result).toEqual(updated);
        });

        test('throws NOT_FOUND when event does not exist', async () => {
            mockModel.findById.mockResolvedValueOnce(null);
            expect.assertions(1);
            try {
                await service.update(
                    fakeDb,
                    'missing',
                    { id: 'user-1' },
                    updateInput
                );
            } catch (e) {
                expect((e as ServiceError).code).toBe('NOT_FOUND');
            }
        });

        test('throws FORBIDDEN when user is not organizer', async () => {
            mockModel.findById.mockResolvedValueOnce(
                makeMockEvent({ organizerId: 'other-user' })
            );
            expect.assertions(2);
            try {
                await service.update(
                    fakeDb,
                    'event-1',
                    { id: 'user-1' },
                    updateInput
                );
            } catch (e) {
                expect((e as ServiceError).code).toBe('FORBIDDEN');
                expect((e as ServiceError).statusCode).toBe(403);
            }
        });

        test('throws CONFLICT when event is cancelled', async () => {
            mockModel.findById.mockResolvedValueOnce(
                makeMockEvent({
                    organizerId: 'user-1',
                    cancelledAt: new Date(),
                })
            );
            expect.assertions(1);
            try {
                await service.update(
                    fakeDb,
                    'event-1',
                    { id: 'user-1' },
                    updateInput
                );
            } catch (e) {
                expect((e as ServiceError).code).toBe('CONFLICT');
            }
        });

        test('throws BAD_REQUEST when new start time is in the past', async () => {
            mockModel.findById.mockResolvedValueOnce(
                makeMockEvent({ organizerId: 'user-1' })
            );
            expect.assertions(1);
            try {
                await service.update(
                    fakeDb,
                    'event-1',
                    { id: 'user-1' },
                    {
                        startTime: pastDate,
                    }
                );
            } catch (e) {
                expect((e as ServiceError).code).toBe('BAD_REQUEST');
            }
        });

        test('throws BAD_REQUEST when capacity is below current participants', async () => {
            mockModel.findById.mockResolvedValueOnce(
                makeMockEvent({
                    organizerId: 'user-1',
                    currentParticipants: 5,
                })
            );
            expect.assertions(1);
            try {
                await service.update(
                    fakeDb,
                    'event-1',
                    { id: 'user-1' },
                    {
                        capacity: 3,
                    }
                );
            } catch (e) {
                expect((e as ServiceError).code).toBe('BAD_REQUEST');
            }
        });

        test('emits event.updated on a significant change', async () => {
            mockModel.findById.mockResolvedValueOnce(
                makeMockEvent({ organizerId: 'user-1', name: 'Morning Run' })
            );

            await service.update(
                fakeDb,
                'event-1',
                { id: 'user-1' },
                {
                    startTime: futureDate,
                }
            );

            expect(mockBus.emit).toHaveBeenCalledWith(fakeDb, 'event.updated', {
                eventId: 'event-1',
                eventName: 'Morning Run',
                actorId: 'user-1',
            });
        });

        test('does not emit when only the description changes', async () => {
            mockModel.findById.mockResolvedValueOnce(
                makeMockEvent({ organizerId: 'user-1' })
            );

            await service.update(
                fakeDb,
                'event-1',
                { id: 'user-1' },
                {
                    description: 'typo fix',
                }
            );

            expect(mockBus.emit).not.toHaveBeenCalled();
        });
    });

    describe('cancel', () => {
        test('cancels event when user is organizer', async () => {
            mockModel.findRawById.mockResolvedValueOnce(
                makeMockEvent({ organizerId: 'user-1' })
            );
            const cancelled = makeMockEvent({ cancelledAt: new Date() });
            mockModel.cancel.mockResolvedValueOnce(cancelled);

            const result = await service.cancel(
                fakeDb,
                'event-1',
                { id: 'user-1' },
                'Rain'
            );
            expect(result).toEqual(cancelled);
            expect(mockModel.cancel).toHaveBeenCalledWith(
                fakeDb,
                'event-1',
                'Rain'
            );
        });

        test('cancels event when actor is admin', async () => {
            mockModel.findRawById.mockResolvedValueOnce(
                makeMockEvent({ organizerId: 'user-1' })
            );
            const cancelled = makeMockEvent({ cancelledAt: new Date() });
            mockModel.cancel.mockResolvedValueOnce(cancelled);

            const result = await service.cancel(
                fakeDb,
                'event-1',
                { id: 'admin-1', role: 'admin' },
                'Policy violation'
            );

            expect(result).toEqual(cancelled);
            expect(mockModel.cancel).toHaveBeenCalledWith(
                fakeDb,
                'event-1',
                'Policy violation'
            );
        });

        test('throws NOT_FOUND when event does not exist', async () => {
            mockModel.findRawById.mockResolvedValueOnce(null);
            expect.assertions(1);
            try {
                await service.cancel(fakeDb, 'missing', { id: 'user-1' });
            } catch (e) {
                expect((e as ServiceError).code).toBe('NOT_FOUND');
            }
        });

        test('throws FORBIDDEN when user is not organizer', async () => {
            mockModel.findRawById.mockResolvedValueOnce(
                makeMockEvent({ organizerId: 'other-user' })
            );
            expect.assertions(1);
            try {
                await service.cancel(fakeDb, 'event-1', { id: 'user-1' });
            } catch (e) {
                expect((e as ServiceError).code).toBe('FORBIDDEN');
            }
        });

        test('throws CONFLICT when event is already cancelled', async () => {
            mockModel.findRawById.mockResolvedValueOnce(
                makeMockEvent({
                    organizerId: 'user-1',
                    cancelledAt: new Date(),
                })
            );
            expect.assertions(1);
            try {
                await service.cancel(fakeDb, 'event-1', { id: 'user-1' });
            } catch (e) {
                expect((e as ServiceError).code).toBe('CONFLICT');
            }
        });

        test('emits event.cancelled after cancellation succeeds', async () => {
            mockModel.findRawById.mockResolvedValueOnce(
                makeMockEvent({ organizerId: 'user-1' })
            );
            mockModel.cancel.mockResolvedValueOnce(
                makeMockEvent({ name: 'Morning Run', cancelledAt: new Date() })
            );

            await service.cancel(fakeDb, 'event-1', { id: 'user-1' }, 'Rain');

            expect(mockBus.emit).toHaveBeenCalledWith(
                fakeDb,
                'event.cancelled',
                {
                    eventId: 'event-1',
                    eventName: 'Morning Run',
                    actorId: 'user-1',
                }
            );
        });
    });

    describe('delete', () => {
        test('soft-deletes event when user is organizer', async () => {
            mockModel.findRawById.mockResolvedValueOnce(
                makeMockEvent({ organizerId: 'user-1' })
            );
            await service.delete(fakeDb, 'event-1', { id: 'user-1' });
            expect(mockModel.softDelete).toHaveBeenCalledWith(
                fakeDb,
                'event-1'
            );
        });

        test('soft-deletes event when actor is admin', async () => {
            mockModel.findRawById.mockResolvedValueOnce(
                makeMockEvent({ organizerId: 'user-1' })
            );

            await service.delete(fakeDb, 'event-1', {
                id: 'admin-1',
                role: 'admin',
            });

            expect(mockModel.softDelete).toHaveBeenCalledWith(
                fakeDb,
                'event-1'
            );
        });

        test('throws NOT_FOUND when event does not exist', async () => {
            mockModel.findRawById.mockResolvedValueOnce(null);
            expect.assertions(1);
            try {
                await service.delete(fakeDb, 'missing', { id: 'user-1' });
            } catch (e) {
                expect((e as ServiceError).code).toBe('NOT_FOUND');
            }
        });

        test('throws FORBIDDEN when user is not organizer', async () => {
            mockModel.findRawById.mockResolvedValueOnce(
                makeMockEvent({ organizerId: 'other-user' })
            );
            expect.assertions(1);
            try {
                await service.delete(fakeDb, 'event-1', { id: 'user-1' });
            } catch (e) {
                expect((e as ServiceError).code).toBe('FORBIDDEN');
            }
        });
    });

    describe('getStatsByUserId', () => {
        test('returns event statistics for a user', async () => {
            const stats = { organized: 5, joined: 3, interested: 2 };
            mockModel.getStatsByUserId.mockResolvedValueOnce(stats);

            const result = await service.getStatsByUserId(fakeDb, 'user-1');

            expect(result).toEqual(stats);
            expect(mockModel.getStatsByUserId).toHaveBeenCalledWith(
                fakeDb,
                'user-1'
            );
        });

        test('returns zero counts when user has no events', async () => {
            const stats = { organized: 0, joined: 0, interested: 0 };
            mockModel.getStatsByUserId.mockResolvedValueOnce(stats);

            const result = await service.getStatsByUserId(fakeDb, 'user-1');

            expect(result).toEqual(stats);
        });
    });
});

describe('ServiceError', () => {
    test('has correct properties', () => {
        const error = new ServiceError('Not found', 'NOT_FOUND');
        expect(error.message).toBe('Not found');
        expect(error.code).toBe('NOT_FOUND');
        expect(error.statusCode).toBe(404);
        expect(error.name).toBe('ServiceError');
        expect(error).toBeInstanceOf(Error);
    });

    test('supports all error codes', () => {
        const codes = [
            { code: 'NOT_FOUND' as const, status: 404 },
            { code: 'FORBIDDEN' as const, status: 403 },
            { code: 'CONFLICT' as const, status: 409 },
            { code: 'BAD_REQUEST' as const, status: 400 },
            { code: 'UNAUTHORIZED' as const, status: 401 },
            { code: 'INTERNAL_ERROR' as const, status: 500 },
        ];
        for (const { code, status } of codes) {
            const error = new ServiceError('test', code);
            expect(error.code).toBe(code);
            expect(error.statusCode).toBe(status);
        }
    });

    test('static factories create correct errors', () => {
        expect(ServiceError.notFound('x').code).toBe('NOT_FOUND');
        expect(ServiceError.forbidden('x').code).toBe('FORBIDDEN');
        expect(ServiceError.unauthorized('x').code).toBe('UNAUTHORIZED');
        expect(ServiceError.conflict('x').code).toBe('CONFLICT');
        expect(ServiceError.badRequest('x').code).toBe('BAD_REQUEST');
    });
});
