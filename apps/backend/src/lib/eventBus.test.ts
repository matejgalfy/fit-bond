import { test, expect, describe, beforeEach, vi } from 'vitest';
import { createEventBus } from './eventBus';
import type { Database } from '../db';

const fakeDb = {} as unknown as Database;

describe('eventBus', () => {
    let bus: ReturnType<typeof createEventBus>;

    beforeEach(() => {
        bus = createEventBus();
    });

    test('emits to a single subscribed handler', async () => {
        const handler = vi.fn();
        bus.on('event.cancelled', handler);

        await bus.emit(fakeDb, 'event.cancelled', {
            eventId: 'e1',
            eventName: 'Run',
            actorId: 'u1',
        });

        expect(handler).toHaveBeenCalledWith(fakeDb, {
            eventId: 'e1',
            eventName: 'Run',
            actorId: 'u1',
        });
    });

    test('fans out to multiple handlers for the same event', async () => {
        const h1 = vi.fn();
        const h2 = vi.fn();
        bus.on('event.updated', h1);
        bus.on('event.updated', h2);

        await bus.emit(fakeDb, 'event.updated', {
            eventId: 'e1',
            eventName: 'Run',
            actorId: 'u1',
        });

        expect(h1).toHaveBeenCalledTimes(1);
        expect(h2).toHaveBeenCalledTimes(1);
    });

    test('does not invoke handlers for unrelated events', async () => {
        const h = vi.fn();
        bus.on('event.cancelled', h);

        await bus.emit(fakeDb, 'event.updated', {
            eventId: 'e1',
            eventName: 'Run',
            actorId: 'u1',
        });

        expect(h).not.toHaveBeenCalled();
    });

    test('a failing handler does not block other handlers', async () => {
        const consoleSpy = vi
            .spyOn(console, 'error')
            .mockImplementation(() => undefined);
        const failing = vi.fn(() => Promise.reject(new Error('boom')));
        const succeeding = vi.fn();
        bus.on('event.cancelled', failing);
        bus.on('event.cancelled', succeeding);

        await bus.emit(fakeDb, 'event.cancelled', {
            eventId: 'e1',
            eventName: 'Run',
            actorId: 'u1',
        });

        expect(failing).toHaveBeenCalled();
        expect(succeeding).toHaveBeenCalled();
        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });
});
