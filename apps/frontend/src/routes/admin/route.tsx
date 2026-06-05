import {
    createFileRoute,
    Navigate,
    Outlet,
    useRouterState,
} from '@tanstack/react-router';
import { authClient } from '@/lib/api';
import { AppShell } from '@/components/layout/app-shell';
import { ADMIN_SIDE_NAV_ITEMS } from '@/components/layout/navigation-item';
import { useUserProfile } from '@/features/users/hooks/use-users';
import { useCurrentUserRole } from '@/features/admin/hooks/current-user';
import { useReports } from '@/features/admin/hooks/reports';

export const Route = createFileRoute('/admin')({
    component: AdminLayout,
});

function pathnameToNavId(pathname: string): string {
    if (pathname.includes('/admin/discover')) return 'admin-discover';
    return 'admin-dashboard';
}

function AdminLayout() {
    const { data: session, isPending: sessionPending } =
        authClient.useSession();
    const { data: role, isPending: rolePending } = useCurrentUserRole();
    const { location } = useRouterState();
    const { data: profile } = useUserProfile(session?.user.id);
    const { data: reports } = useReports();

    if (sessionPending || rolePending) {
        return null;
    }

    if (!session?.user) {
        return <Navigate to="/auth/login" replace />;
    }

    if (role !== 'admin') {
        return <Navigate to="/pages/home-page" replace />;
    }

    const activeNav = pathnameToNavId(location.pathname);
    const navImage = profile?.image ?? session.user.image;
    const pendingReports = (reports ?? []).filter(
        (report) => report.status === 'pending'
    ).length;

    const navItems = ADMIN_SIDE_NAV_ITEMS.map((item) =>
        item.id === 'admin-dashboard' && pendingReports > 0
            ? { ...item, badge: pendingReports > 9 ? '9+' : pendingReports }
            : item
    );

    return (
        <AppShell
            userName={profile?.name ?? session.user.name}
            profilePictureUrl={navImage}
            sideNavSections={[
                {
                    label: 'Admin',
                    accent: 'red',
                    items: navItems,
                },
            ]}
            bottomNavItems={navItems}
            activeNav={activeNav}
        >
            <Outlet />
        </AppShell>
    );
}
