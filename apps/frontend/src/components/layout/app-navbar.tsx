import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link } from '@tanstack/react-router';

interface AppNavbarProps {
    dark: boolean;
    onToggleDark: () => void;
    userName?: string;
}

function UserAvatar({ name }: { name: string }) {
    const initials = name
        .split(' ')
        .map((n) => n[0])
        .join('');

    return (
        <div className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs bg-[linear-gradient(135deg,var(--primary),var(--ring))] text-primary-foreground">
            {initials}
        </div>
    );
}

export function AppNavbar({ dark, onToggleDark, userName }: AppNavbarProps) {
    return (
        <nav className="sticky top-0 z-50 h-14 bg-card border-b border-border flex items-center px-4 gap-3">
            <div className="flex items-center gap-1.5">
                <div className="w-7 h-7 rounded-lg bg-linear-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-sm font-bold">
                    F
                </div>

                <span className="text-xl font-bold text-primary font-heading">
                    FitBond
                </span>
            </div>

            <div className="flex-1" />

            <Button
                variant="outline"
                size="icon"
                onClick={onToggleDark}
                className={cn(dark ? 'text-orange-400' : 'text-primary')}
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
