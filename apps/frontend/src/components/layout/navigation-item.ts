import type { LucideIcon } from 'lucide-react';

export interface NavigationItem {
    icon: LucideIcon;
    label: string;
    id: string;
    badge?: number;
    href?: string;
}
