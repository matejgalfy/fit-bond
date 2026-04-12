import {
    keepPreviousData,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';
import type {
    CancelEventBody,
    CreateEventBody,
    EventQueryFilters,
    UpdateEventBody,
} from '../../../backend/src/modules/events/events.schema';
import {
    cancelEvent,
    createEvent,
    deleteEvent,
    eventQueryKeys,
    getEvent,
    listEvents,
    updateEvent,
} from '../lib/events-api';

export function useEvents(filters?: EventQueryFilters) {
    return useQuery({
        queryKey: eventQueryKeys.list(filters),
        queryFn: () => listEvents(filters),
        placeholderData: keepPreviousData,
    });
}

export function useEvent(id?: string) {
    return useQuery({
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
            await queryClient.invalidateQueries({
                queryKey: eventQueryKeys.all,
            });
        },
    });
}

export function useDeleteEvent(id?: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => {
            if (!id) {
                throw new Error('Missing event id');
            }

            return deleteEvent(id);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: eventQueryKeys.all,
            });
        },
    });
}
