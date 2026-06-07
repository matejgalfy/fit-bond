import {
    keepPreviousData,
    useInfiniteQuery,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';
import type {
    CancelEventBody,
    CreateEventBody,
    EventQueryFilters,
    EventStatsResponse,
    UpdateEventBody,
} from '../../../../../backend/src/modules/events/events.schema';
import type { Event } from '../types';
import {
    cancelEvent,
    createEvent,
    eventQueryKeys,
    getEvent,
    getEventStats,
    listEvents,
    updateEvent,
} from '../api/events-api';

export function useEvents(filters?: EventQueryFilters) {
    return useQuery<Event[]>({
        queryKey: eventQueryKeys.list(filters),
        queryFn: () => listEvents(filters),
        placeholderData: keepPreviousData,
    });
}

export function useInfiniteEvents(filters?: EventQueryFilters) {
    const limit = filters?.limit ?? 20;

    return useInfiniteQuery<Event[]>({
        queryKey: eventQueryKeys.infiniteList(filters),
        queryFn: ({ pageParam }) =>
            listEvents({ ...filters, limit, offset: pageParam as number }),
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) =>
            lastPage.length < limit ? undefined : allPages.length * limit,
        placeholderData: keepPreviousData,
    });
}

export function useEvent(id?: string) {
    return useQuery<Event>({
        queryKey: eventQueryKeys.detail(id ?? 'missing'),
        queryFn: () => {
            if (!id) {
                throw new Error('Missing event id');
            }

            return getEvent(id);
        },
        enabled: Boolean(id),
    });
}

export function useEventStats(userId?: string) {
    return useQuery<EventStatsResponse>({
        queryKey: eventQueryKeys.stats(userId ?? 'missing'),
        queryFn: () => {
            if (!userId) {
                throw new Error('Missing user id');
            }

            return getEventStats(userId);
        },
        enabled: Boolean(userId),
    });
}

export function useCreateEvent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (body: CreateEventBody) => createEvent(body),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: eventQueryKeys.all,
            });
        },
    });
}

export function useUpdateEvent(id?: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (body: UpdateEventBody) => {
            if (!id) {
                throw new Error('Missing event id');
            }

            return updateEvent(id, body);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: eventQueryKeys.all,
            });
        },
    });
}

export function useCancelEvent(id?: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (body: CancelEventBody) => {
            if (!id) {
                throw new Error('Missing event id');
            }

            return cancelEvent(id, body);
        },
        onSuccess: async () => {
            // Cancelled events drop out of normal-user lists and gain a
            // "Cancelled" badge in admin views, so refresh both event feeds.
            await queryClient.invalidateQueries({
                queryKey: eventQueryKeys.all,
            });
            await queryClient.invalidateQueries({
                queryKey: ['admin', 'events'],
            });
        },
    });
}
