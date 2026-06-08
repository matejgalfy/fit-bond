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

import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { TextInput } from '@/features/auth/components/text-input';
import { Mail } from 'lucide-react';

import { authClient } from '@/lib/api';
import { loginSchema, type LoginValues } from '@/features/auth/auth-schema';

export const Route = createFileRoute('/auth/login')({
    component: Login,
});

export function Login() {
    const navigate = useNavigate();
    const { data: session, isPending } = authClient.useSession();

    const form = useForm<LoginValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    useEffect(() => {
        if (!isPending && session?.user) {
            void navigate({ to: '/pages/home-page', replace: true });
        }
    }, [isPending, navigate, session?.user]);

    const onSubmit = (values: LoginValues) =>
        authClient.signIn
            .email({ email: values.email, password: values.password })
            .then(({ error: signInError }) => {
                if (signInError) {
                    form.setError('root', {
                        message:
                            signInError.message ??
                            'Sign in failed. Please try again.',
                    });
                    return;
                }

                void navigate({ to: '/pages/home-page' });
            })
            .catch(() => {
                form.setError('root', {
                    message: 'Sign in failed. Please try again.',
                });
            });

    if (isPending || session?.user) {
        return null;
    }

    const rootError = form.formState.errors.root?.message;
    const isSubmitting = form.formState.isSubmitting;

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

                        <Form {...form}>
                            <form
                                onSubmit={(e) => {
                                    void form.handleSubmit(onSubmit)(e);
                                }}
                            >
                                <div className="space-y-3.5">
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
                                    {isSubmitting ? 'Signing in…' : 'Sign In'}
                                </Button>
                            </form>
                        </Form>

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
