import { createFileRoute } from '@tanstack/react-router';
import { authClient } from '@/lib/api';
import {
    ProfileCard,
    ProfileCardSkeleton,
} from '@/features/users/components/profile-card';
import { AdminProfileActions } from '@/features/admin/components/admin-profile-actions';
import { useUserProfile } from '@/features/users/hooks/use-users';
import * as z from 'zod';
import { zodValidator } from '@tanstack/zod-adapter';

const adminProfileSearchSchema = z.object({
    userId: z.string().optional(),
});

type AdminProfileSearch = z.infer<typeof adminProfileSearchSchema>;

export const Route = createFileRoute('/admin/profile-page')({
    validateSearch: zodValidator(adminProfileSearchSchema),
    component: AdminProfilePage,
});

function AdminProfilePage() {
    const { userId }: AdminProfileSearch = Route.useSearch();
    const { data: session, isPending: isSessionPending } =
        authClient.useSession();

    const targetUserId = userId ?? session?.user.id;
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
        <div className="max-w-2xl">
            <div className="mb-6">
                <h1 className="font-heading text-heading font-bold m-0 text-primary-text">
                    {isOwner ? (
                        <>My Profile</>
                    ) : (
                        <>{user_data?.name}'s Profile</>
                    )}
                </h1>
                <p className="text-regular text-secondary-text mt-1">
                    View public profile and sports preferences.
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
                    <ProfileCard user={user_data}>
                        {!isOwner && <AdminProfileActions user={user_data} />}
                    </ProfileCard>
                </div>
            )}
        </div>
    );
}
