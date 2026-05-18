import { Heart, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { UserAvatar } from '@/components/ui/user-avatar';
import type { Event, Participant } from '../../types';
import {
    useEventInterested,
    useEventParticipants,
} from '../../hooks/participation';

interface EventEngagementSummaryProps {
    event: Event;
}

interface UserListProps {
    users?: Participant[];
    isPending: boolean;
    isError: boolean;
    emptyText: string;
}

function UserList({ users, isPending, isError, emptyText }: UserListProps) {
    if (isPending) {
        return (
            <div className="mt-1 flex gap-2">
                {[1, 2, 3].map((item) => (
                    <div
                        key={item}
                        className="h-7 w-7 animate-pulse rounded-full bg-muted-background"
                    />
                ))}
            </div>
        );
    }

    if (isError) {
        return (
            <p className="m-0 text-tiny text-tertiary-text">
                Could not load users.
            </p>
        );
    }

    if (!users || users.length === 0) {
        return <p className="m-0 text-tiny text-tertiary-text">{emptyText}</p>;
    }

    return (
        <ul className="m-0 mt-1 flex list-none flex-wrap gap-3 p-0">
            {users.map((user) => (
                <li key={user.id} className="flex items-center gap-1.5">
                    <UserAvatar
                        name={user.name}
                        imageUrl={user.image}
                        size={28}
                    />
                    <span className="text-tiny text-secondary-text">
                        {user.name}
                    </span>
                </li>
            ))}
        </ul>
    );
}

export function EventEngagementSummary({ event }: EventEngagementSummaryProps) {
    const remainingSpots = Math.max(
        event.capacity - event.currentParticipants,
        0
    );

    const participants = useEventParticipants(event.id);
    const interested = useEventInterested(event.id);

    return (
        <section className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Card size="sm" className="rounded-xl px-4 py-3">
                <div className="flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-soft-blue text-primary-blue">
                        <Users size={18} />
                    </span>
                    <div>
                        <h2 className="m-0 font-heading text-regular font-semibold text-primary-text">
                            Participants
                        </h2>
                        <p className="m-0 mt-0.5 text-small text-secondary-text">
                            {String(event.currentParticipants)} of{' '}
                            {String(event.capacity)} spots filled
                        </p>
                    </div>
                </div>
                <p className="m-0 text-tiny text-tertiary-text">
                    {remainingSpots === 0
                        ? 'Event is full'
                        : `${String(remainingSpots)} spots remaining`}
                </p>
                <UserList
                    users={participants.data}
                    isPending={participants.isPending}
                    isError={participants.isError}
                    emptyText="No participants yet."
                />
            </Card>

            <Card size="sm" className="rounded-xl px-4 py-3">
                <div className="flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-soft-orange text-primary-orange">
                        <Heart size={18} />
                    </span>
                    <div>
                        <h2 className="m-0 font-heading text-regular font-semibold text-primary-text">
                            Interested
                        </h2>
                        <p className="m-0 mt-0.5 text-small text-secondary-text">
                            {String(event.currentInterested)} users marked
                            interest
                        </p>
                    </div>
                </div>
                <UserList
                    users={interested.data}
                    isPending={interested.isPending}
                    isError={interested.isError}
                    emptyText="No one has marked interest yet."
                />
            </Card>
        </section>
    );
}
