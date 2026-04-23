import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/api';

export const Route = createFileRoute('/main')({
    component: MainPage,
});

function MainPage() {
    const navigate = useNavigate();
    const { data: session, isPending } = authClient.useSession();

    const handleSignOut = () => {
        authClient
            .signOut()
            .then(() => {
                void navigate({ to: '/auth/login' });
            })
            .catch(console.error);
    };

    if (isPending) {
        return null;
    }

    if (!session?.user) {
        void navigate({ to: '/auth/login' });
        return null;
    }

    return (
        <div className="min-h-svh bg-background text-primary-text flex flex-col items-center justify-center gap-6">
            <h1 className="text-heading font-bold">
                Hello, {session.user.name}
            </h1>
            <Button
                variant="outline"
                onClick={handleSignOut}
                className="rounded-xl"
            >
                Sign out
            </Button>
        </div>
    );
}
