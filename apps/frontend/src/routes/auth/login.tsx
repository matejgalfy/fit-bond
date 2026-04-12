import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { GoogleButton } from '@/components/ui/google-button';

import { AuthNavbar } from '@/components/auth/auth-navbar';
import { AuthCard } from '@/components/auth/auth-card';
import { AuthHeader } from '@/components/auth/auth-header';
import { AuthDivider } from '@/components/auth/auth-divider';
import { PasswordInput } from '@/components/auth/password-input';

import { createFileRoute, Link } from '@tanstack/react-router';
import { TextInput } from '@/components/auth/text-input';
import { Mail } from 'lucide-react';

export const Route = createFileRoute('/auth/login')({
    component: Login,
});

export function Login() {
    const [dark, setDark] = useState(false);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', dark);
    }, [dark]);

    return (
        <div className="min-h-svh bg-background text-foreground transition-colors duration-300">
            {/* Navbar (reusable) */}
            <AuthNavbar
                dark={dark}
                onToggleDark={() => {
                    setDark(!dark);
                }}
            />

            {/* Main */}
            <div className="flex items-center justify-center min-h-[calc(100svh-56px)] p-6">
                <div className="w-full max-w-105">
                    {/* HEADER (reusable) */}
                    <AuthHeader
                        title="Welcome back"
                        subtitle="Sign in to continue to FitBond"
                    />

                    {/* CARD (reusable wrapper) */}
                    <AuthCard>
                        {/* Google (reusable) */}
                        <GoogleButton />

                        {/* Divider (reusable) */}
                        <AuthDivider />

                        {/* Email */}
                        <TextInput
                            type="email"
                            placeholder="Email address"
                            icon={Mail}
                        />

                        {/* Password */}
                        <PasswordInput />

                        {/* Forgot password */}
                        <div className="text-right mb-5">
                            <span className="text-[13px] text-primary font-medium cursor-pointer hover:underline">
                                Forgot password?
                            </span>
                        </div>

                        {/* Submit */}
                        <Button className="w-full h-11 rounded-xl text-[15px] font-semibold">
                            Sign In
                        </Button>

                        {/* Sign up link */}
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
