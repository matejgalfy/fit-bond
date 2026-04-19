import { api } from '@/lib/api';
import { throwIfError } from '@/lib/api-error';
import type { UpdateFullProfileInput } from '../../../../../backend/src/modules/users/users.schema';

export const userQueryKeys = {
    all: ['users'] as const,
    profile: (id: string) => [...userQueryKeys.all, 'profile', id] as const,
    search: (name: string) => [...userQueryKeys.all, 'search', name] as const,
};

export async function getPublicProfile(userId: string) {
    const { data, error } = await api.users({ userId }).profile.get();
    throwIfError(error, 'Failed to fetch public profile');
    return data;
}

export async function updateFullProfile(
    userId: string,
    body: UpdateFullProfileInput
) {
    const { data, error } = await api.users({ userId }).profile.put(body);
    throwIfError(error, 'Failed to update profile');
    return data;
}

export async function findUserByName(name: string) {
    const { data, error } = await api.users.name({ name }).get();
    throwIfError(error, 'Failed to find user');
    return data;
}
