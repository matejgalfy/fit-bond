import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { GoogleButton } from '@/components/ui/google-button';

import { AppNavbar } from '@/components/layout/app-navbar';
import { AuthCard } from '@/features/auth/components/auth-card';
import { AuthHeader } from '@/features/auth/components/auth-header';
import { AuthDivider } from '@/features/auth/components/auth-divider';
import { PasswordInput } from '@/features/auth/components/password-input';

import { TextInput } from '@/features/auth/components/text-input';
import { Mail, User } from 'lucide-react';

import { authClient } from '@/lib/api';

export const Route = createFileRoute('/auth/register')({
    component: Register,
});

function Register() {
    const navigate = useNavigate();
    const { data: session, isPending: isSessionLoading } =
        authClient.useSession();

    const [dark, setDark] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = () => {
        setError('');

        if (!name || !email || !password || !confirmPassword) {
            setError('Please fill in all fields.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }

        setIsLoading(true);

        authClient.signUp
            .email({ name, email, password })
            .then(({ error: signUpError }) => {
                if (signUpError) {
                    setError(
                        signUpError.message ??
                            'Registration failed. Please try again.'
                    );
                    setIsLoading(false);
                    return;
                }

                void navigate({ to: '/pages/home-page' });
            })
            .catch(() => {
                setError('Registration failed. Please try again.');
                setIsLoading(false);
            });
    };

    if (isSessionLoading) {
        return null;
    }

    if (session?.user) {
        void navigate({ to: '/pages/home-page' });
        return null;
    }

    return (
        <div
            className={`${dark ? 'dark ' : ''}min-h-svh bg-background text-foreground transition-colors duration-300`}
        >
            <AppNavbar
                dark={dark}
                onToggleDark={() => {
                    setDark(!dark);
                }}
            />

            <div className="flex items-center justify-center min-h-[calc(100svh-56px)] p-6">
                <div className="w-full max-w-105">
                    <AuthHeader
                        title="Create your account"
                        subtitle="Join FitBond and find your sports community"
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
                                type="text"
                                placeholder="Full name"
                                icon={User}
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                }}
                            />

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

                            <PasswordInput
                                placeholder="Confirm password"
                                value={confirmPassword}
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value);
                                }}
                            />

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
                                {isLoading
                                    ? 'Creating account…'
                                    : 'Create Account'}
                            </Button>
                        </form>

                        <p className="text-center text-[13px] text-muted-foreground mt-4">
                            Already have an account?{' '}
                            <Link
                                to="/auth/login"
                                className="text-primary font-medium cursor-pointer hover:underline"
                            >
                                Sign in
                            </Link>
                        </p>
                    </AuthCard>
                </div>
            </div>
        </div>
    );
}
