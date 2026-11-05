import { api } from '@/lib/api';
import { throwIfError } from '@/lib/api-error';

export const authConfigQueryKeys = {
    all: ['auth-config'] as const,
};

export async function getAuthConfig() {
    const { data, error } = await api['auth-config'].get();
    throwIfError(error, 'Failed to fetch auth config');
    return data;
}
