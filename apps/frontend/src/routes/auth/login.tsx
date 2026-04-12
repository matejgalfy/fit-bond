import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { GoogleButton } from '@/components/ui/google-button';

import { AuthNavbar } from '@/components/auth/auth-navbar';
import { AuthCard } from '@/components/auth/auth-card';
import { AuthHeader } from '@/components/auth/auth-header';
import { AuthDivider } from '@/components/auth/auth-divider';
import { PasswordInput } from '@/components/auth/password-input';

import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { TextInput } from '@/components/auth/text-input';
import { Mail } from 'lucide-react';

import { authClient } from '@/lib/api';

export const Route = createFileRoute('/auth/login')({
    component: Login,
});

export function Login() {
    const navigate = useNavigate();
    const { data: session, isPending: isSessionLoading } =
        authClient.useSession();

    const [dark, setDark] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', dark);
    }, [dark]);

    useEffect(() => {
        if (session?.user) {
            void navigate({ to: '/main' });
        }
    }, [session, navigate]);

    const handleSubmit = () => {
        setError('');

        if (!email || !password) {
            setError('Please fill in all fields.');
            return;
        }

        setIsLoading(true);

        authClient.signIn
            .email({ email, password })
            .then(({ error: signInError }) => {
                if (signInError) {
                    setError(
                        signInError.message ??
                            'Sign in failed. Please try again.'
                    );
                    setIsLoading(false);
                    return;
                }

                void navigate({ to: '/main' });
            })
            .catch(() => {
                setError('Sign in failed. Please try again.');
                setIsLoading(false);
            });
    };

    if (isSessionLoading) {
        return null;
    }

    return (
        <div className="min-h-svh bg-background text-foreground transition-colors duration-300">
            <AuthNavbar
                dark={dark}
                onToggleDark={() => {
                    setDark(!dark);
                }}
            />

            <div className="flex items-center justify-center min-h-[calc(100svh-56px)] p-6">
                <div className="w-full max-w-105">
                    <AuthHeader
                        title="Welcome back"
                        subtitle="Sign in to continue to FitBond"
                    />

                    <AuthCard>
                        <GoogleButton />
                        <AuthDivider />

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSubmit();
                            }}
                        >
                            <TextInput
                                type="email"
                                placeholder="Email address"
                                icon={Mail}
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                }}
                            />

                            <PasswordInput
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                }}
                            />

                            <div className="text-right mb-5">
                                <span className="text-[13px] text-primary font-medium cursor-pointer hover:underline">
                                    Forgot password?
                                </span>
                            </div>

                            {error && (
                                <p className="text-sm text-destructive text-center mb-3">
                                    {error}
                                </p>
                            )}

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-11 rounded-xl text-[15px] font-semibold"
                            >
                                {isLoading ? 'Signing in…' : 'Sign In'}
                            </Button>
                        </form>

                        <p className="text-center text-[13px] text-muted-foreground mt-4">
                            Don&apos;t have an account?{' '}
                            <Link
                                to="/auth/register"
                                className="text-primary font-medium cursor-pointer hover:underline"
                            >
                                Create one
                            </Link>
                        </p>
                    </AuthCard>
                </div>
            </div>
        </div>
    );
}
