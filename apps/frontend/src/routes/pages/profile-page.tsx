import { createFileRoute } from '@tanstack/react-router';
import { authClient } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ProfileCard } from '@/features/users/components/profile-card';
import { useUserProfile } from '@/features/users/hooks/users';
import { useLogout } from '@/features/auth/hooks/logout';
import { z } from 'zod';
import { zodValidator } from '@tanstack/zod-adapter';

const profileSearchSchema = z.object({
    userId: z.string().optional(),
});

export const Route = createFileRoute('/pages/profile-page')({
    validateSearch: zodValidator(profileSearchSchema),
    component: ProfilePage,
});

function ProfilePage() {
    const routeSearch = Route.useSearch();
    const searchUserId = routeSearch.userId;
    const { logout, isLoggingOut, logoutError } = useLogout();

    const { data: session, isPending: isSessionPending } =
        authClient.useSession();

    const targetUserId = searchUserId ?? session?.user.id;
    const isOwner = Boolean(
        session?.user.id && session.user.id === targetUserId
    );

    const {
        data: user_data,
        isPending: isUserPending,
        isError,
    } = useUserProfile(targetUserId);

    if (isSessionPending) return null;
    if (!session?.user) return null;

    return (
        <div className="max-w-240 mx-auto">
            <div className="mb-6">
                <h1 className="font-heading text-heading font-bold m-0 text-primary-text">
                    {isOwner ? (
                        <>My Profile</>
                    ) : (
                        <>{user_data?.name}'s Profile</>
                    )}
                </h1>
                <p className="text-regular text-secondary-text mt-1">
                    {isOwner
                        ? 'Manage your personal information and sports preferences.'
                        : 'View public profile and sports preferences.'}
                </p>
            </div>

            {isUserPending ? (
                <div className="flex justify-start">
                    <Card className="w-full max-w-2xl border-outline shadow-sm bg-surface rounded-3xl p-6">
                        <CardContent className="p-0 space-y-8">
                            <div className="flex items-start gap-6">
                                <Skeleton className="h-24 w-24 shrink-0 rounded-full" />
                                <div className="space-y-3 py-1">
                                    <Skeleton className="h-8 w-48" />
                                    <Skeleton className="h-5 w-64" />
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <Skeleton className="h-10 w-36 rounded-xl" />
                                <Skeleton className="h-10 w-32 rounded-xl" />
                            </div>
                            <div className="space-y-3">
                                <Skeleton className="h-4 w-32" />
                                <div className="flex flex-wrap gap-2">
                                    <Skeleton className="h-8 w-20 rounded-full" />
                                    <Skeleton className="h-8 w-24 rounded-full" />
                                    <Skeleton className="h-8 w-16 rounded-full" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <Skeleton className="h-4 w-40" />
                                <Skeleton className="h-9 w-64 rounded-xl" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            ) : isError ? (
                <div className="bg-soft-red text-primary-red p-6 rounded-2xl border border-primary-red/20 text-center">
                    <p className="font-semibold">
                        Failed to load profile information.
                    </p>
                    <p className="text-regular opacity-80">
                        Please try again later.
                    </p>
                </div>
            ) : (
                <div className="flex justify-start">
                    <ProfileCard
                        user={user_data}
                        isOwner={isOwner}
                        onLogout={logout}
                        isLoggingOut={isLoggingOut}
                        logoutError={logoutError}
                    />
                </div>
            )}
        </div>
    );
}
