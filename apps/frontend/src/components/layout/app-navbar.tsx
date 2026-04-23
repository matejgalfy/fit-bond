import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link } from '@tanstack/react-router';
import { useTheme } from 'next-themes';

interface AppNavbarProps {
    userName?: string;
}

function UserAvatar({ name }: { name: string }) {
    const initials = name
        .split(' ')
        .map((n) => n[0])
        .join('');

    return (
        <div className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-tiny bg-linear-to-br from-primary-blue to-strong-blue text-surface">
            {initials}
        </div>
    );
}

export function AppNavbar({ userName }: AppNavbarProps) {
    const { resolvedTheme, setTheme } = useTheme();
    const dark = resolvedTheme === 'dark';
    const toggleDark = () => {
        setTheme(dark ? 'light' : 'dark');
    };

    return (
        <nav className="sticky top-0 z-50 h-14 bg-surface border-b border-outline flex items-center px-4 gap-3">
            <div className="flex items-center gap-1.5">
                <div className="w-7 h-7 rounded-lg bg-linear-to-br from-primary-blue to-strong-blue flex items-center justify-center text-regular font-bold text-surface">
                    F
                </div>

                <span className="text-subheading font-bold text-primary-blue font-heading">
                    FitBond
                </span>
            </div>

            <div className="flex-1" />

            <Button
                variant="outline"
                size="icon"
                onClick={toggleDark}
                className={cn(
                    dark ? 'text-primary-orange' : 'text-primary-blue'
                )}
                aria-label="Toggle dark mode"
            >
                {dark ? <Sun size={18} /> : <Moon size={18} />}
            </Button>

            {userName ? (
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-lg"
                    aria-label="Open profile menu"
                    asChild
                >
                    <Link to="/pages/profile-page">
                        <UserAvatar name={userName} />
                    </Link>
                </Button>
            ) : null}
        </nav>
    );
}
