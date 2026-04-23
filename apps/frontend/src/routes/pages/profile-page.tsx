import { createFileRoute } from '@tanstack/react-router';
import { authClient } from '@/lib/api';
import { ProfileCard } from '@/features/users/components/profile-card';
import { useUserProfile } from '@/features/users/hooks/users';

export const Route = createFileRoute('/pages/profile-page')({
    validateSearch: (search: Record<string, unknown>): { userId?: string } => {
        return {
            userId: search.userId as string | undefined,
        };
    },
    component: ProfilePage,
});

function ProfilePage() {
    const routeSearch = Route.useSearch() as unknown as { userId?: string };
    const searchUserId = routeSearch.userId;

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
                        <>
                            My{' '}
                            <span className="text-primary-blue">Profile</span>
                        </>
                    ) : (
                        <>
                            <span className="text-primary-blue">
                                {user_data?.name}'s
                            </span>{' '}
                            Profile
                        </>
                    )}
                </h1>
                <p className="text-regular text-secondary-text mt-1">
                    {isOwner
                        ? 'Manage your personal information and sports preferences.'
                        : 'View public profile and sports preferences.'}
                </p>
            </div>

            {isUserPending ? (
                <div className="flex justify-center py-12">
                    <p className="text-secondary-text animate-pulse">
                        Loading profile data...
                    </p>
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
                    <ProfileCard user={user_data} isOwner={isOwner} />
                </div>
            )}
        </div>
    );
}
