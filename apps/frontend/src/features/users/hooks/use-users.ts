import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UpdateProfileInput } from '../../../../../backend/src/modules/users/users.types';
import { getUserProfile, updateProfile, userQueryKeys } from '../api/users-api';
import { authClient } from '@/lib/api';

export function useUserProfile(userId?: string) {
    return useQuery({
        queryKey: userQueryKeys.profile(userId),
        queryFn: () => {
            if (!userId) throw new Error('Missing user id');
            return getUserProfile(userId);
        },
        enabled: Boolean(userId),
    });
}

export function useUpdateProfile(userId?: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (body: UpdateProfileInput) => {
            if (!userId) {
                throw new Error('Missing user id');
            }
            return updateProfile(userId, body);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: userQueryKeys.all,
            });
            await authClient.getSession({
                fetchOptions: { cache: 'no-store' },
            });
        },
    });
}
