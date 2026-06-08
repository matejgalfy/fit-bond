import type { EventBus } from '../../lib/eventBus';
import type { NotificationsService } from './notifications.service';
import type { UsersService } from '../users/users.service';
import type { Database } from '../../db';

export interface NotificationsSubscriberDeps {
    bus: Pick<EventBus, 'on'>;
    notificationsService: Pick<NotificationsService, 'create' | 'createMany'>;
    usersService: Pick<UsersService, 'getNameById' | 'getUsersByEventId'>;
}

export function registerNotificationsSubscribers({
    bus,
    notificationsService,
    usersService,
}: NotificationsSubscriberDeps) {
    async function fanoutToParticipants(
        db: Database,
        eventId: string,
        actorId: string,
        type: 'event_update' | 'event_cancelled',
        title: string,
        message: string
    ) {
        const participants = await usersService.getUsersByEventId(db, eventId);
        const rows = participants
            .filter((p) => p.id !== actorId)
            .map((p) => ({
                userId: p.id,
                type,
                title,
                message,
                eventId,
                relatedUserId: actorId,
            }));
        if (rows.length > 0) {
            await notificationsService.createMany(db, rows);
        }
    }

    async function notifyOrganizer(
        db: Database,
        payload: {
            organizerId: string;
            actorId: string;
            eventId: string;
            eventName: string;
        },
        type: 'participant_joined' | 'interest',
        title: string,
        verb: string
    ) {
        if (payload.organizerId === payload.actorId) return;
        const actor = await usersService.getNameById(db, payload.actorId);
        const actorName = actor?.name ?? 'Someone';
        await notificationsService.create(db, {
            userId: payload.organizerId,
            type,
            title,
            message: `${actorName} ${verb} your event ${payload.eventName}.`,
            eventId: payload.eventId,
            relatedUserId: payload.actorId,
        });
    }

    bus.on('event.updated', (db, p) =>
        fanoutToParticipants(
            db,
            p.eventId,
            p.actorId,
            'event_update',
            'Event updated',
            `${p.eventName} has been updated. Check the new details.`
        )
    );

    bus.on('event.cancelled', (db, p) =>
        fanoutToParticipants(
            db,
            p.eventId,
            p.actorId,
            'event_cancelled',
            'Event cancelled',
            `${p.eventName} has been cancelled.`
        )
    );

    bus.on('event.participant_joined', (db, p) =>
        notifyOrganizer(
            db,
            p,
            'participant_joined',
            'New participant joined',
            'joined'
        )
    );

    bus.on('event.participant_interested', (db, p) =>
        notifyOrganizer(
            db,
            p,
            'interest',
            'Someone is interested in your event',
            'is interested in'
        )
    );

    bus.on('event.commented', async (db, p) => {
        if (p.organizerId === p.actorId) return;
        const author = await usersService.getNameById(db, p.actorId);
        const authorName = author?.name ?? 'Someone';
        await notificationsService.create(db, {
            userId: p.organizerId,
            type: 'comment',
            title: 'New comment on your event',
            message: `${authorName} commented on ${p.eventName}.`,
            eventId: p.eventId,
            relatedUserId: p.actorId,
            commentId: p.commentId,
        });
    });
}
