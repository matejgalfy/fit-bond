import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { authClient } from '@/lib/api';

export const Route = createFileRoute('/')({
    component: IndexRedirect,
});

function IndexRedirect() {
    const navigate = useNavigate();
    const { data: session, isPending } = authClient.useSession();

    if (isPending) {
        return null;
    }

    if (session?.user) {
        void navigate({ to: '/main' });
    } else {
        void navigate({ to: '/auth/login' });
    }

    return null;
}
