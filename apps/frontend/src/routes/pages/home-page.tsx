import { useState } from 'react';
import { Bell, Home, Compass, CalendarDays, User, Shield } from 'lucide-react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { authClient } from '@/lib/api';
import { EventCard } from '@/features/events/components/event-card';
import { SideNav } from '@/components/layout/side-nav';
import { AppNavbar } from '@/components/layout/app-navbar';
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';
import type { NavigationItem } from '@/components/layout/navigation-item';
import type { Event } from '@/features/events/types';
import { useEvents } from '@/features/events/hooks/events';

export const Route = createFileRoute('/pages/home-page')({
    component: FitBondShell,
});

const NAV_ITEMS: NavigationItem[] = [
    { icon: Home, label: 'Home', id: 'home' },
    { icon: Compass, label: 'Discover', id: 'discover' },
    {
        icon: CalendarDays,
        label: 'My Events',
        id: 'events',
        href: '/pages/my-events',
    },
    {
        icon: Bell,
        label: 'Notifications',
        id: 'notifications',
        badge: 3,
        href: '/pages/notifications-page',
    },
    { icon: User, label: 'Profile', id: 'profile' },
];

const ADMIN_NAV_ITEM: NavigationItem = {
    icon: Shield,
    label: 'Admin',
    id: 'admin',
};

const BOTTOM_NAV_ITEMS = [...NAV_ITEMS, ADMIN_NAV_ITEM];

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
    const { data: backendEvents } = useEvents({
        userId: session.user.id,
        excludeUserInteractions: true,
    });

    const userName = session.user.name;
    const firstName = userName.split(' ')[0];
    const allEvents: Event[] = backendEvents ?? [];
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
                            {allEvents.map((event) => (
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
