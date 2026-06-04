import { useMemo } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { authClient } from '@/lib/api';
import { EventCard } from '@/features/events/components/event-card';
import type { Event } from '@/features/events/types';
import { useEvents } from '@/features/events/hooks/events';
import { useUserProfile } from '@/features/users/hooks/use-users';

export const Route = createFileRoute('/pages/home-page')({
    component: HomePage,
});

function HomePage() {
    const { data: session } = authClient.useSession();
    const { data: profile } = useUserProfile(session?.user.id);

    const apiFilters = useMemo(() => {
        return {
            userId: session?.user.id,
            excludeUserInteractions: true,
            sportIds: profile?.sports.map((s) => s.id) ?? undefined,
            lat: profile?.location?.lat ?? undefined,
            lng: profile?.location?.lng ?? undefined,
            radius: profile?.location?.radius ?? undefined,
        };
    }, [session?.user.id, profile]);

    const { data: backendEvents } = useEvents(apiFilters);

    if (!session?.user) return null;

    const firstName = session.user.name.split(' ')[0];
    const allEvents: Event[] = backendEvents ?? [];

    return (
        <div className="max-w-240">
            <div className="mb-6">
                <h1 className="font-heading text-heading font-bold m-0 text-primary-text">
                    Welcome back,{' '}
                    <span className="text-primary-blue">{firstName}</span> 👋
                </h1>
                <p className="text-regular text-secondary-text mt-1">
                    Discover upcoming events near you and connect with fellow
                    athletes.
                </p>
            </div>

            <h2 className="font-heading text-subheading font-semibold mb-4 mt-0 text-primary-text">
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
