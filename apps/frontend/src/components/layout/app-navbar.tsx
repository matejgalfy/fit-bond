import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AppNavbarProps {
    dark: boolean;
    onToggleDark: () => void;
    userName?: string;
    onAvatarClick?: () => void;
}

function UserAvatar({ name }: { name: string }) {
    const initials = name
        .split(' ')
        .map((n) => n[0])
        .join('');

    return (
        <div
            className="w-8 h-8 rounded-full flex items-center justify-center font-semibold"
            style={{
                background:
                    'linear-gradient(135deg, var(--primary), var(--ring))',
                color: 'var(--primary-foreground)',
                fontSize: 12,
            }}
        >
            {initials}
        </div>
    );
}

export function AppNavbar({
    dark,
    onToggleDark,
    userName,
    onAvatarClick,
}: AppNavbarProps) {
    return (
        <nav className="sticky top-0 z-50 h-14 bg-card border-b border-border flex items-center px-4 gap-3">
            <div className="flex items-center gap-1.5">
                <div className="w-7 h-7 rounded-lg bg-linear-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-sm font-bold">
                    F
                </div>

                <span
                    className="text-xl font-bold text-primary"
                    style={{ fontFamily: 'var(--font-jakarta)' }}
                >
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
                    onClick={onAvatarClick}
                    className="h-9 w-9 rounded-lg"
                    aria-label="Open profile menu"
                >
                    <UserAvatar name={userName} />
                </Button>
            ) : null}
        </nav>
    );
}
