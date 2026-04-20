import type { Dispatch, SetStateAction } from 'react';
import { Link } from '@tanstack/react-router';
import type { NavigationItem } from './navigation-item';
import { cn } from '@/lib/utils';

interface MobileBottomNavProps {
    items: NavigationItem[];
    activeNav: string;
    onChange: Dispatch<SetStateAction<string>>;
}

export function MobileBottomNav({
    items,
    activeNav,
    onChange,
}: MobileBottomNavProps) {
    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-14 flex items-center justify-around border-t bg-card border-border">
            {items.map((item) => {
                const active = activeNav === item.id;
                const className = cn(
                    'relative flex items-center justify-center flex-1 h-full px-1 transition-colors',
                    active ? 'text-primary' : 'text-muted-foreground'
                );
                const content = (
                    <span
                        className="relative inline-flex items-center justify-center"
                        aria-hidden="true"
                    >
                        <item.icon size={18} />
                        {item.badge !== undefined && (
                            <span className="absolute -top-1.5 -right-1.5 min-w-3 h-3 rounded-full bg-destructive text-primary-foreground text-[9px] font-bold flex items-center justify-center px-0.5">
                                {item.badge}
                            </span>
                        )}
                    </span>
                );

                if (item.href) {
                    return (
                        <Link
                            key={item.id}
                            to={item.href}
                            aria-label={item.label}
                            onClick={() => {
                                onChange(item.id);
                            }}
                            className={className}
                        >
                            {content}
                        </Link>
                    );
                }

                return (
                    <button
                        key={item.id}
                        aria-label={item.label}
                        onClick={() => {
                            onChange(item.id);
                        }}
                        className={className}
                    >
                        {content}
                    </button>
                );
            })}
        </nav>
    );
}
