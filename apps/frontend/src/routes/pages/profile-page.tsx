import { useState, useEffect } from 'react';
import { Bell, Home, Compass, CalendarDays, User, Shield } from 'lucide-react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { authClient } from '@/lib/api';
import { AppNavbar } from '@/components/layout/app-navbar';
import { SideNav } from '@/features/events/components/side-nav';
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';
import { ProfileCard } from '@/features/users/components/profile-card';
import { usePublicProfile } from '@/features/users/hooks/users';
import type { NavigationItem } from '@/components/layout/navigation-item';

export const Route = createFileRoute('/pages/profile-page')({
    validateSearch: (search: Record<string, unknown>): { userId?: string } => {
        return {
            userId: search.userId as string | undefined,
        };
    },
    component: ProfilePage,
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

function ProfilePage() {
    const navigate = useNavigate();
    
    const { userId: searchUserId } = Route.useSearch();
    const { data: session, isPending: isSessionPending } = authClient.useSession();
    
    const [dark, setDark] = useState(false);
    const [activeNav, setActiveNav] = useState('profile');

    const targetUserId = searchUserId || session?.user.id;
    const isOwner = Boolean(session?.user.id && session.user.id === targetUserId);

    const { data: user_data, isPending: isUserPending, isError } = usePublicProfile(targetUserId);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', dark);
    }, [dark]);

    if (isSessionPending) {
        return null;
    }

    if (!session?.user) {
        void navigate({ to: '/auth/login' });
        return null;
    }

    const userName = session.user.name;

    return (
        <div className={`${dark ? 'dark ' : ''}font-sans bg-background text-foreground min-h-screen flex flex-col transition-colors duration-300`}>
            <AppNavbar
                dark={dark}
                onToggleDark={() => setDark(!dark)}
                userName={userName}
            />

            <div className="flex flex-1">
                <SideNav
                    items={NAV_ITEMS}
                    activeNav={activeNav}
                    onChange={setActiveNav}
                />

                <main className="flex-1 overflow-auto p-4 pb-20 md:p-6 md:pb-6">
                    <div className="max-w-240 mx-auto">
                        <div className="mb-6">
                            {/* Dynamic heading based on whether it's the user's own profile */}
                            <h1 className="font-heading text-[26px] font-bold m-0 text-foreground">
                                {isOwner ? (
                                    <>My <span className="text-primary">Profile</span></>
                                ) : (
                                    <><span className="text-primary">{user_data?.name}'s</span> Profile</>
                                )}
                            </h1>
                            <p className="text-sm text-muted-foreground mt-1">
                                {isOwner 
                                    ? "Manage your personal information and sports preferences."
                                    : "View public profile and sports preferences."}
                            </p>
                        </div>

                        {isUserPending ? (
                            <div className="flex justify-center py-12">
                                <p className="text-muted-foreground animate-pulse">Loading profile data...</p>
                            </div>
                        ) : isError || !user_data ? (
                            <div className="bg-destructive/10 text-destructive p-6 rounded-2xl border border-destructive/20 text-center">
                                <p className="font-semibold">Failed to load profile information.</p>
                                <p className="text-sm opacity-80">Please try again later.</p>
                            </div>
                        ) : (
                            <div className="flex justify-start">
                                <ProfileCard user={user_data} isOwner={isOwner} />
                            </div>
                        )}
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