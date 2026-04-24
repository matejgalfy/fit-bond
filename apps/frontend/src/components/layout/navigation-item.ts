import { Bell, CalendarDays, Compass, Home, Shield, User } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavigationItem {
    icon: LucideIcon;
    label: string;
    id: string;
    badge?: number;
    href?: string;
}

export const NAV_ITEMS: NavigationItem[] = [
    { icon: Home, label: 'Home', id: 'home', href: '/pages/home-page' },
    {
        icon: Compass,
        label: 'Discover',
        id: 'discover',
        href: '/pages/discover-page',
    },
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
        href: '/pages/notifications-page',
    },
    {
        icon: User,
        label: 'Profile',
        id: 'profile',
        href: '/pages/profile-page',
    },
];

export const ADMIN_NAV_ITEM: NavigationItem = {
    icon: Shield,
    label: 'Admin',
    id: 'admin',
};

export const BOTTOM_NAV_ITEMS: NavigationItem[] = [
    ...NAV_ITEMS,
    ADMIN_NAV_ITEM,
];
