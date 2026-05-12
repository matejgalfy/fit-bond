import { authClient } from '@/lib/api';
import type { UserRole } from '../types';

export function useCurrentUserRole() {
    const { data: session, isPending } = authClient.useSession();
    const role = (session?.user as { role?: UserRole } | undefined)?.role;
    return { data: role, isPending };
}

export function useIsAdmin() {
    const { data } = useCurrentUserRole();
    return data === 'admin';
}
