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
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-16 flex items-center justify-around border-t bg-card border-border">
            {items.map((item) => {
                const active = activeNav === item.id;
                const className = cn(
                    'relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-xs font-medium transition-colors',
                    active ? 'text-primary' : 'text-muted-foreground'
                );
                const content = (
                    <>
                        <span className="relative inline-flex items-center justify-center">
                            <item.icon size={20} />
                            {item.badge !== undefined && (
                                <span className="absolute -top-1.5 -right-2 min-w-4 h-4 rounded-full bg-destructive text-primary-foreground text-[10px] font-bold flex items-center justify-center px-1">
                                    {item.badge}
                                </span>
                            )}
                        </span>
                        <span>{item.label}</span>
                    </>
                );

                if (item.href) {
                    return (
                        <Link
                            key={item.id}
                            to={item.href}
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
