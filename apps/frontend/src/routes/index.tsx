import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { authClient } from '@/lib/api';
import { useCurrentUserRole } from '@/features/admin/hooks/current-user';

export const Route = createFileRoute('/')({
    component: IndexRedirect,
});

function IndexRedirect() {
    const navigate = useNavigate();
    const { data: session, isPending } = authClient.useSession();
    const { data: role, isPending: rolePending } = useCurrentUserRole();

    useEffect(() => {
        if (isPending || rolePending) return;

        if (session?.user) {
            void navigate({
                to: role === 'admin' ? '/admin' : '/home-page',
                replace: true,
            });
            return;
        }

        void navigate({ to: '/auth/login', replace: true });
    }, [isPending, rolePending, navigate, session?.user, role]);

    return null;
}
