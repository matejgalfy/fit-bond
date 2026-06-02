import { test, expect, describe, beforeEach, vi } from 'vitest';
import { createNotificationsService } from './notifications.service';
import { notificationsModel } from './notifications.model';
import type { NotificationsModel } from './notifications.model';
import type { CreateNotificationInput } from './notifications.types';
import type { Database } from '../../db';

const fakeDb = {} as unknown as Database;

const sampleInput: CreateNotificationInput = {
    userId: 'organizer-1',
    type: 'participant_joined',
    title: 'New participant joined',
    message: 'Marek R. joined your event Morning Run.',
    eventId: 'event-1',
    relatedUserId: 'user-1',
};

function makeMockModel() {
    return {
        findAll: vi.fn(() => Promise.resolve([] as unknown[])),
        findUnread: vi.fn(() => Promise.resolve([] as unknown[])),
        findRawById: vi.fn(() => Promise.resolve(null)),
        update: vi.fn(() => Promise.resolve(null)),
        markAllRead: vi.fn(() => Promise.resolve()),
        softDelete: vi.fn(() => Promise.resolve(null)),
        create: vi.fn(() => Promise.resolve({ id: 'n1', ...sampleInput })),
        createMany: vi.fn(() => Promise.resolve([])),
    };
}

describe('NotificationsService', () => {
    let mockModel: ReturnType<typeof makeMockModel>;
    let service: ReturnType<typeof createNotificationsService>;

    beforeEach(() => {
        mockModel = makeMockModel();
        service = createNotificationsService({
            model: mockModel as unknown as NotificationsModel,
        });
    });

    describe('create', () => {
        test('delegates to model.create and returns the row', async () => {
            const result = await service.create(fakeDb, sampleInput);
            expect(mockModel.create).toHaveBeenCalledWith(fakeDb, sampleInput);
            expect(result).toHaveProperty('id', 'n1');
        });
    });

    describe('createMany', () => {
        test('delegates to model.createMany', async () => {
            const inputs = [sampleInput, { ...sampleInput, userId: 'u2' }];
            await service.createMany(fakeDb, inputs);
            expect(mockModel.createMany).toHaveBeenCalledWith(fakeDb, inputs);
        });

        test('passes an empty array straight through', async () => {
            await service.createMany(fakeDb, []);
            expect(mockModel.createMany).toHaveBeenCalledWith(fakeDb, []);
        });
    });
});

describe('notificationsModel.createMany', () => {
    test('short-circuits on an empty array without touching the db', async () => {
        const exploding = {
            insert: () => {
                throw new Error('db should not be called');
            },
        } as unknown as Database;

        const result = await notificationsModel.createMany(exploding, []);
        expect(result).toEqual([]);
    });
});
