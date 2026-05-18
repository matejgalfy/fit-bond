import {
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';
import type { Participant } from '../types';
import { eventQueryKeys } from '../api/events-api';
import {
    joinEvent,
    leaveEvent,
    listInterested,
    listParticipants,
    markInterest,
    participationQueryKeys,
    unmarkInterest,
} from '../api/participation-api';

export function useEventParticipants(eventId?: string) {
    return useQuery<Participant[]>({
        queryKey: participationQueryKeys.participants(eventId ?? 'missing'),
        queryFn: () => {
            if (!eventId) {
                throw new Error('Missing event id');
            }

            return listParticipants(eventId);
        },
        enabled: Boolean(eventId),
    });
}

export function useEventInterested(eventId?: string) {
    return useQuery<Participant[]>({
        queryKey: participationQueryKeys.interested(eventId ?? 'missing'),
        queryFn: () => {
            if (!eventId) {
                throw new Error('Missing event id');
            }

            return listInterested(eventId);
        },
        enabled: Boolean(eventId),
    });
}

function useParticipationMutation(
    eventId: string,
    action: (eventId: string) => Promise<unknown>
) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => action(eventId),
        onSuccess: async () => {
            // Join/interest are mutually exclusive and change two lists plus
            // the event counts, so refresh both query trees.
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: participationQueryKeys.all,
                }),
                queryClient.invalidateQueries({
                    queryKey: eventQueryKeys.all,
                }),
            ]);
        },
    });
}

export function useJoinEvent(eventId: string) {
    return useParticipationMutation(eventId, joinEvent);
}

export function useLeaveEvent(eventId: string) {
    return useParticipationMutation(eventId, leaveEvent);
}

export function useMarkInterest(eventId: string) {
    return useParticipationMutation(eventId, markInterest);
}

export function useUnmarkInterest(eventId: string) {
    return useParticipationMutation(eventId, unmarkInterest);
}
