import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Props {
    dark: boolean;
    onToggleDark: () => void;
}

export function AuthNavbar({ dark, onToggleDark }: Props) {
    return (
        <nav className="sticky top-0 z-50 h-14 bg-card border-b border-border flex items-center px-4 gap-3">
            {/* Logo */}
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

            {/* Theme toggle */}
            <Button
                variant="outline"
                size="icon"
                onClick={onToggleDark}
                className={cn(dark ? 'text-orange-400' : 'text-primary')}
                aria-label="Toggle dark mode"
            >
                {dark ? <Sun size={18} /> : <Moon size={18} />}
            </Button>
        </nav>
    );
}
