import { api } from './api';
import type { UpdateFullProfileInput } from '../../../backend/src/modules/users/users.schema';

interface EdenErrorLike {
    value?: unknown;
    message?: unknown;
}

function getErrorMessage(error: unknown, fallbackMessage: string): string {
    if (!error || typeof error !== 'object') return fallbackMessage;
    const errorLike = error as EdenErrorLike;
    if (typeof errorLike.value === 'string' && errorLike.value.length > 0)
        return errorLike.value;
    if (typeof errorLike.message === 'string' && errorLike.message.length > 0)
        return errorLike.message;
    return fallbackMessage;
}

function throwIfResponseError(error: unknown, fallbackMessage: string): void {
    if (error != null) {
        throw new Error(getErrorMessage(error, fallbackMessage));
    }
}

export const userQueryKeys = {
    all: ['users'] as const,
    profile: (id: string) => [...userQueryKeys.all, 'profile', id] as const,
    search: (name: string) => [...userQueryKeys.all, 'search', name] as const,
};

export async function getPublicProfile(userId: string) {
    const response = await api.users({ userId }).profile.get();
    throwIfResponseError(response.error, 'Failed to fetch public profile');
    return response.data;
}

export async function updateFullProfile(
    userId: string,
    body: UpdateFullProfileInput
) {
    const response = await api.users({ userId }).profile.put(body);
    throwIfResponseError(response.error, 'Failed to update profile');
    return response.data;
}

export async function findUserByName(name: string) {
    const response = await api.users.name({ name }).get();
    throwIfResponseError(response.error, 'Failed to find user');
    return response.data;
}
