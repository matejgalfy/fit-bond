import { api } from './api';
import type {
    CancelEventBody,
    CreateEventBody,
    EventQueryFilters,
    UpdateEventBody,
} from '../../../backend/src/modules/events/events.schema';

interface EdenErrorLike {
    value?: unknown;
    message?: unknown;
}

function getErrorMessage(error: unknown, fallbackMessage: string): string {
    if (!error || typeof error !== 'object') {
        return fallbackMessage;
    }

    const errorLike = error as EdenErrorLike;
    if (typeof errorLike.value === 'string' && errorLike.value.length > 0) {
        return errorLike.value;
    }

    if (typeof errorLike.message === 'string' && errorLike.message.length > 0) {
        return errorLike.message;
    }

    return fallbackMessage;
}

function throwIfResponseError(error: unknown, fallbackMessage: string): void {
    if (error != null) {
        throw new Error(getErrorMessage(error, fallbackMessage));
    }
}

export const eventQueryKeys = {
    all: ['events'] as const,
    lists: () => [...eventQueryKeys.all, 'list'] as const,
    list: (filters?: EventQueryFilters) =>
        [...eventQueryKeys.lists(), filters ?? null] as const,
    details: () => [...eventQueryKeys.all, 'detail'] as const,
    detail: (id: string) => [...eventQueryKeys.details(), id] as const,
};

export async function listEvents(filters?: EventQueryFilters) {
    const response = await api.events.get({ query: filters });
    throwIfResponseError(response.error, 'Failed to fetch events');
    return response.data;
}

export async function getEvent(id: string) {
    const response = await api.events({ id }).get();
    throwIfResponseError(response.error, 'Failed to fetch event');
    return response.data;
}

export async function createEvent(body: CreateEventBody) {
    const response = await api.events.post(body);
    throwIfResponseError(response.error, 'Failed to create event');
    return response.data;
}

export async function updateEvent(id: string, body: UpdateEventBody) {
    const response = await api.events({ id }).patch(body);
    throwIfResponseError(response.error, 'Failed to update event');
    return response.data;
}

export async function cancelEvent(id: string, body: CancelEventBody) {
    const response = await api.events({ id }).cancel.post(body);
    throwIfResponseError(response.error, 'Failed to cancel event');
    return response.data;
}

export async function deleteEvent(id: string) {
    const response = await api.events({ id }).delete();
    throwIfResponseError(response.error, 'Failed to delete event');
    return response.data;
}
