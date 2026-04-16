import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UpdateFullProfileInput } from '../../../backend/src/modules/users/users.schema';
import {
    getPublicProfile,
    updateFullProfile,
    findUserByName,
    userQueryKeys,
} from '../lib/users-api';

export function usePublicProfile(userId?: string) {
    return useQuery({
        queryKey: userQueryKeys.profile(userId ?? 'missing'),
        queryFn: () => {
            if (!userId) {
                throw new Error('Missing user id');
            }
            return getPublicProfile(userId);
        },
        enabled: Boolean(userId),
    });
}

export function useUpdateFullProfile(userId?: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (body: UpdateFullProfileInput) => {
            if (!userId) {
                throw new Error('Missing user id');
            }
            return updateFullProfile(userId, body);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: userQueryKeys.all,
            });
        },
    });
}

export function useFindUserByName(name?: string) {
    return useQuery({
        queryKey: userQueryKeys.search(name ?? 'missing'),
        queryFn: () => {
            if (!name) {
                throw new Error('Missing user name');
            }
            return findUserByName(name);
        },
        enabled: Boolean(name),
    });
}
