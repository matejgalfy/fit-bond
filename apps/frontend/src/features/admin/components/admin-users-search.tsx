import { useState } from 'react';
import { Search, Ban, ShieldCheck, ShieldOff, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { UserAvatar } from '@/components/ui/user-avatar';
import { IconInput } from '@/components/icon-input';
import { EmptyState } from '@/components/empty-state';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useDebounce } from '@/hooks/use-debounce';
import {
    useAdminUsers,
    useBanUser,
    useDeleteAdminUser,
    useUnbanUser,
    useUpdateAdminUser,
} from '../hooks/users';

interface AdminUserRow {
    id: string;
    name: string;
    email: string;
    image: string | null;
    bio: string | null;
    role: 'user' | 'admin';
    bannedReason: string | null;
    deletedAt: Date | string | null;
}

export function AdminUsersSearch() {
    const [name, setName] = useState('');
    const debouncedName = useDebounce(name, 300);
    const trimmed = debouncedName.trim();
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const { data, isFetching, isError } = useAdminUsers(
        trimmed
            ? { search: trimmed, includeDeleted: true, limit: 25 }
            : undefined
    );

    const users = (data ?? []) as AdminUserRow[];
    const selected = users.find((u) => u.id === selectedId) ?? null;

    return (
        <div className="flex flex-col gap-4">
            <Card className="p-5 border-outline bg-surface shadow-sm rounded-2xl">
                <label className="text-small text-secondary-text font-medium mb-1.5 block">
                    User name or email
                </label>
                <IconInput
                    icon={Search}
                    type="text"
                    placeholder="Search users..."
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value);
                        setSelectedId(null);
                    }}
                />
            </Card>

            {!trimmed && <EmptyState>Start typing to find a user.</EmptyState>}

            {trimmed && isFetching && (
                <div className="h-20 bg-muted-background rounded-2xl animate-pulse" />
            )}

            {trimmed && !isFetching && isError && (
                <EmptyState>Failed to load users.</EmptyState>
            )}

            {trimmed && !isFetching && !isError && users.length === 0 && (
                <EmptyState>
                    No users matching &ldquo;{trimmed}&rdquo;.
                </EmptyState>
            )}

            {users.length > 0 && (
                <div className="flex flex-col gap-2">
                    {users.map((u) => (
                        <UserRow
                            key={u.id}
                            user={u}
                            selected={u.id === selectedId}
                            onSelect={() => {
                                setSelectedId((prev) =>
                                    prev === u.id ? null : u.id
                                );
                            }}
                        />
                    ))}
                </div>
            )}

            {selected && <UserModerationPanel user={selected} />}
        </div>
    );
}

interface UserRowProps {
    user: AdminUserRow;
    selected: boolean;
    onSelect: () => void;
}

function UserRow({ user, selected, onSelect }: UserRowProps) {
    return (
        <Card
            onClick={onSelect}
            className={`p-4 border-outline bg-surface shadow-sm rounded-2xl cursor-pointer transition ${
                selected ? 'ring-2 ring-primary-blue' : 'hover:bg-muted/30'
            }`}
        >
            <div className="flex items-center gap-4">
                <UserAvatar name={user.name} imageUrl={user.image} size={48} />
                <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-semibold text-primary-text truncate">
                        {user.name}
                    </span>
                    <span className="text-tiny text-secondary-text truncate">
                        {user.email}
                    </span>
                </div>
                <div className="flex flex-wrap gap-1.5 justify-end">
                    {user.role === 'admin' && (
                        <Badge className="bg-soft-purple text-strong-purple rounded-md">
                            Admin
                        </Badge>
                    )}
                    {user.bannedReason && (
                        <Badge variant="destructive" className="rounded-md">
                            Banned
                        </Badge>
                    )}
                    {user.deletedAt && (
                        <Badge className="bg-muted text-muted-foreground rounded-md">
                            Deleted
                        </Badge>
                    )}
                </div>
            </div>
        </Card>
    );
}

interface UserModerationPanelProps {
    user: AdminUserRow;
}

