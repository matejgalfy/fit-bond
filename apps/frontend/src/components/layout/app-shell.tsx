import type { ReactNode } from 'react';
import { AppNavbar } from '@/components/layout/app-navbar';
import { SideNav } from '@/components/layout/side-nav';
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';
import type {
    NavigationItem,
    NavigationSection,
} from '@/components/layout/navigation-item';

interface AppShellProps {
    userName?: string;
    profilePictureUrl?: string | null;
    sideNavItems?: NavigationItem[];
    sideNavSections?: NavigationSection[];
    bottomNavItems: NavigationItem[];
    activeNav: string;
    children: ReactNode;
}

export function AppShell({
    userName,
    profilePictureUrl,
    sideNavItems,
    sideNavSections,
    bottomNavItems,
    activeNav,
    children,
}: AppShellProps) {
    return (
        <div className="font-sans bg-background text-primary-text min-h-screen flex flex-col transition-colors duration-300">
            <AppNavbar
                userName={userName}
                profilePictureUrl={profilePictureUrl}
            />
            <div className="flex flex-1">
                <SideNav
                    items={sideNavItems}
                    sections={sideNavSections}
                    activeNav={activeNav}
                />
                <main className="flex-1 min-w-0 px-content-x py-content-y pb-content-bottom">
                    <div className="mx-auto w-full max-w-280">{children}</div>
                </main>
            </div>
            <MobileBottomNav items={bottomNavItems} activeNav={activeNav} />
        </div>
    );
}
