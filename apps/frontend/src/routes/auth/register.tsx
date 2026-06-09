import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { GoogleButton } from '@/components/ui/google-button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from '@/components/ui/form';

import { AppNavbar } from '@/components/layout/app-navbar';
import { AuthCard } from '@/features/auth/components/auth-card';
import { AuthHeader } from '@/features/auth/components/auth-header';
import { AuthDivider } from '@/features/auth/components/auth-divider';
import { PasswordInput } from '@/features/auth/components/password-input';

import { TextInput } from '@/features/auth/components/text-input';
import { Mail, User } from 'lucide-react';

import { authClient } from '@/lib/api';
import {
    registerSchema,
    type RegisterValues,
} from '@/features/auth/auth-schema';

export const Route = createFileRoute('/auth/register')({
    component: Register,
});

function Register() {
    const navigate = useNavigate();
    const { data: session, isPending } = authClient.useSession();

    const form = useForm<RegisterValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
        },
    });

    useEffect(() => {
        if (!isPending && session?.user) {
            void navigate({ to: '/home-page', replace: true });
        }
    }, [isPending, navigate, session?.user]);

    const onSubmit = (values: RegisterValues) =>
        authClient.signUp
            .email({
                name: values.name,
                email: values.email,
                password: values.password,
            })
            .then(({ error: signUpError }) => {
                if (signUpError) {
                    form.setError('root', {
                        message:
                            signUpError.message ??
                            'Registration failed. Please try again.',
                    });
                    return;
                }

                void navigate({ to: '/home-page' });
            })
            .catch(() => {
                form.setError('root', {
                    message: 'Registration failed. Please try again.',
                });
            });

    if (isPending || session?.user) {
        return null;
    }

    const rootError = form.formState.errors.root?.message;
    const isSubmitting = form.formState.isSubmitting;

    return (
        <div className="min-h-svh bg-background text-primary-text transition-colors duration-50">
            <AppNavbar />

            <div className="flex items-center justify-center min-h-[calc(100svh-56px)] p-6">
                <div className="w-full max-w-105">
                    <AuthHeader
                        title="Create your account"
                        subtitle="Join FitBond and find your sports community"
                    />

                    <AuthCard>
                        <GoogleButton />
                        <AuthDivider />

                        <Form {...form}>
                            <form
                                onSubmit={(e) => {
                                    void form.handleSubmit(onSubmit)(e);
                                }}
                            >
                                <div className="space-y-3.5">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem className="gap-1.5">
                                                <FormControl>
                                                    <TextInput
                                                        type="text"
                                                        placeholder="Full name"
                                                        icon={User}
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem className="gap-1.5">
                                                <FormControl>
                                                    <TextInput
                                                        type="email"
                                                        placeholder="Email address"
                                                        icon={Mail}
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem className="gap-1.5">
                                                <FormControl>
                                                    <PasswordInput {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="confirmPassword"
                                        render={({ field }) => (
                                            <FormItem className="gap-1.5">
                                                <FormControl>
                                                    <PasswordInput
                                                        placeholder="Confirm password"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {rootError && (
                                    <p className="text-regular text-primary-red text-center mt-3.5">
                                        {rootError}
                                    </p>
                                )}

                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full h-11 rounded-xl text-regular font-semibold mt-5"
                                >
                                    {isSubmitting
                                        ? 'Creating account…'
                                        : 'Create Account'}
                                </Button>
                            </form>
                        </Form>

                        <p className="text-center text-small text-secondary-text mt-4">
                            Already have an account?{' '}
                            <Link
                                to="/auth/login"
                                className="text-primary-blue font-medium cursor-pointer hover:underline"
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
