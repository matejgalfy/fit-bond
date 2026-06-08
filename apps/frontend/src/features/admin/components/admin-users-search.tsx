import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Search } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserAvatar } from '@/components/ui/user-avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { IconInput } from '@/components/icon-input';
import { EmptyState } from '@/components/empty-state';
import { useDebounce } from '@/hooks/use-debounce';
import { useAdminUsers } from '../hooks/use-admin-users';

interface AdminUserRow {
    id: string;
    name: string;
    email: string;
    image: string | null;
    role: 'user' | 'admin';
    banned: boolean | null;
    deletedAt: Date | string | null;
}

export function AdminUsersSearch() {
    const [name, setName] = useState('');
    const debouncedName = useDebounce(name, 300);
    const trimmed = debouncedName.trim();

    const { data, isFetching, isError } = useAdminUsers(
        trimmed
            ? { search: trimmed, includeDeleted: true, limit: 25 }
            : undefined
    );

    const users = (data ?? []) as AdminUserRow[];

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
                    }}
                />
            </Card>

            {trimmed && isFetching && <Skeleton className="h-20 rounded-2xl" />}

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
                        <UserRow key={u.id} user={u} />
                    ))}
                </div>
            )}
        </div>
    );
}

interface UserRowProps {
    user: AdminUserRow;
}

function UserRow({ user }: UserRowProps) {
    return (
        <Link
            to="/admin/profile-page"
            search={{ userId: user.id }}
            className="block"
        >
            <Card className="p-4 border-outline bg-surface shadow-sm rounded-2xl cursor-pointer transition hover:bg-muted/30">
                <div className="flex items-center gap-4">
                    <UserAvatar
                        name={user.name}
                        imageUrl={user.image}
                        size={48}
                    />
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
                        {user.banned && (
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
        </Link>
    );
}
