import { useState } from 'react';
import type { UserProfile } from '../../../../../backend/src/modules/users/users.types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Pencil, Ban, ShieldCheck, Shield } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    useAdminUser,
    useBanUser,
    useUnbanUser,
} from '../hooks/use-admin-users';
import { AdminProfileEditDialog } from './admin-profile-edit-dialog';

interface AdminProfileActionsProps {
    user: UserProfile;
}

export function AdminProfileActions({ user }: AdminProfileActionsProps) {
    const { data: adminUserData } = useAdminUser(user.id);
    const banMutation = useBanUser();
    const unbanMutation = useUnbanUser();

    const [editOpen, setEditOpen] = useState(false);
    const [banDialogOpen, setBanDialogOpen] = useState(false);

    const isBanned = Boolean(adminUserData?.banned);
    const banReason =
        adminUserData?.banReason ?? adminUserData?.bannedReason ?? null;

    const actionError = banMutation.error ?? unbanMutation.error;

    const handleUnban = () => {
        unbanMutation.mutate({ id: user.id });
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

interface BanUserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userName: string;
    pending: boolean;
    onConfirm: (reason: string) => void;
}

function BanUserDialog({
    open,
    onOpenChange,
    userName,
    pending,
    onConfirm,
}: BanUserDialogProps) {
    const [reason, setReason] = useState('');

    const handleSubmit = () => {
        if (!reason.trim()) return;
        onConfirm(reason.trim());
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                onOpenChange(next);
                if (!next) setReason('');
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Ban {userName}</DialogTitle>
                    <DialogDescription>
                        The user will be blocked from authenticated actions
                        until unbanned.
                    </DialogDescription>
                </DialogHeader>
                <Textarea
                    placeholder="Reason for ban (required)"
                    value={reason}
                    onChange={(e) => {
                        setReason(e.target.value);
                    }}
                    rows={3}
                />
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => {
                            onOpenChange(false);
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleSubmit}
                        disabled={pending || !reason.trim()}
                    >
                        Ban user
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
