import { db } from '../../db';
import { participationService } from './participation.service';

export const participationController = {
    async listParticipants(eventId: string) {
        return participationService.listParticipants(db, eventId);
    },

    async listInterested(eventId: string) {
        return participationService.listInterested(db, eventId);
    },

    async join(eventId: string, user: { id: string }) {
        return participationService.join(db, eventId, user.id);
    },

    async leave(eventId: string, user: { id: string }) {
        return participationService.leave(db, eventId, user.id);
    },

    async markInterest(eventId: string, user: { id: string }) {
        return participationService.markInterest(db, eventId, user.id);
    },

    async unmarkInterest(eventId: string, user: { id: string }) {
        return participationService.unmarkInterest(db, eventId, user.id);
    },
};
