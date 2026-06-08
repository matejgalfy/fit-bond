import { useState } from 'react';
import type { UserProfile } from '../../../../../backend/src/modules/users/users.types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Pencil,
    Ban,
    ShieldCheck,
    Shield,
    ShieldPlus,
    ShieldMinus,
} from 'lucide-react';

import {
    useAdminUser,
    useBanUser,
    useUnbanUser,
    useUpdateAdminUser,
} from '../hooks/use-admin-users';
import { AdminProfileEditDialog } from './admin-profile-edit-dialog';
import { BanUserDialog } from './ban-user-dialog';

interface AdminProfileActionsProps {
    user: UserProfile;
}

export function AdminProfileActions({ user }: AdminProfileActionsProps) {
    const { data: adminUserData } = useAdminUser(user.id);
    const banMutation = useBanUser();
    const unbanMutation = useUnbanUser();
    const updateMutation = useUpdateAdminUser();

    const [editOpen, setEditOpen] = useState(false);
    const [banDialogOpen, setBanDialogOpen] = useState(false);

    const isBanned = Boolean(adminUserData?.banned);
    const isAdmin = adminUserData?.role === 'admin';
    const banReason =
        adminUserData?.banReason ?? adminUserData?.bannedReason ?? null;

    const actionError =
        banMutation.error ?? unbanMutation.error ?? updateMutation.error;

    const handleUnban = () => {
        unbanMutation.mutate({ id: user.id });
    };

    const handleToggleRole = () => {
        updateMutation.mutate({
            id: user.id,
            body: { role: isAdmin ? 'user' : 'admin' },
        });
    };

    return (
        <>
            {/* Admin header */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary-red" />
                    <span className="text-small font-semibold text-primary-red uppercase tracking-wider">
                        Admin Actions
                    </span>
                </div>

                {/* Ban status indicator */}
                {isBanned && (
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-soft-red border border-primary-red/20">
                        <Ban className="w-5 h-5 text-primary-red shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <p className="text-regular font-semibold text-primary-red">
                                This user is banned
                            </p>
                            {banReason && (
                                <p className="text-small text-secondary-text">
                                    Reason: {banReason}
                                </p>
                            )}
                        </div>
                        <Badge
                            variant="destructive"
                            className="rounded-md ml-auto shrink-0"
                        >
                            Banned
                        </Badge>
                    </div>
                )}

                {/* Action buttons */}
                <div className="flex flex-wrap gap-3">
                    <Button
                        variant="outline"
                        className="rounded-xl border-primary-blue text-primary-blue hover:bg-primary-blue/10 hover:text-primary-blue px-6 font-semibold"
                        onClick={() => {
                            setEditOpen(true);
                        }}
                    >
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit Profile
                    </Button>

                    <Button
                        variant="outline"
                        className="rounded-xl border-primary-orange text-primary-orange hover:bg-primary-orange/10 hover:text-primary-orange px-6 font-semibold"
                        onClick={handleToggleRole}
                        disabled={updateMutation.isPending}
                    >
                        {isAdmin ? (
                            <ShieldMinus className="w-4 h-4 mr-2" />
                        ) : (
                            <ShieldPlus className="w-4 h-4 mr-2" />
                        )}
                        {updateMutation.isPending
                            ? 'Updating...'
                            : isAdmin
                              ? 'Demote to User'
                              : 'Promote to Admin'}
                    </Button>

                    {!isBanned ? (
                        <Button
                            variant="outline"
                            className="rounded-xl border-primary-red text-primary-red hover:bg-primary-red/10 hover:text-primary-red px-6 font-semibold"
                            onClick={() => {
                                setBanDialogOpen(true);
                            }}
                        >
                            <Ban className="w-4 h-4 mr-2" />
                            Ban User
                        </Button>
                    ) : (
                        <Button
                            variant="outline"
                            className="rounded-xl border-primary-green text-primary-green hover:bg-primary-green/10 hover:text-primary-green px-6 font-semibold"
                            onClick={handleUnban}
                            disabled={unbanMutation.isPending}
                        >
                            <ShieldCheck className="w-4 h-4 mr-2" />
                            {unbanMutation.isPending
                                ? 'Unbanning...'
                                : 'Unban User'}
                        </Button>
                    )}
                </div>

                {actionError && (
                    <p className="text-small text-primary-red">
                        {actionError.message}
                    </p>
                )}
            </div>

            <AdminProfileEditDialog
                userId={user.id}
                userName={user.name}
                userBio={user.bio}
                open={editOpen}
                onOpenChange={setEditOpen}
            />

            <BanUserDialog
                open={banDialogOpen}
                onOpenChange={setBanDialogOpen}
                userName={user.name}
                pending={banMutation.isPending}
                onConfirm={(reason) => {
                    banMutation.mutate(
                        { id: user.id, reason },
                        {
                            onSuccess: () => {
                                setBanDialogOpen(false);
                            },
                        }
                    );
                }}
            />
        </>
    );
}
