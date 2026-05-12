import { api } from '@/lib/api';
import { throwIfError } from '@/lib/api-error';
import type {
    UserProfile,
    UpdateProfileInput,
} from '../../../../../backend/src/modules/users/users.types';

export const userQueryKeys = {
    all: ['users'] as const,
    profile: (id: string) => [...userQueryKeys.all, 'profile', id] as const,
    search: (name: string) => [...userQueryKeys.all, 'search', name] as const,
};

export async function getUserProfile(userId: string): Promise<UserProfile> {
    const { data, error } = await api.users({ userId }).profile.get();
    throwIfError(error, 'Failed to fetch public profile');
    return data;
}

export async function updateProfile(userId: string, body: UpdateProfileInput) {
    const { data, error } = await api.users({ userId }).profile.patch(body);
    throwIfError(error, 'Failed to update profile');
    return data;
}
