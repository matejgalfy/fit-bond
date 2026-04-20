import { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { authClient } from '@/lib/api';
import { EventCard } from '@/features/events/components/event-card';
import { SideNav } from '@/components/layout/side-nav';
import { AppNavbar } from '@/components/layout/app-navbar';
import { EventAddButton } from '@/features/events/components/event-add-button';
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';
import {
    NAV_ITEMS,
    BOTTOM_NAV_ITEMS,
} from '@/components/layout/navigation-item';
import { EventTabFilter } from '@/features/events/components/event-tab-filter';
import { EventTab, type EventTabValue } from '../../features/events/event-tabs';
import { useEvents, useEventStats } from '@/features/events/hooks/events';

export const Route = createFileRoute('/pages/my-events')({
    component: RouteComponent,
});

function RouteComponent() {
    const navigate = useNavigate();
    const { data: session, isPending } = authClient.useSession();
    const [dark, setDark] = useState(false);
    const [activeNav, setActiveNav] = useState('events');
    const [activeTab, setActiveTab] = useState<EventTabValue>(
        EventTab.organizing
    );

    const userId = session?.user.id;

    // Fetch events for each relation type - must be called before any conditional returns
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

    // Fetch event stats for counts
    const { data: stats } = useEventStats(userId);

    if (isPending) {
        return null;
    }

    if (!session?.user) {
        void navigate({ to: '/auth/login' });
        return null;
    }

    const userName = session.user.name;

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
        <div
            className={`${dark ? 'dark ' : ''}font-sans bg-background text-foreground min-h-screen flex flex-col transition-colors duration-300`}
        >
            {/* NAVBAR */}
            <AppNavbar
                dark={dark}
                onToggleDark={() => {
                    setDark(!dark);
                }}
                userName={userName}
            />

            <div className="flex flex-1">
                {/* SIDEBAR - desktop */}
                <SideNav
                    items={NAV_ITEMS}
                    activeNav={activeNav}
                    onChange={setActiveNav}
                />

                {/* MAIN CONTENT */}
                <main className="flex-1 overflow-auto p-4 pb-20 md:p-6 md:pb-6">
                    <div className="max-w-240 mx-auto">
                        {/* Welcome message */}
                        <div className="mb-6">
                            <h1 className="font-heading text-[26px] font-bold m-0 text-foreground">
                                My Events
                            </h1>
                        </div>

                        {/* Event cards */}
                        {/* Filter events */}
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

                        {/* Create Event Button */}
                        <EventAddButton
                            onClick={() => {
                                void navigate({ to: '/pages/my-events' });
                            }}
                        />
                    </div>
                </main>
            </div>

            <MobileBottomNav
                items={BOTTOM_NAV_ITEMS}
                activeNav={activeNav}
                onChange={setActiveNav}
            />
        </div>
    );
}
