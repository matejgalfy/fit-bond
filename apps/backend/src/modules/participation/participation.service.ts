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

export interface ParticipationServiceDeps {
    model?: ParticipationModel;
    eventsModel?: Pick<EventsModel, 'findRawById'>;
}

export function createParticipationService({
    model = defaultModel,
    eventsModel = defaultEventsModel,
}: ParticipationServiceDeps = {}) {
    async function requireEvent(db: Database, eventId: string) {
        const event = await eventsModel.findRawById(db, eventId);
        if (!event) {
            throw ServiceError.notFound('Event not found');
        }
        return event;
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

            const participantCount = await model.countParticipants(
                db,
                eventId
            );
            if (participantCount >= event.capacity) {
                throw ServiceError.conflict('Event is full');
            }

            await model.addParticipant(db, eventId, userId);
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
                throw ServiceError.conflict(
                    'You have already marked interest'
                );
            }

            await model.addInterested(db, eventId, userId);
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
