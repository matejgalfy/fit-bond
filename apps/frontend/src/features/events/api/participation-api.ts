import { api } from '@/lib/api';
import { throwIfError } from '@/lib/api-error';

export const participationQueryKeys = {
    all: ['participation'] as const,
    participants: (eventId: string) =>
        [...participationQueryKeys.all, 'participants', eventId] as const,
    interested: (eventId: string) =>
        [...participationQueryKeys.all, 'interested', eventId] as const,
};

export async function listParticipants(eventId: string) {
    const { data, error } = await api
        .events({ id: eventId })
        .participants.get();
    throwIfError(error, 'Failed to fetch participants');
    return data;
}

export async function listInterested(eventId: string) {
    const { data, error } = await api.events({ id: eventId }).interested.get();
    throwIfError(error, 'Failed to fetch interested users');
    return data;
}

export async function joinEvent(eventId: string) {
    const { data, error } = await api.events({ id: eventId }).join.post();
    throwIfError(error, 'Failed to join event');
    return data;
}

export async function leaveEvent(eventId: string) {
    const { data, error } = await api.events({ id: eventId }).join.delete();
    throwIfError(error, 'Failed to leave event');
    return data;
}

export async function markInterest(eventId: string) {
    const { data, error } = await api.events({ id: eventId }).interest.post();
    throwIfError(error, 'Failed to mark interest');
    return data;
}

export async function unmarkInterest(eventId: string) {
    const { data, error } = await api.events({ id: eventId }).interest.delete();
    throwIfError(error, 'Failed to unmark interest');
    return data;
}
