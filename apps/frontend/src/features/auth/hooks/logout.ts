import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { authClient } from '@/lib/api';

export function useLogout() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { refetch: refetchSession } = authClient.useSession();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [logoutError, setLogoutError] = useState('');

    async function logout() {
        if (isLoggingOut) return;

        setLogoutError('');
        setIsLoggingOut(true);

        try {
            const { error } = await authClient.signOut();

            if (error) {
                setLogoutError(
                    error.message ?? 'Log out failed. Please try again.'
                );
                setIsLoggingOut(false);
                return;
            }

            await refetchSession();
            await queryClient.cancelQueries();
            queryClient.removeQueries();

            void navigate({ to: '/auth/login', replace: true });
        } catch {
            setLogoutError('Log out failed. Please try again.');
            setIsLoggingOut(false);
        }
    }

    return {
        logout,
        isLoggingOut,
        logoutError,
    };
}
