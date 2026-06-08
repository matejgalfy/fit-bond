import { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { authClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { EventCard } from '@/features/events/components/event-card';
import { EventAddButton } from '@/features/events/components/event-add-button';
import { EventTabFilter } from '@/features/events/components/event-tab-filter';
import { EventTab, type EventTabValue } from '../../features/events/event-tabs';
import {
    useInfiniteEvents,
    useEventStats,
} from '@/features/events/hooks/events';

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

    const organizing = useInfiniteEvents({
        userId,
        userRelation: 'organized',
        limit: 20,
    });
    const joined = useInfiniteEvents({
        userId,
        userRelation: 'joined',
        limit: 20,
    });
    const interested = useInfiniteEvents({
        userId,
        userRelation: 'interested',
        limit: 20,
    });
    const { data: stats } = useEventStats(userId);

    if (!session?.user) return null;

    const tabQueries = {
        [EventTab.organizing]: organizing,
        [EventTab.joined]: joined,
        [EventTab.interested]: interested,
    };

    const activeQuery = tabQueries[activeTab];
    const activeEvents = activeQuery.data?.pages.flat() ?? [];

    const counts = {
        [EventTab.organizing]: stats?.organized ?? 0,
        [EventTab.joined]: stats?.joined ?? 0,
        [EventTab.interested]: stats?.interested ?? 0,
    };

    return (
        <div className="max-w-240">
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
                {activeEvents.map((event) => (
                    <EventCard
                        key={event.id}
                        event={event}
                        detailSource="my-events"
                    />
                ))}
            </div>

            {activeQuery.hasNextPage && (
                <div className="mt-6 flex justify-center">
                    <Button
                        variant="secondary"
                        onClick={() => void activeQuery.fetchNextPage()}
                        disabled={activeQuery.isFetchingNextPage}
                    >
                        {activeQuery.isFetchingNextPage
                            ? 'Loading…'
                            : 'Load more'}
                    </Button>
                </div>
            )}

            <EventAddButton
                onClick={() => {
                    void navigate({ to: '/pages/create-event' });
                }}
            />
        </div>
    );
}
