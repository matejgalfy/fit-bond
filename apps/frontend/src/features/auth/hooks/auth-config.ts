import { useQuery } from '@tanstack/react-query';
import { authConfigQueryKeys, getAuthConfig } from '../api/auth-config-api';

/** Which sign-in methods the backend has enabled (Google is optional). */
export function useAuthConfig() {
    return useQuery({
        queryKey: authConfigQueryKeys.all,
        queryFn: getAuthConfig,
        // Only changes with a backend restart.
        staleTime: Infinity,
    });
}
