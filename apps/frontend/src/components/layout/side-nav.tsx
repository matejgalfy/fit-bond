import { Shield } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { cn } from '@/lib/utils';
import type { NavigationItem } from '@/components/layout/navigation-item';
import type { Dispatch, SetStateAction } from 'react';

export type SideNavItem = NavigationItem;

interface SideNavProps {
    items: NavigationItem[];
    activeNav: string;
    onChange?: Dispatch<SetStateAction<string>>;
}

export function SideNav({ items, activeNav, onChange }: SideNavProps) {
    return (
        <aside className="hidden md:flex sticky top-14 self-start h-[calc(100vh-3.5rem)] w-55 bg-surface border-r border-outline transition-colors duration-300 overflow-y-auto overflow-x-hidden shrink-0 flex-col pt-2">
            <div className="px-2 flex flex-col gap-0.5">
                {items.map((item) => {
                    const active = activeNav === item.id;
                    const className = cn(
                        'flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] border-none cursor-pointer text-regular font-sans w-full text-left transition-[background,color] duration-200',
                        active
                            ? 'bg-soft-blue text-primary-blue font-semibold'
                            : 'bg-transparent text-secondary-text font-normal'
                    );
                    const content = (
                        <>
                            <item.icon size={18} />
                            <span>{item.label}</span>
                            {item.badge !== undefined && (
                                <span className="ml-auto bg-primary-red text-surface text-tiny font-semibold w-5 h-5 rounded-full flex items-center justify-center">
                                    {item.badge}
                                </span>
                            )}
                        </>
                    );

                    return item.href ? (
                        <Link
                            key={item.id}
                            to={item.href}
                            className={className}
                            onClick={() => {
                                onChange?.(item.id);
                            }}
                        >
                            {content}
                        </Link>
                    ) : (
                        <button
                            key={item.id}
                            onClick={() => {
                                onChange?.(item.id);
                            }}
                            className={className}
                        >
                            {content}
                        </button>
                    );
                })}
            </div>

            <div className="px-2 mt-4">
                <div className="text-tiny font-semibold text-secondary-text px-3 pb-1.5 uppercase tracking-[0.5px]">
                    Admin
                </div>
                <button
                    onClick={() => {
                        onChange?.('admin');
                    }}
                    className={cn(
                        'flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] border-none cursor-pointer text-regular font-sans w-full text-left transition-colors duration-200',
                        activeNav === 'admin'
                            ? 'bg-soft-red text-primary-red font-semibold'
                            : 'bg-transparent text-secondary-text font-normal'
                    )}
                >
                    <Shield size={18} />
                    <span>Dashboard</span>
                </button>
            </div>
        </aside>
    );
}
