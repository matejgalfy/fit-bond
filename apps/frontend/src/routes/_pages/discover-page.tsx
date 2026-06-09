import { createFileRoute } from '@tanstack/react-router';
import { authClient } from '@/lib/api';
import { EventsBrowser } from '@/features/events/components/events-browser';

export const Route = createFileRoute('/_pages/discover-page')({
    component: DiscoverPage,
});

function DiscoverPage() {
    const { data: session } = authClient.useSession();

    if (!session?.user) return null;

    return (
        <div className="max-w-240">
            <div className="mb-6">
                <h1 className="font-heading text-heading font-bold m-0 text-primary-text">
                    Discover Events
                </h1>
                <p className="text-regular text-secondary-text mt-1">
                    Find sport activities that match your interests
                </p>
            </div>

            <EventsBrowser
                userId={session.user.id}
                excludeUserInteractions={true}
            />
        </div>
    );
}
