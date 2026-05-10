import { useQuery } from '@tanstack/react-query';
import type { UserRole } from '../types';

const adminRoleQueryKey = ['admin', 'current-user-role'] as const;

export function useCurrentUserRole() {
    return useQuery<UserRole>({
        queryKey: adminRoleQueryKey,
        queryFn: () => Promise.resolve('admin'),
        staleTime: Infinity,
    });
}

export function useIsAdmin() {
    const { data } = useCurrentUserRole();
    return data === 'admin';
}
