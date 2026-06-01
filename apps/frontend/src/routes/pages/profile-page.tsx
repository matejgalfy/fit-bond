import { createFileRoute } from '@tanstack/react-router';
import { authClient } from '@/lib/api';
import {
    ProfileCard,
    ProfileCardSkeleton,
} from '@/features/users/components/profile-card';
import { OwnerProfileActions } from '@/features/users/components/owner-profile-actions';
import { AdminProfileActions } from '@/features/admin/components/admin-profile-actions';
import {
    useUserProfile,
    useUpdateProfile,
} from '@/features/users/hooks/use-users';
import { useIsAdmin } from '@/features/admin/hooks/current-user';
import { useLogout } from '@/features/auth/hooks/logout';
import { z } from 'zod';
import { zodValidator } from '@tanstack/zod-adapter';

const profileSearchSchema = z.object({
    userId: z.string().optional(),
});

type ProfileSearch = z.infer<typeof profileSearchSchema>;

export const Route = createFileRoute('/pages/profile-page')({
    validateSearch: zodValidator(profileSearchSchema),
    component: ProfilePage,
});

function ProfilePage() {
    const routeSearch: ProfileSearch = Route.useSearch();
    const searchUserId = routeSearch.userId;
    const { logout, isLoggingOut, logoutError } = useLogout();
    const isAdmin = useIsAdmin();

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

    const { mutate: updateProfile } = useUpdateProfile(
        isOwner ? targetUserId : undefined
    );

    if (isSessionPending) return null;
    if (!session?.user) return null;

    const handleAvatarUpload = (url: string) => {
        updateProfile({ base: { profilePictureUrl: url } });
    };

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
                    <ProfileCardSkeleton />
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
                        onAvatarUpload={
                            isOwner ? handleAvatarUpload : undefined
                        }
                    >
                        {isOwner && (
                            <OwnerProfileActions
                                user={user_data}
                                onLogout={logout}
                                isLoggingOut={isLoggingOut}
                                logoutError={logoutError}
                            />
                        )}

                        {isAdmin && !isOwner && (
                            <AdminProfileActions user={user_data} />
                        )}
                    </ProfileCard>
                </div>
            )}
        </div>
    );
}
