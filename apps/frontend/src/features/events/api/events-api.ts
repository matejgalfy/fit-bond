import { api } from '@/lib/api';
import { throwIfError } from '@/lib/api-error';
import type {
    CancelEventBody,
    CreateEventBody,
    EventQueryFilters,
    EventStatsResponse,
    UpdateEventBody,
} from '../../../../../backend/src/modules/events/events.schema';
import type { Event } from '../types';

export const eventQueryKeys = {
    all: ['events'] as const,
    lists: () => [...eventQueryKeys.all, 'list'] as const,
    list: (filters?: EventQueryFilters) =>
        [...eventQueryKeys.lists(), filters ?? null] as const,
    infiniteLists: () => [...eventQueryKeys.all, 'infinite-list'] as const,
    infiniteList: (filters?: EventQueryFilters) =>
        [...eventQueryKeys.infiniteLists(), filters ?? null] as const,
    details: () => [...eventQueryKeys.all, 'detail'] as const,
    detail: (id: string) => [...eventQueryKeys.details(), id] as const,
    stats: (userId: string) =>
        [...eventQueryKeys.all, 'stats', userId] as const,
};

export async function listEvents(filters?: EventQueryFilters) {
    const { data, error } = await api.events.get({ query: filters });
    throwIfError(error, 'Failed to fetch events');
    return data;
}

export async function getEvent(id: string): Promise<Event> {
    const { data, error } = await api.events({ id }).get();
    throwIfError(error, 'Failed to fetch event');
    return data;
}

export async function createEvent(body: CreateEventBody) {
    const { data, error } = await api.events.post(body);
    throwIfError(error, 'Failed to create event');
    return data;
}

export async function updateEvent(id: string, body: UpdateEventBody) {
    const { data, error } = await api.events({ id }).patch(body);
    throwIfError(error, 'Failed to update event');
    return data;
}

export async function cancelEvent(id: string, body: CancelEventBody) {
    const { data, error } = await api.events({ id }).cancel.post(body);
    throwIfError(error, 'Failed to cancel event');
    return data;
}

export async function getEventStats(
    userId: string
): Promise<EventStatsResponse> {
    const { data, error } = await api.events.stats({ userId }).get();
    throwIfError(error, 'Failed to fetch event statistics');
    return data;
}
