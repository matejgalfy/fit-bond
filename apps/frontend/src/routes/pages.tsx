import {
    createFileRoute,
    Outlet,
    useNavigate,
    useRouterState,
} from '@tanstack/react-router';
import { authClient } from '@/lib/api';
import { AppNavbar } from '@/components/layout/app-navbar';
import { SideNav } from '@/components/layout/side-nav';
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';
import {
    NAV_ITEMS,
    BOTTOM_NAV_ITEMS,
} from '@/components/layout/navigation-item';

export const Route = createFileRoute('/pages')({
    component: PagesLayout,
});

function pathnameToNavId(pathname: string): string {
    if (pathname.includes('my-events')) return 'events';
    if (pathname.includes('notifications')) return 'notifications';
    if (pathname.includes('profile')) return 'profile';
    return 'home';
}

function PagesLayout() {
    const navigate = useNavigate();
    const { data: session, isPending } = authClient.useSession();
    const { location } = useRouterState();

    if (isPending) return null;

    if (!session?.user) {
        void navigate({ to: '/auth/login' });
        return null;
    }

    const activeNav = pathnameToNavId(location.pathname);

    return (
        <div className="font-sans bg-background text-foreground min-h-screen flex flex-col transition-colors duration-300">
            <AppNavbar userName={session.user.name} />
            <div className="flex flex-1">
                <SideNav items={NAV_ITEMS} activeNav={activeNav} />
                <main className="flex-1 overflow-auto p-4 pb-20 md:p-6 md:pb-6">
                    <Outlet />
                </main>
            </div>
            <MobileBottomNav items={BOTTOM_NAV_ITEMS} activeNav={activeNav} />
        </div>
    );
}
