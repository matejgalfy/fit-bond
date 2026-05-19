import { test, expect, describe, beforeEach, vi } from 'vitest';
import { createParticipationService } from './participation.service';
import { ServiceError } from '../../utils/errors';
import type { ParticipationModel } from './participation.model';
import type { EventsModel } from '../events/events.model';
import type { EventType } from '../events/events.types';
import type { Database } from '../../db';

const futureDate = new Date(Date.now() + 86400000);
const pastDate = new Date(Date.now() - 86400000);

function makeFakeDb(): Database {
    const fake = {
        transaction: async <T>(fn: (tx: Database) => Promise<T>) =>
            fn(fake as unknown as Database),
    };
    return fake as unknown as Database;
}

function makeMockEvent(overrides: Partial<EventType> = {}): EventType {
    return {
        id: 'event-1',
        organizerId: 'organizer-1',
        locationId: 'loc-1',
        sportId: 'sport-1',
        name: 'Morning Run',
        description: 'A casual morning run',
        skillLevel: 'beginner',
        startTime: futureDate,
        duration: 60,
        capacity: 10,
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
        findParticipants: vi.fn(() => Promise.resolve([] as unknown[])),
        findInterested: vi.fn(() => Promise.resolve([] as unknown[])),
        isParticipant: vi.fn(() => Promise.resolve(false)),
        isInterested: vi.fn(() => Promise.resolve(false)),
        countParticipants: vi.fn(() => Promise.resolve(0)),
        addParticipant: vi.fn(() => Promise.resolve()),
        removeParticipant: vi.fn(() => Promise.resolve()),
        addInterested: vi.fn(() => Promise.resolve()),
        removeInterested: vi.fn(() => Promise.resolve()),
    };
}

function makeMockEventsModel() {
    return {
        findRawById: vi.fn(() =>
            Promise.resolve(makeMockEvent() as EventType | null)
        ),
    };
}

const fakeDb = makeFakeDb();

