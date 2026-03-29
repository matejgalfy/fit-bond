import { test, expect, describe, beforeEach, mock } from 'bun:test';
import { createEventsService, EventsServiceError } from './events.service';
import type { EventsModel } from './events.model';
import type { Database } from '../../db';
import type { Event, CreateEventInput, UpdateEventInput } from './events.types';

const futureDate = new Date(Date.now() + 86400000).toISOString();
const pastDate = new Date(Date.now() - 86400000).toISOString();

function makeMockEvent(overrides: Partial<Event> = {}): Event {
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
        findAll: mock(() => Promise.resolve([] as unknown[])),
        findById: mock(() =>
            Promise.resolve(null as Record<string, unknown> | null)
        ),
        findRawById: mock(() => Promise.resolve(null as Event | null)),
        create: mock(() => Promise.resolve(makeMockEvent())),
        update: mock(() => Promise.resolve(makeMockEvent() as Event | null)),
        cancel: mock(() => Promise.resolve(makeMockEvent() as Event | null)),
        softDelete: mock(() =>
            Promise.resolve(makeMockEvent() as Event | null)
        ),
    };
}

const fakeDb = {} as unknown as Database;

describe('EventsService', () => {
    let mockModel: ReturnType<typeof makeMockModel>;
    let service: ReturnType<typeof createEventsService>;

    beforeEach(() => {
        mockModel = makeMockModel();
        service = createEventsService(mockModel as unknown as EventsModel);
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
                expect(e).toBeInstanceOf(EventsServiceError);
                expect((e as EventsServiceError).code).toBe('NOT_FOUND');
                expect((e as EventsServiceError).statusCode).toBe(404);
            }
        });
    });

    describe('create', () => {
        const validInput: CreateEventInput = {
            name: 'Morning Run',
            sportId: 'sport-1',
            locationId: 'loc-1',
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
            expect(mockModel.create).toHaveBeenCalledWith(
                fakeDb,
                'user-1',
                validInput
            );
        });

        test('throws BAD_REQUEST when start time is in the past', async () => {
            const pastInput = { ...validInput, startTime: pastDate };
            expect.assertions(2);
            try {
                await service.create(fakeDb, 'user-1', pastInput);
            } catch (e) {
                expect((e as EventsServiceError).code).toBe('BAD_REQUEST');
                expect((e as EventsServiceError).statusCode).toBe(400);
            }
        });
    });

    describe('update', () => {
        const updateInput: UpdateEventInput = { name: 'Updated Name' };

        test('updates event when user is organizer', async () => {
            const existing = makeMockEvent({ organizerId: 'user-1' });
            mockModel.findRawById.mockResolvedValueOnce(existing);
            const updated = makeMockEvent({ name: 'Updated Name' });
            mockModel.update.mockResolvedValueOnce(updated);

            const result = await service.update(
                fakeDb,
                'event-1',
                'user-1',
                updateInput
            );
            expect(result).toEqual(updated);
        });

        test('throws NOT_FOUND when event does not exist', async () => {
            mockModel.findRawById.mockResolvedValueOnce(null);
            expect.assertions(1);
            try {
                await service.update(fakeDb, 'missing', 'user-1', updateInput);
            } catch (e) {
                expect((e as EventsServiceError).code).toBe('NOT_FOUND');
            }
        });

        test('throws FORBIDDEN when user is not organizer', async () => {
            mockModel.findRawById.mockResolvedValueOnce(
                makeMockEvent({ organizerId: 'other-user' })
            );
            expect.assertions(2);
            try {
                await service.update(fakeDb, 'event-1', 'user-1', updateInput);
            } catch (e) {
                expect((e as EventsServiceError).code).toBe('FORBIDDEN');
                expect((e as EventsServiceError).statusCode).toBe(403);
            }
        });

        test('throws CONFLICT when event is cancelled', async () => {
            mockModel.findRawById.mockResolvedValueOnce(
                makeMockEvent({
                    organizerId: 'user-1',
                    cancelledAt: new Date(),
                })
            );
            expect.assertions(1);
            try {
                await service.update(fakeDb, 'event-1', 'user-1', updateInput);
            } catch (e) {
                expect((e as EventsServiceError).code).toBe('CONFLICT');
            }
        });

        test('throws BAD_REQUEST when new start time is in the past', async () => {
            mockModel.findRawById.mockResolvedValueOnce(
                makeMockEvent({ organizerId: 'user-1' })
            );
            expect.assertions(1);
            try {
                await service.update(fakeDb, 'event-1', 'user-1', {
                    startTime: pastDate,
                });
            } catch (e) {
                expect((e as EventsServiceError).code).toBe('BAD_REQUEST');
            }
        });

        test('throws BAD_REQUEST when capacity is below current participants', async () => {
            mockModel.findRawById.mockResolvedValueOnce(
                makeMockEvent({
                    organizerId: 'user-1',
                    currentParticipants: 5,
                })
            );
            expect.assertions(1);
            try {
                await service.update(fakeDb, 'event-1', 'user-1', {
                    capacity: 3,
                });
            } catch (e) {
                expect((e as EventsServiceError).code).toBe('BAD_REQUEST');
            }
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
                'user-1',
                'Rain'
            );
            expect(result).toEqual(cancelled);
            expect(mockModel.cancel).toHaveBeenCalledWith(
                fakeDb,
                'event-1',
                'Rain'
            );
        });

        test('throws NOT_FOUND when event does not exist', async () => {
            mockModel.findRawById.mockResolvedValueOnce(null);
            expect.assertions(1);
            try {
                await service.cancel(fakeDb, 'missing', 'user-1');
            } catch (e) {
                expect((e as EventsServiceError).code).toBe('NOT_FOUND');
            }
        });

        test('throws FORBIDDEN when user is not organizer', async () => {
            mockModel.findRawById.mockResolvedValueOnce(
                makeMockEvent({ organizerId: 'other-user' })
            );
            expect.assertions(1);
            try {
                await service.cancel(fakeDb, 'event-1', 'user-1');
            } catch (e) {
                expect((e as EventsServiceError).code).toBe('FORBIDDEN');
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
                await service.cancel(fakeDb, 'event-1', 'user-1');
            } catch (e) {
                expect((e as EventsServiceError).code).toBe('CONFLICT');
            }
        });
    });

    describe('delete', () => {
        test('soft-deletes event when user is organizer', async () => {
            mockModel.findRawById.mockResolvedValueOnce(
                makeMockEvent({ organizerId: 'user-1' })
            );
            await service.delete(fakeDb, 'event-1', 'user-1');
            expect(mockModel.softDelete).toHaveBeenCalledWith(
                fakeDb,
                'event-1'
            );
        });

        test('throws NOT_FOUND when event does not exist', async () => {
            mockModel.findRawById.mockResolvedValueOnce(null);
            expect.assertions(1);
            try {
                await service.delete(fakeDb, 'missing', 'user-1');
            } catch (e) {
                expect((e as EventsServiceError).code).toBe('NOT_FOUND');
            }
        });

        test('throws FORBIDDEN when user is not organizer', async () => {
            mockModel.findRawById.mockResolvedValueOnce(
                makeMockEvent({ organizerId: 'other-user' })
            );
            expect.assertions(1);
            try {
                await service.delete(fakeDb, 'event-1', 'user-1');
            } catch (e) {
                expect((e as EventsServiceError).code).toBe('FORBIDDEN');
            }
        });
    });
});

describe('EventsServiceError', () => {
    test('has correct properties', () => {
        const error = new EventsServiceError('Not found', 'NOT_FOUND', 404);
        expect(error.message).toBe('Not found');
        expect(error.code).toBe('NOT_FOUND');
        expect(error.statusCode).toBe(404);
        expect(error.name).toBe('EventsServiceError');
        expect(error).toBeInstanceOf(Error);
    });

    test('supports all error codes', () => {
        const codes = [
            { code: 'NOT_FOUND' as const, status: 404 },
            { code: 'FORBIDDEN' as const, status: 403 },
            { code: 'CONFLICT' as const, status: 409 },
            { code: 'BAD_REQUEST' as const, status: 400 },
        ];
        for (const { code, status } of codes) {
            const error = new EventsServiceError('test', code, status);
            expect(error.code).toBe(code);
            expect(error.statusCode).toBe(status);
        }
    });
});
