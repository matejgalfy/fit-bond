import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Search } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserAvatar } from '@/components/ui/user-avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { IconInput } from '@/components/icon-input';
import { EmptyState } from '@/components/empty-state';
import { useDebounce } from '@/hooks/use-debounce';
import { useInfiniteAdminUsers } from '../hooks/use-admin-users';

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

    const {
        data,
        isPending,
        isError,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteAdminUsers({
        search: trimmed || undefined,
        includeDeleted: true,
        limit: 25,
    });

    const users = (data?.pages.flat() ?? []) as AdminUserRow[];

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

            {isPending ? (
                <Skeleton className="h-20 rounded-2xl" />
            ) : isError ? (
                <EmptyState>Failed to load users.</EmptyState>
            ) : users.length === 0 ? (
                <EmptyState>
                    {trimmed
                        ? `No users matching “${trimmed}”.`
                        : 'No users found.'}
                </EmptyState>
            ) : (
                <div className="flex flex-col gap-2">
                    {users.map((u) => (
                        <UserRow key={u.id} user={u} />
                    ))}
                </div>
            )}

            {hasNextPage && (
                <div className="mt-2 flex justify-center">
                    <Button
                        variant="secondary"
                        onClick={() => void fetchNextPage()}
                        disabled={isFetchingNextPage}
                    >
                        {isFetchingNextPage ? 'Loading…' : 'Load more'}
                    </Button>
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
                            <Badge className="bg-soft-orange text-strong-orange rounded-md">
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