function UserModerationPanel({ user }: UserModerationPanelProps) {
    const [banDialogOpen, setBanDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const banMutation = useBanUser();
    const unbanMutation = useUnbanUser();
    const updateMutation = useUpdateAdminUser();
    const deleteMutation = useDeleteAdminUser();

    const isDeleted = Boolean(user.deletedAt);
    const isBanned = Boolean(user.bannedReason);

    const actionError =
        banMutation.error ??
        unbanMutation.error ??
        updateMutation.error ??
        deleteMutation.error;

    const handleToggleRole = () => {
        const nextRole = user.role === 'admin' ? 'user' : 'admin';
        updateMutation.mutate({ id: user.id, body: { role: nextRole } });
    };

    const handleUnban = () => {
        unbanMutation.mutate({ id: user.id });
    };

    return (
        <Card className="p-5 border-outline bg-surface shadow-sm rounded-2xl">
            <div className="flex flex-col gap-3">
                <h3 className="font-heading text-subheading font-bold m-0 text-primary-text">
                    Moderate &ldquo;{user.name}&rdquo;
                </h3>
                {user.bio && (
                    <p className="text-small text-secondary-text m-0">
                        {user.bio}
                    </p>
                )}
                {isBanned && (
                    <p className="text-small text-destructive m-0">
                        Banned: {user.bannedReason}
                    </p>
                )}
                <div className="flex flex-wrap gap-2">
                    {!isBanned && !isDeleted && (
                        <Button
                            variant="outline"
                            onClick={() => {
                                setBanDialogOpen(true);
                            }}
                        >
                            <Ban size={16} />
                            Ban
                        </Button>
                    )}
                    {isBanned && (
                        <Button
                            variant="outline"
                            onClick={handleUnban}
                            disabled={unbanMutation.isPending}
                        >
                            <ShieldCheck size={16} />
                            Unban
                        </Button>
                    )}
                    {!isDeleted && (
                        <Button
                            variant="outline"
                            onClick={handleToggleRole}
                            disabled={updateMutation.isPending}
                        >
                            <ShieldOff size={16} />
                            {user.role === 'admin'
                                ? 'Demote to user'
                                : 'Promote to admin'}
                        </Button>
                    )}
                    {!isDeleted && (
                        <Button
                            variant="outline"
                            className="text-destructive border-destructive/40 hover:bg-destructive/10"
                            onClick={() => {
                                setDeleteDialogOpen(true);
                            }}
                        >
                            <Trash2 size={16} />
                            Delete
                        </Button>
                    )}
                </div>
                {actionError && (
                    <p className="text-small text-destructive m-0">
                        {actionError.message}
                    </p>
                )}
            </div>

            <BanUserDialog
                open={banDialogOpen}
                onOpenChange={setBanDialogOpen}
                userName={user.name}
                pending={banMutation.isPending}
                onConfirm={(reason) => {
                    banMutation.mutate(
                        { id: user.id, body: { reason } },
                        {
                            onSuccess: () => {
                                setBanDialogOpen(false);
                            },
                        }
                    );
                }}
            />

            <ConfirmDeleteDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                userName={user.name}
                pending={deleteMutation.isPending}
                onConfirm={() => {
                    deleteMutation.mutate(
                        { id: user.id },
                        {
                            onSuccess: () => {
                                setDeleteDialogOpen(false);
                            },
                        }
                    );
                }}
            />
        </Card>
    );
}

interface BanUserDialogProps {
    open: boolean;
    onOpenChange: (_open: boolean) => void;
    userName: string;
    pending: boolean;
    onConfirm: (_reason: string) => void;
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

interface ConfirmDeleteDialogProps {
    open: boolean;
    onOpenChange: (_open: boolean) => void;
    userName: string;
    pending: boolean;
    onConfirm: () => void;
}

function ConfirmDeleteDialog({
    open,
    onOpenChange,
    userName,
    pending,
    onConfirm,
}: ConfirmDeleteDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete {userName}?</DialogTitle>
                    <DialogDescription>
                        This soft-deletes the account. The user will be hidden
                        from regular search results but can be restored from the
                        database.
                    </DialogDescription>
                </DialogHeader>
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
                        onClick={onConfirm}
                        disabled={pending}
                    >
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
