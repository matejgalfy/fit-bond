import { createFileRoute } from '@tanstack/react-router';

import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { GoogleButton } from '@/components/ui/google-button';

import { AuthNavbar } from '@/components/auth/auth-navbar';
import { AuthCard } from '@/components/auth/auth-card';
import { AuthHeader } from '@/components/auth/auth-header';
import { AuthDivider } from '@/components/auth/auth-divider';
import { PasswordInput } from '@/components/auth/password-input';

import { Link } from '@tanstack/react-router';
import { TextInput } from '@/components/auth/text-input';
import { Mail, User } from 'lucide-react';

export const Route = createFileRoute('/auth/register')({
    component: Register,
});

function Register() {
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
                    {/* <AuthHeader title="Create an account" /> */}
                    <AuthHeader
                        title="Create your account"
                        subtitle="Join FitBond and find your sports community"
                    />

                    {/* CARD (reusable wrapper) */}
                    <AuthCard>
                        {/* Google (reusable) */}
                        <GoogleButton />

                        {/* Divider (reusable) */}
                        <AuthDivider />

                        {/* Full name */}
                        <TextInput
                            type="full_name"
                            placeholder="Full name"
                            icon={User}
                        />

                        {/* Email */}
                        <TextInput
                            type="email"
                            placeholder="Email address"
                            icon={Mail}
                        />

                        {/* Password */}
                        <PasswordInput />

                        {/* Confirm password */}
                        <PasswordInput placeholder="Confirm password" />

                        {/* Submit */}
                        <Button className="w-full h-11 rounded-xl text-[15px] font-semibold">
                            Create Account
                        </Button>

                        {/* Login link */}
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
