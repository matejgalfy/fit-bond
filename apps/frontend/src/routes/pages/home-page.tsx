import { useState } from 'react';
import { Bell, Home, Compass, CalendarDays, User, Shield } from 'lucide-react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { authClient } from '@/lib/api';
import { EventCard } from '@/features/events/components/event-card';
import { SideNav } from '@/features/events/components/side-nav';
import { AppNavbar } from '@/components/layout/app-navbar';
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';
import type { NavigationItem } from '@/components/layout/navigation-item';
import type { SportEvent } from '@/features/events/components/event-card';

export const Route = createFileRoute('/pages/home-page')({
    component: FitBondShell,
});

const NAV_ITEMS: NavigationItem[] = [
    { icon: Home, label: 'Home', id: 'home' },
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

const MOCK_EVENTS: SportEvent[] = [
    {
        id: 1,
        name: 'Morning Run in the Park',
        sport: 'Running',
        date: 'Mar 25, 2026',
        time: '7:00 AM',
        location: 'Lužánky Park, Brno',
        participants: 8,
        capacity: 12,
        interested: 5,
        organizer: 'Martin N.',
        skill: 'Beginner',
        color: 'var(--sport-running)',
    },
    {
        id: 2,
        name: 'Basketball 3v3 Tournament',
        sport: 'Basketball',
        date: 'Mar 26, 2026',
        time: '5:00 PM',
        location: 'Sportovní hala, Brno',
        participants: 6,
        capacity: 6,
        interested: 12,
        organizer: 'Jana K.',
        skill: 'Advanced',
        color: 'var(--sport-basketball)',
        full: true,
    },
    {
        id: 3,
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
        id: 4,
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
];

function FitBondShell() {
    const navigate = useNavigate();
    const { data: session, isPending } = authClient.useSession();
    const [dark, setDark] = useState(false);
    const [activeNav, setActiveNav] = useState('home');
    if (isPending) {
        return null;
    }

    if (!session?.user) {
        void navigate({ to: '/auth/login' });
        return null;
    }

    const userName = session.user.name;
    const firstName = userName.split(' ')[0];

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
                                Welcome back,{' '}
                                <span className="text-primary">
                                    {firstName}
                                </span>{' '}
                                👋
                            </h1>
                            <p className="text-sm text-muted-foreground mt-1">
                                Discover upcoming events near you and connect
                                with fellow athletes.
                            </p>
                        </div>

                        {/* Event cards */}
                        <h2 className="font-heading text-lg font-semibold mb-4 mt-0 text-foreground">
                            Upcoming events
                        </h2>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {MOCK_EVENTS.map((event) => (
                                <EventCard key={event.id} event={event} />
                            ))}
                        </div>
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
