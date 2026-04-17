import { useState } from 'react';
import { Bell, Home, Compass, CalendarDays, User, Shield } from 'lucide-react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { authClient } from '@/lib/api';
import { EventCard } from '@/features/events/components/event-card';
import { SideNav } from '@/components/layout/side-nav';
import { AppNavbar } from '@/components/layout/app-navbar';
import { EventAddButton } from '@/features/events/components/event-add-button';
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';
import type { NavigationItem } from '@/components/layout/navigation-item';
import type { SportEvent } from '@/features/events/components/event-card';
import { EventTabFilter } from '@/features/events/components/event-tab-filter';

export const Route = createFileRoute('/pages/my-events')({
    component: RouteComponent,
});

const NAV_ITEMS: NavigationItem[] = [
    { icon: Home, label: 'Home', id: 'home', href: '/pages/home-page' },
    { icon: Compass, label: 'Discover', id: 'discover' },
    { icon: CalendarDays, label: 'My Events', id: 'events' },
    { icon: Bell, label: 'Notifications', id: 'notifications', badge: 3 },
    { icon: User, label: 'Profile', id: 'profile' },
];

const ADMIN_NAV_ITEM: NavigationItem = {
    icon: Shield,
    label: 'Admin',
    id: 'admin',
};

const BOTTOM_NAV_ITEMS = [...NAV_ITEMS, ADMIN_NAV_ITEM];

const MOCK_EVENTS: Record<string, SportEvent[]> = {
    organizing: [
        {
            id: 1,
            name: 'Yoga in the Garden',
            sport: 'Yoga',
            date: 'Mar 27, 2026',
            time: '9:00 AM',
            location: 'Botanical Garden, Brno',
            participants: 4,
            capacity: 15,
            interested: 8,
            organizer: 'Eva M.',
            skill: 'Beginner',
            color: 'var(--sport-yoga)',
        },
        {
            id: 2,
            name: 'Friday Football Match',
            sport: 'Football',
            date: 'Mar 28, 2026',
            time: '6:00 PM',
            location: 'Brno-Bystrc, Hřiště',
            participants: 14,
            capacity: 22,
            interested: 3,
            organizer: 'Tomáš R.',
            skill: 'Intermediate',
            color: 'var(--sport-football)',
        },
    ],
    joined: [
        {
            id: 3,
            name: 'Morning Run',
            sport: 'Running',
            date: 'Apr 1, 2026',
            time: '7:00 AM',
            location: 'Lužánky Park, Brno',
            participants: 10,
            capacity: 20,
            interested: 5,
            organizer: 'Jana K.',
            skill: 'Beginner',
            color: 'var(--sport-running)',
        },
        {
            id: 4,
            name: 'Tennis Doubles',
            sport: 'Tennis',
            date: 'Apr 3, 2026',
            time: '4:00 PM',
            location: 'TK Brno, Kurty',
            participants: 4,
            capacity: 4,
            interested: 2,
            organizer: 'Martin S.',
            skill: 'Advanced',
            color: 'var(--sport-basketball)',
        },
    ],
    interested: [
        {
            id: 5,
            name: 'Volleyball on the Beach',
            sport: 'Volleyball',
            date: 'Apr 10, 2026',
            time: '2:00 PM',
            location: 'Přehrada, Brno',
            participants: 8,
            capacity: 12,
            interested: 15,
            organizer: 'Lucie P.',
            skill: 'Intermediate',
            color: 'var(--sport-yoga)',
        },
    ],
};

function RouteComponent() {
    const navigate = useNavigate();
    const { data: session, isPending } = authClient.useSession();
    const [dark, setDark] = useState(false);
    const [activeNav, setActiveNav] = useState('home');
    const [activeTab, setActiveTab] = useState('organizing');
    if (isPending) {
        return null;
    }

    if (!session?.user) {
        void navigate({ to: '/auth/login' });
        return null;
    }

    const userName = session.user.name;

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
                            counts={Object.fromEntries(
                                Object.entries(MOCK_EVENTS).map(([k, v]) => [
                                    k,
                                    v.length,
                                ])
                            )}
                            onValueChange={setActiveTab}
                        />

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                            {(MOCK_EVENTS[activeTab] ?? []).map((event) => (
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
