import { test, expect, describe, beforeEach, vi } from 'vitest';
import { createEventBus } from '../../lib/eventBus';
import { registerNotificationsSubscribers } from './notifications.subscribers';
import type { Database } from '../../db';

const fakeDb = {} as unknown as Database;

function makeMockNotificationsService() {
    return {
        create: vi.fn(() => Promise.resolve(null)),
        createMany: vi.fn(() => Promise.resolve([])),
    };
}

function makeMockUsersService() {
    return {
        getNameById: vi.fn(
            (): Promise<{ id: string; name: string } | null> =>
                Promise.resolve({ id: 'actor-1', name: 'Alice' })
        ),
        getUsersByEventId: vi.fn(() =>
            Promise.resolve([
                { id: 'p1', name: 'P1', email: 'p1@x.com', image: null },
                { id: 'p2', name: 'P2', email: 'p2@x.com', image: null },
                {
                    id: 'actor-1',
                    name: 'Alice',
                    email: 'a@x.com',
                    image: null,
                },
            ])
        ),
    };
}

describe('notifications subscribers', () => {
    let bus: ReturnType<typeof createEventBus>;
    let notificationsService: ReturnType<typeof makeMockNotificationsService>;
    let usersService: ReturnType<typeof makeMockUsersService>;

    beforeEach(() => {
        bus = createEventBus();
        notificationsService = makeMockNotificationsService();
        usersService = makeMockUsersService();
        registerNotificationsSubscribers({
            bus,
            notificationsService,
            usersService,
        });
    });

    test('event.updated fans out to participants excluding the actor', async () => {
        await bus.emit(fakeDb, 'event.updated', {
            eventId: 'event-1',
            eventName: 'Run',
            actorId: 'actor-1',
        });

        expect(notificationsService.createMany).toHaveBeenCalledWith(fakeDb, [
            {
                userId: 'p1',
                type: 'event_update',
                title: 'Event updated',
                message: 'Run has been updated. Check the new details.',
                eventId: 'event-1',
                relatedUserId: 'actor-1',
            },
            {
                userId: 'p2',
                type: 'event_update',
                title: 'Event updated',
                message: 'Run has been updated. Check the new details.',
                eventId: 'event-1',
                relatedUserId: 'actor-1',
            },
        ]);
    });

    test('event.updated does nothing when no other participants', async () => {
        usersService.getUsersByEventId.mockResolvedValueOnce([
            { id: 'actor-1', name: 'A', email: 'a@x.com', image: null },
        ]);
        await bus.emit(fakeDb, 'event.updated', {
            eventId: 'event-1',
            eventName: 'Run',
            actorId: 'actor-1',
        });
        expect(notificationsService.createMany).not.toHaveBeenCalled();
    });

    test('event.cancelled fans out with cancellation copy', async () => {
        await bus.emit(fakeDb, 'event.cancelled', {
            eventId: 'event-1',
            eventName: 'Run',
            actorId: 'actor-1',
        });
        expect(notificationsService.createMany).toHaveBeenCalledWith(
            fakeDb,
            expect.arrayContaining([
                expect.objectContaining({
                    userId: 'p1',
                    type: 'event_cancelled',
                    title: 'Event cancelled',
                    message: 'Run has been cancelled.',
                }),
                expect.objectContaining({
                    userId: 'p2',
                    type: 'event_cancelled',
                }),
            ])
        );
    });

    test('event.participant_joined notifies the organizer with actor name', async () => {
        await bus.emit(fakeDb, 'event.participant_joined', {
            eventId: 'event-1',
            eventName: 'Run',
            organizerId: 'organizer-1',
            actorId: 'actor-1',
        });

        expect(notificationsService.create).toHaveBeenCalledWith(fakeDb, {
            userId: 'organizer-1',
            type: 'participant_joined',
            title: 'New participant joined',
            message: 'Alice joined your event Run.',
            eventId: 'event-1',
            relatedUserId: 'actor-1',
        });
    });

    test('event.participant_joined falls back to "Someone" when name is missing', async () => {
        usersService.getNameById.mockResolvedValueOnce(null);
        await bus.emit(fakeDb, 'event.participant_joined', {
            eventId: 'event-1',
            eventName: 'Run',
            organizerId: 'organizer-1',
            actorId: 'actor-1',
        });

        expect(notificationsService.create).toHaveBeenCalledWith(
            fakeDb,
            expect.objectContaining({
                message: 'Someone joined your event Run.',
            })
        );
    });

    test('event.participant_joined skips when actor is the organizer', async () => {
        await bus.emit(fakeDb, 'event.participant_joined', {
            eventId: 'event-1',
            eventName: 'Run',
            organizerId: 'self',
            actorId: 'self',
        });
        expect(notificationsService.create).not.toHaveBeenCalled();
    });

    test('event.participant_interested uses interest copy', async () => {
        await bus.emit(fakeDb, 'event.participant_interested', {
            eventId: 'event-1',
            eventName: 'Run',
            organizerId: 'organizer-1',
            actorId: 'actor-1',
        });
        expect(notificationsService.create).toHaveBeenCalledWith(fakeDb, {
            userId: 'organizer-1',
            type: 'interest',
            title: 'Someone is interested in your event',
            message: 'Alice is interested in your event Run.',
            eventId: 'event-1',
            relatedUserId: 'actor-1',
        });
    });

    test('event.commented notifies the organizer with comment copy', async () => {
        await bus.emit(fakeDb, 'event.commented', {
            eventId: 'event-1',
            eventName: 'Run',
            organizerId: 'organizer-1',
            actorId: 'actor-1',
            commentId: 'c-1',
        });
        expect(notificationsService.create).toHaveBeenCalledWith(fakeDb, {
            userId: 'organizer-1',
            type: 'comment',
            title: 'New comment on your event',
            message: 'Alice commented on Run.',
            eventId: 'event-1',
            relatedUserId: 'actor-1',
        });
    });

    test('event.commented skips when organizer comments on own event', async () => {
        await bus.emit(fakeDb, 'event.commented', {
            eventId: 'event-1',
            eventName: 'Run',
            organizerId: 'self',
            actorId: 'self',
            commentId: 'c-1',
        });
        expect(notificationsService.create).not.toHaveBeenCalled();
    });
});
