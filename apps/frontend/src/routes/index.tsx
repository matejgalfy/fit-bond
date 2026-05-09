import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { authClient } from '@/lib/api';

export const Route = createFileRoute('/')({
    component: IndexRedirect,
});

function IndexRedirect() {
    const navigate = useNavigate();
    const { data: session, isPending } = authClient.useSession();

    useEffect(() => {
        if (isPending) return;

        if (session?.user) {
            void navigate({ to: '/pages/home-page', replace: true });
            return;
        }

        void navigate({ to: '/auth/login', replace: true });
    }, [isPending, navigate, session?.user]);

    return null;
}
