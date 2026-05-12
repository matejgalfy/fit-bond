import {
    createFileRoute,
    Navigate,
    Outlet,
    useRouterState,
} from '@tanstack/react-router';
import { authClient } from '@/lib/api';
import { AppNavbar } from '@/components/layout/app-navbar';
import { SideNav } from '@/components/layout/side-nav';
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';
import { ADMIN_SIDE_NAV_ITEMS } from '@/components/layout/navigation-item';
import { useUserProfile } from '@/features/users/hooks/users';
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
            ? { ...item, badge: pendingReports }
            : item
    );

    return (
        <div className="font-sans bg-background text-primary-text min-h-screen flex flex-col transition-colors duration-300">
            <AppNavbar
                userName={profile?.name ?? session.user.name}
                profilePictureUrl={navImage}
            />
            <div className="flex flex-1">
                <SideNav
                    sections={[
                        {
                            label: 'Admin',
                            accent: 'red',
                            items: navItems,
                        },
                    ]}
                    activeNav={activeNav}
                />
                <main className="flex-1 overflow-auto p-4 pb-20 md:p-6 md:pb-6">
                    <Outlet />
                </main>
            </div>
            <MobileBottomNav items={navItems} activeNav={activeNav} />
        </div>
    );
}
