import {
    createFileRoute,
    Navigate,
    Outlet,
    useRouterState,
} from '@tanstack/react-router';
import { useMemo } from 'react';
import { authClient } from '@/lib/api';
import { AppNavbar } from '@/components/layout/app-navbar';
import { SideNav } from '@/components/layout/side-nav';
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';
import {
    ADMIN_NAV_ITEM,
    NAV_ITEMS,
    type NavigationSection,
} from '@/components/layout/navigation-item';
import { useUserProfile } from '@/features/users/hooks/users';
import { useIsAdmin } from '@/features/admin/hooks/current-user';

export const Route = createFileRoute('/pages')({
    component: PagesLayout,
});

interface PageSearchState {
    from?: string;
}

function getPageSearchState(search: unknown): PageSearchState {
    if (typeof search !== 'object' || search === null || !('from' in search)) {
        return {};
    }

    const from = search.from;
    return {
        from: typeof from === 'string' ? from : undefined,
    };
}

function pathnameToNavId(pathname: string, search: PageSearchState): string {
    if (pathname.includes('my-events')) return 'events';
    if (pathname.includes('create-event')) return 'events';
    if (pathname.includes('event-detail-page') && search.from === 'my-events') {
        return 'events';
    }
    if (pathname.includes('notifications')) return 'notifications';
    if (pathname.includes('profile')) return 'profile';
    if (pathname.includes('discover')) return 'discover';
    return 'home';
}

function PagesLayout() {
    const { data: session, isPending } = authClient.useSession();
    const { location } = useRouterState();
    const { data: profile } = useUserProfile(session?.user.id);
    const isAdmin = useIsAdmin();

    const sections = useMemo<NavigationSection[] | undefined>(() => {
        if (!isAdmin) return undefined;
        return [
            {
                label: 'Admin',
                accent: 'red',
                items: [ADMIN_NAV_ITEM],
            },
        ];
    }, [isAdmin]);

    const bottomNavItems = useMemo(
        () => (isAdmin ? [...NAV_ITEMS, ADMIN_NAV_ITEM] : NAV_ITEMS),
        [isAdmin]
    );

    if (isPending) {
        return null;
    }

    if (!session?.user) {
        return <Navigate to="/auth/login" replace />;
    }

    const activeNav = pathnameToNavId(
        location.pathname,
        getPageSearchState(location.search)
    );
    const navImage = profile?.image ?? session.user.image;

    return (
        <div className="font-sans bg-background text-primary-text min-h-screen flex flex-col transition-colors duration-300">
            <AppNavbar
                userName={profile?.name ?? session.user.name}
                profilePictureUrl={navImage}
            />
            <div className="flex flex-1">
                <SideNav
                    items={NAV_ITEMS}
                    sections={sections}
                    activeNav={activeNav}
                />
                <main className="flex-1 overflow-auto p-4 pb-20 md:p-6 md:pb-6">
                    <Outlet />
                </main>
            </div>
            <MobileBottomNav items={bottomNavItems} activeNav={activeNav} />
        </div>
    );
}
