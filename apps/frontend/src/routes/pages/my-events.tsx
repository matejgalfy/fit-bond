import { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { authClient } from '@/lib/api';
import { EventCard } from '@/features/events/components/event-card';
import { EventAddButton } from '@/features/events/components/event-add-button';
import { EventTabFilter } from '@/features/events/components/event-tab-filter';
import { EventTab, type EventTabValue } from '../../features/events/event-tabs';
import { useEvents, useEventStats } from '@/features/events/hooks/events';

export const Route = createFileRoute('/pages/my-events')({
    component: MyEventsPage,
});

function MyEventsPage() {
    const navigate = useNavigate();
    const { data: session } = authClient.useSession();
    const [activeTab, setActiveTab] = useState<EventTabValue>(
        EventTab.organizing
    );

    const userId = session?.user.id;

    const { data: organizingEvents } = useEvents({
        userId,
        userRelation: 'organized',
    });
    const { data: joinedEvents } = useEvents({
        userId,
        userRelation: 'joined',
    });
    const { data: interestedEvents } = useEvents({
        userId,
        userRelation: 'interested',
    });
    const { data: stats } = useEventStats(userId);

    if (!session?.user) return null;

    const tabEvents: Record<EventTabValue, typeof organizingEvents> = {
        [EventTab.organizing]: organizingEvents ?? [],
        [EventTab.joined]: joinedEvents ?? [],
        [EventTab.interested]: interestedEvents ?? [],
    };

    const counts = {
        [EventTab.organizing]: stats?.organized ?? 0,
        [EventTab.joined]: stats?.joined ?? 0,
        [EventTab.interested]: stats?.interested ?? 0,
    };

    return (
        <div className="max-w-240 mx-auto">
            <div className="mb-6">
                <h1 className="font-heading text-heading font-bold m-0 text-primary-text">
                    My Events
                </h1>
            </div>

            <EventTabFilter
                value={activeTab}
                counts={counts}
                onValueChange={setActiveTab}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                {(tabEvents[activeTab] ?? []).map((event) => (
                    <EventCard key={event.id} event={event} />
                ))}
            </div>

            <EventAddButton
                onClick={() => {
                    void navigate({ to: '/pages/my-events' });
                }}
            />
        </div>
    );
}
