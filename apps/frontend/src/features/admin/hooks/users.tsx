import {
    keepPreviousData,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';
import type {
    AdminUserQueryFilters,
    BanUserBody,
    UpdateUserAdminBody,
} from '../../../../../backend/src/modules/admin/admin.schema';
import {
    adminQueryKeys,
    banAdminUser,
    deleteAdminUser,
    getAdminUser,
    listAdminUsers,
    unbanAdminUser,
    updateAdminUser,
} from '../api/admin-api';

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
        ]);
}

export function useBanUser() {
    const invalidate = useInvalidateAdminUsers();
    return useMutation({
        mutationFn: ({ id, body }: { id: string; body: BanUserBody }) =>
            banAdminUser(id, body),
        onSuccess: async (_data, variables) => {
            await invalidate(variables.id);
        },
    });
}

export function useUnbanUser() {
    const invalidate = useInvalidateAdminUsers();
    return useMutation({
        mutationFn: ({ id }: { id: string }) => unbanAdminUser(id),
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

export function useDeleteAdminUser() {
    const invalidate = useInvalidateAdminUsers();
    return useMutation({
        mutationFn: ({ id }: { id: string }) => deleteAdminUser(id),
        onSuccess: async (_data, variables) => {
            await invalidate(variables.id);
        },
    });
}
