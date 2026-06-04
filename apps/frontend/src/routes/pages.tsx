import {
    createFileRoute,
    Navigate,
    Outlet,
    useRouterState,
} from '@tanstack/react-router';
import { useMemo } from 'react';
import { authClient } from '@/lib/api';
import { AppShell } from '@/components/layout/app-shell';
import {
    ADMIN_NAV_ITEM,
    NAV_ITEMS,
    type NavigationSection,
} from '@/components/layout/navigation-item';
import { useUserProfile } from '@/features/users/hooks/use-users';
import { useIsAdmin } from '@/features/admin/hooks/current-user';
import { useUnreadNotificationsCount } from '@/features/notifications/hooks/notifications';

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
    if (pathname.includes('edit-event')) return 'events';
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

    const { data: unreadData } = useUnreadNotificationsCount();
    const unreadCount = unreadData?.count ?? 0;

    const navItemsWithBadges = useMemo(() => {
        return NAV_ITEMS.map((item) => {
            if (item.id === 'notifications' && unreadCount > 0) {
                return { ...item, badge: unreadCount > 9 ? '9+' : unreadCount };
            }
            return item;
        });
    }, [unreadCount]);

    const bottomNavItems = useMemo(
        () =>
            isAdmin
                ? [...navItemsWithBadges, ADMIN_NAV_ITEM]
                : navItemsWithBadges,
        [isAdmin, navItemsWithBadges]
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
        <AppShell
            userName={profile?.name ?? session.user.name}
            profilePictureUrl={navImage}
            sideNavItems={navItemsWithBadges}
            sideNavSections={sections}
            bottomNavItems={bottomNavItems}
            activeNav={activeNav}
        >
            <Outlet />
        </AppShell>
    );
}
