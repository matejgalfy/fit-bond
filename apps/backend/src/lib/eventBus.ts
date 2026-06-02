import type { Database } from '../db';

export interface DomainEvents {
    'event.updated': {
        eventId: string;
        eventName: string;
        actorId: string;
    };
    'event.cancelled': {
        eventId: string;
        eventName: string;
        actorId: string;
    };
    'event.participant_joined': {
        eventId: string;
        eventName: string;
        organizerId: string;
        actorId: string;
    };
    'event.participant_interested': {
        eventId: string;
        eventName: string;
        organizerId: string;
        actorId: string;
    };
    'event.commented': {
        eventId: string;
        eventName: string;
        organizerId: string;
        actorId: string;
        commentId: string;
    };
    'user.registered': {
        userId: string;
        email: string;
        name: string;
    };
}

export type DomainEventName = keyof DomainEvents;

export type DomainEventHandler<E extends DomainEventName> = (
    db: Database,
    payload: DomainEvents[E]
) => Promise<void> | void;

type AnyHandler = (db: Database, payload: unknown) => Promise<void> | void;

export interface EventBus {
    on<E extends DomainEventName>(
        eventName: E,
        handler: DomainEventHandler<E>
    ): void;
    emit<E extends DomainEventName>(
        db: Database,
        eventName: E,
        payload: DomainEvents[E]
    ): Promise<void>;
}

export function createEventBus(): EventBus {
    const handlers = new Map<DomainEventName, AnyHandler[]>();

    return {
        on(eventName, handler) {
            const list = handlers.get(eventName) ?? [];
            list.push(handler as AnyHandler);
            handlers.set(eventName, list);
        },

        async emit(db, eventName, payload) {
            const list = handlers.get(eventName) ?? [];
            await Promise.all(
                list.map(async (h) => {
                    try {
                        await h(db, payload);
                    } catch (err: unknown) {
                        console.error(
                            `Handler for "${eventName}" failed:`,
                            err
                        );
                    }
                })
            );
        },
    };
}

export const eventBus = createEventBus();
