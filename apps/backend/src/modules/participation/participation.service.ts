import type { Database } from '../../db';
import { ServiceError } from '../../utils/errors';
import {
    participationModel as defaultModel,
    type ParticipationModel,
} from './participation.model';
import {
    eventsModel as defaultEventsModel,
    type EventsModel,
} from '../events/events.model';
import {
    usersModel as defaultUsersModel,
    type UsersModel,
} from '../users/users.model';
import {
    notificationsService as defaultNotifications,
    type NotificationsService,
} from '../notifications/notifications.service';
import type { NotificationType } from '../notifications/notifications.types';

export interface ParticipationServiceDeps {
    model?: ParticipationModel;
    eventsModel?: Pick<EventsModel, 'findRawById'>;
    usersModel?: Pick<UsersModel, 'getUserNameById'>;
    notifications?: Pick<NotificationsService, 'create'>;
}

export function createParticipationService({
    model = defaultModel,
    eventsModel = defaultEventsModel,
    usersModel = defaultUsersModel,
    notifications = defaultNotifications,
}: ParticipationServiceDeps = {}) {
    async function requireEvent(db: Database, eventId: string) {
        const event = await eventsModel.findRawById(db, eventId);
        if (!event) {
            throw ServiceError.notFound('Event not found');
        }
        return event;
    }

    async function notifyOrganizer(
        db: Database,
        event: { id: string; organizerId: string; name: string },
        actorId: string,
        type: NotificationType['type'],
        title: string,
        verb: string
    ) {
        try {
            const actor = await usersModel.getUserNameById(db, actorId);
            const actorName = actor?.name ?? 'Someone';
            await notifications.create(db, {
                userId: event.organizerId,
                type,
                title,
                message: `${actorName} ${verb} your event ${event.name}.`,
                eventId: event.id,
                relatedUserId: actorId,
            });
        } catch (err: unknown) {
            console.error('Notification creation failed:', err);
        }
    }

    return {
        async listParticipants(db: Database, eventId: string) {
            await requireEvent(db, eventId);
            return model.findParticipants(db, eventId);
        },

        async listInterested(db: Database, eventId: string) {
            await requireEvent(db, eventId);
            return model.findInterested(db, eventId);
        },

        async join(db: Database, eventId: string, userId: string) {
            const event = await requireEvent(db, eventId);

            if (event.cancelledAt) {
                throw ServiceError.conflict('Cannot join a cancelled event');
            }
            if (new Date(event.startTime) <= new Date()) {
                throw ServiceError.conflict('Event has already started');
            }
            if (event.organizerId === userId) {
                throw ServiceError.conflict(
                    'You are the organizer of this event'
                );
            }
            if (await model.isParticipant(db, eventId, userId)) {
                throw ServiceError.conflict(
                    'You have already joined this event'
                );
            }

            const participantCount = await model.countParticipants(db, eventId);
            if (participantCount >= event.capacity) {
                throw ServiceError.conflict('Event is full');
            }

            await model.addParticipant(db, eventId, userId);
            await notifyOrganizer(
                db,
                event,
                userId,
                'participant_joined',
                'New participant joined',
                'joined'
            );
            return { success: true };
        },

        async leave(db: Database, eventId: string, userId: string) {
            await requireEvent(db, eventId);

            if (!(await model.isParticipant(db, eventId, userId))) {
                throw ServiceError.conflict('You have not joined this event');
            }

            await model.removeParticipant(db, eventId, userId);
            return { success: true };
        },

        async markInterest(db: Database, eventId: string, userId: string) {
            const event = await requireEvent(db, eventId);

            if (event.cancelledAt) {
                throw ServiceError.conflict(
                    'Cannot mark interest in a cancelled event'
                );
            }
            if (new Date(event.startTime) <= new Date()) {
                throw ServiceError.conflict('Event has already started');
            }
            if (event.organizerId === userId) {
                throw ServiceError.conflict(
                    'You are the organizer of this event'
                );
            }
            if (await model.isParticipant(db, eventId, userId)) {
                throw ServiceError.conflict(
                    'You have already joined this event'
                );
            }
            if (await model.isInterested(db, eventId, userId)) {
                throw ServiceError.conflict('You have already marked interest');
            }

            await model.addInterested(db, eventId, userId);
            await notifyOrganizer(
                db,
                event,
                userId,
                'interest',
                'Someone is interested in your event',
                'is interested in'
            );
            return { success: true };
        },

        async unmarkInterest(db: Database, eventId: string, userId: string) {
            await requireEvent(db, eventId);

            if (!(await model.isInterested(db, eventId, userId))) {
                throw ServiceError.conflict('You have not marked interest');
            }

            await model.removeInterested(db, eventId, userId);
            return { success: true };
        },
    };
}

export const participationService = createParticipationService();
export type ParticipationService = ReturnType<
    typeof createParticipationService
>;
