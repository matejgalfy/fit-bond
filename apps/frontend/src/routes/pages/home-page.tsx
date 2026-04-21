import { createFileRoute } from '@tanstack/react-router';
import { authClient } from '@/lib/api';
import { EventCard } from '@/features/events/components/event-card';
import type { Event } from '@/features/events/types';
import { useEvents } from '@/features/events/hooks/events';

export const Route = createFileRoute('/pages/home-page')({
    component: HomePage,
});

function HomePage() {
    const { data: session } = authClient.useSession();
    const { data: backendEvents } = useEvents({
        userId: session?.user.id,
        excludeUserInteractions: true,
    });

    if (!session?.user) return null;

    const firstName = session.user.name.split(' ')[0];
    const allEvents: Event[] = backendEvents ?? [];

    return (
        <div className="max-w-240 mx-auto">
            <div className="mb-6">
                <h1 className="font-heading text-[26px] font-bold m-0 text-foreground">
                    Welcome back,{' '}
                    <span className="text-primary">{firstName}</span> 👋
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Discover upcoming events near you and connect with fellow
                    athletes.
                </p>
            </div>

            <h2 className="font-heading text-lg font-semibold mb-4 mt-0 text-foreground">
                Upcoming events
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {allEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                ))}
            </div>
        </div>
    );
}
