import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { GoogleButton } from '@/components/ui/google-button';

import { AppNavbar } from '@/components/layout/app-navbar';
import { AuthCard } from '@/features/auth/components/auth-card';
import { AuthHeader } from '@/features/auth/components/auth-header';
import { AuthDivider } from '@/features/auth/components/auth-divider';
import { PasswordInput } from '@/features/auth/components/password-input';

import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { TextInput } from '@/features/auth/components/text-input';
import { Mail } from 'lucide-react';

import { authClient } from '@/lib/api';

export const Route = createFileRoute('/auth/login')({
    component: Login,
});

export function Login() {
    const navigate = useNavigate();
    const { data: session, isPending } = authClient.useSession();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!isPending && session?.user) {
            void navigate({ to: '/pages/home-page', replace: true });
        }
    }, [isPending, navigate, session?.user]);

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

                void navigate({ to: '/pages/home-page' });
            })
            .catch(() => {
                setError('Sign in failed. Please try again.');
                setIsLoading(false);
            });
    };

    if (isPending || session?.user) {
        return null;
    }

    return (
        <div className="min-h-svh bg-background text-primary-text transition-colors duration-300">
            <AppNavbar />

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

                            <div className="mb-5"></div>


                            {error && (
                                <p className="text-regular text-primary-red text-center mb-3">
                                    {error}
                                </p>
                            )}

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-11 rounded-xl text-regular font-semibold"
                            >
                                {isLoading ? 'Signing in…' : 'Sign In'}
                            </Button>
                        </form>

                        <p className="text-center text-small text-secondary-text mt-4">
                            Don't have an account?{' '}
                            <Link
                                to="/auth/register"
                                className="text-primary-blue font-medium cursor-pointer hover:underline"
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
