import { useState } from 'react';
import { Search } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { UserAvatar } from '@/components/ui/user-avatar';
import { IconInput } from '@/components/icon-input';
import { EmptyState } from '@/components/empty-state';
import { useFindUserByName } from '@/features/users/hooks/users';
import { useDebounce } from '@/hooks/use-debounce';

export function AdminUsersSearch() {
    const [name, setName] = useState('');
    const debouncedName = useDebounce(name, 300);
    const trimmed = debouncedName.trim();

    const {
        data: user,
        isFetching,
        isError,
    } = useFindUserByName(trimmed || undefined);

    return (
        <div className="flex flex-col gap-4">
            <Card className="p-5 border-outline bg-surface shadow-sm rounded-2xl">
                <label className="text-small text-secondary-text font-medium mb-1.5 block">
                    User name
                </label>
                <IconInput
                    icon={Search}
                    type="text"
                    placeholder="Search by exact user name..."
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value);
                    }}
                />
            </Card>

            {!trimmed && <EmptyState>Start typing to find a user.</EmptyState>}

            {trimmed && isFetching && (
                <div className="h-20 bg-muted-background rounded-2xl animate-pulse" />
            )}

            {trimmed && !isFetching && isError && (
                <EmptyState>
                    No user found matching &ldquo;{trimmed}&rdquo;.
                </EmptyState>
            )}

            {trimmed && !isFetching && !isError && user && (
                <Card className="p-4 border-outline bg-surface shadow-sm rounded-2xl">
                    <div className="flex items-center gap-4">
                        <UserAvatar
                            name={user.name}
                            imageUrl={user.image}
                            size={48}
                        />
                        <div className="flex flex-col">
                            <span className="font-semibold text-primary-text">
                                {user.name}
                            </span>
                            <span className="text-tiny text-secondary-text">
                                {user.email}
                            </span>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
}
