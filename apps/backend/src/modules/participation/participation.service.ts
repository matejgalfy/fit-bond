import type { Database } from '../../db';
import { ServiceError } from '../../utils/errors';
import {
    participationModel as defaultModel,
    type ParticipationModel,
} from './participation.model';
import type { EventsService } from '../events/events.service';
import type { EventBus } from '../../lib/eventBus';
import { hasDateTimePassed } from '../../utils/time';

export interface ParticipationServiceDeps {
    model?: ParticipationModel;
    eventsService: Pick<EventsService, 'loadRaw'>;
    bus: Pick<EventBus, 'emit'>;
}

function assertEventOpenToActor(
    event: {
        cancelledAt: Date | null;
        startTime: Date | string;
        organizerId: string;
    },
    actorId: string,
    action: string
) {
    if (event.cancelledAt) {
        throw ServiceError.conflict(`Cannot ${action} a cancelled event`);
    }
    if (hasDateTimePassed(event.startTime)) {
        throw ServiceError.conflict('Event has already started');
    }
    if (event.organizerId === actorId) {
        throw ServiceError.conflict('You are the organizer of this event');
    }
}

export function createParticipationService({
    model = defaultModel,
    eventsService,
    bus,
}: ParticipationServiceDeps) {
    return {
        async listParticipants(db: Database, eventId: string) {
            await eventsService.loadRaw(db, eventId);
            return model.findParticipants(db, eventId);
        },

        async listInterested(db: Database, eventId: string) {
            await eventsService.loadRaw(db, eventId);
            return model.findInterested(db, eventId);
        },

        async join(db: Database, eventId: string, userId: string) {
            const event = await eventsService.loadRaw(db, eventId);
            assertEventOpenToActor(event, userId, 'join');

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
            await bus.emit(db, 'event.participant_joined', {
                eventId,
                eventName: event.name,
                organizerId: event.organizerId,
                actorId: userId,
            });
            return { success: true };
        },

        async leave(db: Database, eventId: string, userId: string) {
            await eventsService.loadRaw(db, eventId);

            if (!(await model.isParticipant(db, eventId, userId))) {
                throw ServiceError.conflict('You have not joined this event');
            }

            await model.removeParticipant(db, eventId, userId);
            return { success: true };
        },

        async markInterest(db: Database, eventId: string, userId: string) {
            const event = await eventsService.loadRaw(db, eventId);
            assertEventOpenToActor(event, userId, 'mark interest in');

            if (await model.isParticipant(db, eventId, userId)) {
                throw ServiceError.conflict(
                    'You have already joined this event'
                );
            }
            if (await model.isInterested(db, eventId, userId)) {
                throw ServiceError.conflict('You have already marked interest');
            }

            await model.addInterested(db, eventId, userId);
            await bus.emit(db, 'event.participant_interested', {
                eventId,
                eventName: event.name,
                organizerId: event.organizerId,
                actorId: userId,
            });
            return { success: true };
        },

        async unmarkInterest(db: Database, eventId: string, userId: string) {
            await eventsService.loadRaw(db, eventId);

            if (!(await model.isInterested(db, eventId, userId))) {
                throw ServiceError.conflict('You have not marked interest');
            }

            await model.removeInterested(db, eventId, userId);
            return { success: true };
        },
    };
}

export type ParticipationService = ReturnType<
    typeof createParticipationService
>;