describe('ParticipationService', () => {
    let mockModel: ReturnType<typeof makeMockModel>;
    let mockEventsModel: ReturnType<typeof makeMockEventsModel>;
    let service: ReturnType<typeof createParticipationService>;

    beforeEach(() => {
        mockModel = makeMockModel();
        mockEventsModel = makeMockEventsModel();
        service = createParticipationService({
            model: mockModel as unknown as ParticipationModel,
            eventsModel: mockEventsModel as unknown as Pick<
                EventsModel,
                'findRawById'
            >,
        });
    });

    describe('listParticipants', () => {
        test('returns participants when event exists', async () => {
            const users = [{ id: 'u1', name: 'A', image: null }];
            mockModel.findParticipants.mockResolvedValueOnce(users);
            const result = await service.listParticipants(fakeDb, 'event-1');
            expect(result).toEqual(users);
            expect(mockModel.findParticipants).toHaveBeenCalledWith(
                fakeDb,
                'event-1'
            );
        });

        test('throws NOT_FOUND when event does not exist', async () => {
            mockEventsModel.findRawById.mockResolvedValueOnce(null);
            expect.assertions(2);
            try {
                await service.listParticipants(fakeDb, 'missing');
            } catch (e) {
                expect((e as ServiceError).code).toBe('NOT_FOUND');
                expect((e as ServiceError).statusCode).toBe(404);
            }
        });
    });

    describe('listInterested', () => {
        test('returns interested users when event exists', async () => {
            const users = [{ id: 'u2', name: 'B', image: null }];
            mockModel.findInterested.mockResolvedValueOnce(users);
            const result = await service.listInterested(fakeDb, 'event-1');
            expect(result).toEqual(users);
        });

        test('throws NOT_FOUND when event does not exist', async () => {
            mockEventsModel.findRawById.mockResolvedValueOnce(null);
            expect.assertions(1);
            try {
                await service.listInterested(fakeDb, 'missing');
            } catch (e) {
                expect((e as ServiceError).code).toBe('NOT_FOUND');
            }
        });
    });

    describe('join', () => {
        test('joins when all checks pass', async () => {
            const result = await service.join(fakeDb, 'event-1', 'user-1');
            expect(result).toEqual({ success: true });
            expect(mockModel.addParticipant).toHaveBeenCalledWith(
                fakeDb,
                'event-1',
                'user-1'
            );
        });

        test('throws NOT_FOUND when event does not exist', async () => {
            mockEventsModel.findRawById.mockResolvedValueOnce(null);
            expect.assertions(1);
            try {
                await service.join(fakeDb, 'missing', 'user-1');
            } catch (e) {
                expect((e as ServiceError).code).toBe('NOT_FOUND');
            }
        });

        test('throws CONFLICT when event is cancelled', async () => {
            mockEventsModel.findRawById.mockResolvedValueOnce(
                makeMockEvent({ cancelledAt: new Date() })
            );
            expect.assertions(1);
            try {
                await service.join(fakeDb, 'event-1', 'user-1');
            } catch (e) {
                expect((e as ServiceError).code).toBe('CONFLICT');
            }
        });

        test('throws CONFLICT when event has already started', async () => {
            mockEventsModel.findRawById.mockResolvedValueOnce(
                makeMockEvent({ startTime: pastDate })
            );
            expect.assertions(1);
            try {
                await service.join(fakeDb, 'event-1', 'user-1');
            } catch (e) {
                expect((e as ServiceError).code).toBe('CONFLICT');
            }
        });

        test('throws CONFLICT when user is the organizer', async () => {
            mockEventsModel.findRawById.mockResolvedValueOnce(
                makeMockEvent({ organizerId: 'user-1' })
            );
            expect.assertions(1);
            try {
                await service.join(fakeDb, 'event-1', 'user-1');
            } catch (e) {
                expect((e as ServiceError).code).toBe('CONFLICT');
            }
        });

        test('throws CONFLICT when already joined', async () => {
            mockModel.isParticipant.mockResolvedValueOnce(true);
            expect.assertions(1);
            try {
                await service.join(fakeDb, 'event-1', 'user-1');
            } catch (e) {
                expect((e as ServiceError).code).toBe('CONFLICT');
            }
        });

        test('throws CONFLICT when event is full', async () => {
            mockEventsModel.findRawById.mockResolvedValueOnce(
                makeMockEvent({ capacity: 5 })
            );
            mockModel.countParticipants.mockResolvedValueOnce(5);
            expect.assertions(2);
            try {
                await service.join(fakeDb, 'event-1', 'user-1');
            } catch (e) {
                expect((e as ServiceError).code).toBe('CONFLICT');
                expect((e as ServiceError).message).toContain('full');
            }
        });

        test('clears interest by delegating to model.addParticipant', async () => {
            await service.join(fakeDb, 'event-1', 'user-1');
            expect(mockModel.addParticipant).toHaveBeenCalledTimes(1);
            expect(mockModel.addInterested).not.toHaveBeenCalled();
        });
    });

    describe('leave', () => {
        test('leaves when user is a participant', async () => {
            mockModel.isParticipant.mockResolvedValueOnce(true);
            const result = await service.leave(fakeDb, 'event-1', 'user-1');
            expect(result).toEqual({ success: true });
            expect(mockModel.removeParticipant).toHaveBeenCalledWith(
                fakeDb,
                'event-1',
                'user-1'
            );
        });

        test('throws NOT_FOUND when event does not exist', async () => {
            mockEventsModel.findRawById.mockResolvedValueOnce(null);
            expect.assertions(1);
            try {
                await service.leave(fakeDb, 'missing', 'user-1');
            } catch (e) {
                expect((e as ServiceError).code).toBe('NOT_FOUND');
            }
        });

        test('throws CONFLICT when user has not joined', async () => {
            mockModel.isParticipant.mockResolvedValueOnce(false);
            expect.assertions(1);
            try {
                await service.leave(fakeDb, 'event-1', 'user-1');
            } catch (e) {
                expect((e as ServiceError).code).toBe('CONFLICT');
            }
        });
    });

    describe('markInterest', () => {
        test('marks interest when all checks pass', async () => {
            const result = await service.markInterest(
                fakeDb,
                'event-1',
                'user-1'
            );
            expect(result).toEqual({ success: true });
            expect(mockModel.addInterested).toHaveBeenCalledWith(
                fakeDb,
                'event-1',
                'user-1'
            );
        });

        test('throws NOT_FOUND when event does not exist', async () => {
            mockEventsModel.findRawById.mockResolvedValueOnce(null);
            expect.assertions(1);
            try {
                await service.markInterest(fakeDb, 'missing', 'user-1');
            } catch (e) {
                expect((e as ServiceError).code).toBe('NOT_FOUND');
            }
        });

        test('throws CONFLICT when event is cancelled', async () => {
            mockEventsModel.findRawById.mockResolvedValueOnce(
                makeMockEvent({ cancelledAt: new Date() })
            );
            expect.assertions(1);
            try {
                await service.markInterest(fakeDb, 'event-1', 'user-1');
            } catch (e) {
                expect((e as ServiceError).code).toBe('CONFLICT');
            }
        });

        test('throws CONFLICT when user already joined', async () => {
            mockModel.isParticipant.mockResolvedValueOnce(true);
            expect.assertions(2);
            try {
                await service.markInterest(fakeDb, 'event-1', 'user-1');
            } catch (e) {
                expect((e as ServiceError).code).toBe('CONFLICT');
                expect((e as ServiceError).message).toContain('already joined');
            }
        });

        test('throws CONFLICT when interest already marked', async () => {
            mockModel.isInterested.mockResolvedValueOnce(true);
            expect.assertions(1);
            try {
                await service.markInterest(fakeDb, 'event-1', 'user-1');
            } catch (e) {
                expect((e as ServiceError).code).toBe('CONFLICT');
            }
        });
    });

    describe('unmarkInterest', () => {
        test('unmarks interest when previously marked', async () => {
            mockModel.isInterested.mockResolvedValueOnce(true);
            const result = await service.unmarkInterest(
                fakeDb,
                'event-1',
                'user-1'
            );
            expect(result).toEqual({ success: true });
            expect(mockModel.removeInterested).toHaveBeenCalledWith(
                fakeDb,
                'event-1',
                'user-1'
            );
        });

        test('throws NOT_FOUND when event does not exist', async () => {
            mockEventsModel.findRawById.mockResolvedValueOnce(null);
            expect.assertions(1);
            try {
                await service.unmarkInterest(fakeDb, 'missing', 'user-1');
            } catch (e) {
                expect((e as ServiceError).code).toBe('NOT_FOUND');
            }
        });

        test('throws CONFLICT when interest was not marked', async () => {
            mockModel.isInterested.mockResolvedValueOnce(false);
            expect.assertions(1);
            try {
                await service.unmarkInterest(fakeDb, 'event-1', 'user-1');
            } catch (e) {
                expect((e as ServiceError).code).toBe('CONFLICT');
            }
        });
    });
});
