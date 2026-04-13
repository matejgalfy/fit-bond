import { Shield, type LucideIcon } from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';

export interface SideNavItem {
    icon: LucideIcon;
    label: string;
    id: string;
    badge?: number;
}

interface SideNavProps {
    items: SideNavItem[];
    activeNav: string;
    onChange: Dispatch<SetStateAction<string>>;
}

export function SideNav({ items, activeNav, onChange }: SideNavProps) {
    return (
        <aside
            style={{
                width: 220,
                background: 'var(--card)',
                borderRight: '1px solid var(--border)',
                transition: 'background 0.3s',
                overflow: 'hidden',
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                paddingTop: 8,
            }}
        >
            <div
                style={{
                    padding: '0 8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                }}
            >
                {items.map((item) => {
                    const active = activeNav === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => {
                                onChange(item.id);
                            }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                padding: '10px 12px',
                                borderRadius: 10,
                                background: active
                                    ? 'var(--accent)'
                                    : 'transparent',
                                color: active
                                    ? 'var(--primary)'
                                    : 'var(--muted-foreground)',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: 14,
                                fontWeight: active ? 600 : 400,
                                fontFamily: 'var(--font-sans)',
                                width: '100%',
                                textAlign: 'left',
                                transition: 'background 0.2s, color 0.2s',
                            }}
                        >
                            <item.icon size={18} />
                            <span>{item.label}</span>
                            {item.badge !== undefined && (
                                <span
                                    style={{
                                        marginLeft: 'auto',
                                        background: 'var(--destructive)',
                                        color: 'var(--primary-foreground)',
                                        fontSize: 11,
                                        fontWeight: 600,
                                        width: 20,
                                        height: 20,
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    {item.badge}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            <div style={{ padding: '0 8px', marginTop: 16 }}>
                <div
                    style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: 'var(--muted-foreground)',
                        padding: '0 12px 6px',
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                    }}
                >
                    Admin
                </div>
                <button
                    onClick={() => {
                        onChange('admin');
                    }}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '10px 12px',
                        borderRadius: 10,
                        background:
                            activeNav === 'admin'
                                ? 'var(--secondary)'
                                : 'transparent',
                        color:
                            activeNav === 'admin'
                                ? 'var(--destructive)'
                                : 'var(--muted-foreground)',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: 14,
                        fontWeight: activeNav === 'admin' ? 600 : 400,
                        fontFamily: 'var(--font-sans)',
                        width: '100%',
                        textAlign: 'left',
                        transition: 'background 0.2s',
                    }}
                >
                    <Shield size={18} />
                    <span>Dashboard</span>
                </button>
            </div>
        </aside>
    );
}
