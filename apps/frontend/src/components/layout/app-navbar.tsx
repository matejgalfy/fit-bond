import { Moon, Sun, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link } from '@tanstack/react-router';
import { useTheme } from 'next-themes';
import { UserAvatar } from '@/components/ui/user-avatar';
import { useIsAdmin } from '@/features/admin/hooks/current-user';
import { useLogout } from '@/features/auth/hooks/logout';

interface AppNavbarProps {
    userName?: string;
    profilePictureUrl?: string | null;
}

export function AppNavbar({ userName, profilePictureUrl }: AppNavbarProps) {
    const { resolvedTheme, setTheme } = useTheme();
    const isAdmin = useIsAdmin();
    const { logout, isLoggingOut, logoutError } = useLogout();
    const dark = resolvedTheme === 'dark';
    const toggleDark = () => {
        setTheme(dark ? 'light' : 'dark');
    };

    return (
        <nav className="sticky top-0 z-50 h-14 bg-surface border-b border-outline flex items-center px-4 gap-3">
            <Link
                to={isAdmin ? '/admin' : '/pages/home-page'}
                className="flex items-center gap-1.5"
                aria-label="FitBond home"
            >
                <div className="w-7 h-7 rounded-lg bg-linear-to-br from-primary-blue to-strong-blue flex items-center justify-center text-regular font-bold text-surface">
                    F
                </div>

                <span className="text-subheading font-bold text-primary-blue font-heading">
                    FitBond
                </span>
            </Link>

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

            {isAdmin ? (
                <Button
                    variant="outline"
                    onClick={() => {
                        void logout();
                    }}
                    disabled={isLoggingOut}
                    title={logoutError || undefined}
                    className="rounded-lg border-primary-red text-primary-red hover:bg-primary-red/10 hover:text-primary-red"
                >
                    <LogOut size={18} className="mr-2" />
                    {isLoggingOut ? 'Logging out...' : 'Log Out'}
                </Button>
            ) : userName ? (
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-lg"
                    aria-label="Open profile menu"
                    asChild
                >
                    <Link to="/pages/profile-page">
                        <UserAvatar
                            name={userName}
                            imageUrl={profilePictureUrl}
                            size={32}
                        />
                    </Link>
                </Button>
            ) : null}
        </nav>
    );
}
