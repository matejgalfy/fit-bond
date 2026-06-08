import {
    keepPreviousData,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';
import type {
    AdminUserQueryFilters,
    UpdateUserAdminBody,
} from '../../../../../backend/src/modules/admin/admin.schema';
import {
    adminQueryKeys,
    getAdminUser,
    listAdminUsers,
    updateAdminUser,
} from '../api/admin-api';
import { userQueryKeys } from '@/features/users/api/users-api';
import { authClient } from '@/lib/api';

export function useAdminUsers(filters?: AdminUserQueryFilters) {
    return useQuery({
        queryKey: adminQueryKeys.users(filters),
        queryFn: () => listAdminUsers(filters),
        placeholderData: keepPreviousData,
    });
}

export function useAdminUser(id?: string) {
    return useQuery({
        queryKey: adminQueryKeys.userDetail(id ?? 'missing'),
        queryFn: () => {
            if (!id) {
                throw new Error('Missing user id');
            }
            return getAdminUser(id);
        },
        enabled: Boolean(id),
    });
}

function useInvalidateAdminUsers() {
    const queryClient = useQueryClient();
    return (id?: string) =>
        Promise.all([
            queryClient.invalidateQueries({
                queryKey: [...adminQueryKeys.all, 'users'],
            }),
            id
                ? queryClient.invalidateQueries({
                      queryKey: adminQueryKeys.userDetail(id),
                  })
                : Promise.resolve(),
            id
                ? queryClient.invalidateQueries({
                      queryKey: userQueryKeys.profile(id),
                  })
                : Promise.resolve(),
        ]);
}

export function useBanUser() {
    const invalidate = useInvalidateAdminUsers();
    return useMutation({
        mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
            const { error } = await authClient.admin.banUser({
                userId: id,
                banReason: reason,
            });
            if (error) {
                throw new Error(error.message ?? 'Failed to ban user');
            }
        },
        onSuccess: async (_data, variables) => {
            await invalidate(variables.id);
        },
    });
}

export function useUnbanUser() {
    const invalidate = useInvalidateAdminUsers();
    return useMutation({
        mutationFn: async ({ id }: { id: string }) => {
            const { error } = await authClient.admin.unbanUser({
                userId: id,
            });
            if (error) {
                throw new Error(error.message ?? 'Failed to unban user');
            }
        },
        onSuccess: async (_data, variables) => {
            await invalidate(variables.id);
        },
    });
}

export function useUpdateAdminUser() {
    const invalidate = useInvalidateAdminUsers();
    return useMutation({
        mutationFn: ({ id, body }: { id: string; body: UpdateUserAdminBody }) =>
            updateAdminUser(id, body),
        onSuccess: async (_data, variables) => {
            await invalidate(variables.id);
        },
    });
}
