import { Shield } from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';
import { cn } from '@/lib/utils';
import type { NavigationItem } from '@/components/layout/navigation-item';

export type SideNavItem = NavigationItem;

interface SideNavProps {
    items: NavigationItem[];
    activeNav: string;
    onChange: Dispatch<SetStateAction<string>>;
}

export function SideNav({ items, activeNav, onChange }: SideNavProps) {
    return (
        <aside className="hidden md:flex w-55 bg-card border-r border-border transition-colors duration-300 overflow-hidden shrink-0 flex-col pt-2">
            <div className="px-2 flex flex-col gap-0.5">
                {items.map((item) => {
                    const active = activeNav === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => {
                                onChange(item.id);
                            }}
                            className={cn(
                                'flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] border-none cursor-pointer text-sm font-sans w-full text-left transition-[background,color] duration-200',
                                active
                                    ? 'bg-accent text-primary font-semibold'
                                    : 'bg-transparent text-muted-foreground font-normal'
                            )}
                        >
                            <item.icon size={18} />
                            <span>{item.label}</span>
                            {item.badge !== undefined && (
                                <span className="ml-auto bg-destructive text-primary-foreground text-[11px] font-semibold w-5 h-5 rounded-full flex items-center justify-center">
                                    {item.badge}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="px-2 mt-4">
                <div className="text-[11px] font-semibold text-muted-foreground px-3 pb-1.5 uppercase tracking-[0.5px]">
                    Admin
                </div>
                <button
                    onClick={() => {
                        onChange('admin');
                    }}
                    className={cn(
                        'flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] border-none cursor-pointer text-sm font-sans w-full text-left transition-colors duration-200',
                        activeNav === 'admin'
                            ? 'bg-secondary text-destructive font-semibold'
                            : 'bg-transparent text-muted-foreground font-normal'
                    )}
                >
                    <Shield size={18} />
                    <span>Dashboard</span>
                </button>
            </div>
        </aside>
    );
}
