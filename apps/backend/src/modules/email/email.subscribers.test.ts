import { test, expect, describe, beforeEach, vi } from 'vitest';
import { createEventBus } from '../../lib/eventBus';
import { registerEmailSubscribers } from './email.subscribers';
import type { Database } from '../../db';
import type { EmailService } from './email.service';

type CancelledMail = ReturnType<EmailService['eventCancelledEmail']>;
type WelcomeMail = ReturnType<EmailService['sendWelcomeEmail']>;

const fakeDb = {} as unknown as Database;

function makeMockUsersService() {
    return {
        getUsersByEventId: vi.fn(() =>
            Promise.resolve([
                { id: 'p1', name: 'P1', email: 'p1@x.com', image: null },
                { id: 'p2', name: 'P2', email: 'p2@x.com', image: null },
            ])
        ),
    };
}

function makeMockEmailService() {
    return {
        eventCancelledEmail: vi.fn(
            (): CancelledMail =>
                Promise.resolve({
                    data: null,
                    error: null,
                }) as unknown as CancelledMail
        ),
        sendWelcomeEmail: vi.fn(
            (): WelcomeMail =>
                Promise.resolve({
                    data: null,
                    error: null,
                }) as unknown as WelcomeMail
        ),
    };
}

describe('email subscribers', () => {
    let bus: ReturnType<typeof createEventBus>;
    let usersService: ReturnType<typeof makeMockUsersService>;
    let emailService: ReturnType<typeof makeMockEmailService>;

    beforeEach(() => {
        bus = createEventBus();
        usersService = makeMockUsersService();
        emailService = makeMockEmailService();
        registerEmailSubscribers({ bus, usersService, emailService });
    });

    test('event.cancelled sends a cancellation email to every participant', async () => {
        await bus.emit(fakeDb, 'event.cancelled', {
            eventId: 'event-1',
            eventName: 'Run',
            actorId: 'actor-1',
        });

        expect(emailService.eventCancelledEmail).toHaveBeenCalledTimes(2);
        expect(emailService.eventCancelledEmail).toHaveBeenCalledWith(
            'p1@x.com',
            'Run'
        );
        expect(emailService.eventCancelledEmail).toHaveBeenCalledWith(
            'p2@x.com',
            'Run'
        );
    });

    test('event.cancelled with no participants sends nothing', async () => {
        usersService.getUsersByEventId.mockResolvedValueOnce([]);
        await bus.emit(fakeDb, 'event.cancelled', {
            eventId: 'event-1',
            eventName: 'Run',
            actorId: 'actor-1',
        });
        expect(emailService.eventCancelledEmail).not.toHaveBeenCalled();
    });

    test('does not subscribe to unrelated events', async () => {
        await bus.emit(fakeDb, 'event.updated', {
            eventId: 'event-1',
            eventName: 'Run',
            actorId: 'actor-1',
        });
        expect(emailService.eventCancelledEmail).not.toHaveBeenCalled();
    });
});
