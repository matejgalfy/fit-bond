import { Link } from '@tanstack/react-router';
import { Badge } from '@/components/ui/badge';
import { UserAvatar } from '@/components/ui/user-avatar';
import { cn } from '@/lib/utils';
import type { Event } from '../../types';
import { formatSkillLevel } from '../../utils/event-formatters';

interface EventDetailHeaderProps {
    event: Event;
}

export function EventDetailHeader({ event }: EventDetailHeaderProps) {
    const isCancelled = Boolean(event.cancelledAt);

    return (
        <header className="mt-5">
            <h1 className="m-0 font-heading text-heading font-bold text-primary-text">
                {event.name}
            </h1>

            <div className="mt-3 flex flex-wrap gap-2">
                <Badge className="bg-soft-blue text-primary-blue">
                    {event.sport.name}
                </Badge>
                <Badge
                    className={cn(
                        event.skillLevel === 'beginner' &&
                            'bg-soft-blue text-primary-blue',
                        event.skillLevel === 'intermediate' &&
                            'bg-soft-orange text-strong-orange',
                        event.skillLevel === 'advanced' &&
                            'bg-soft-red text-primary-red'
                    )}
                >
                    {formatSkillLevel(event.skillLevel)}
                </Badge>
                <Badge className="text-secondary-text">
                    {event.isPublic ? 'Public' : 'Private'}
                </Badge>
                {isCancelled && (
                    <Badge className="bg-soft-red text-primary-red">
                        Cancelled
                    </Badge>
                )}
            </div>

            <Link
                to="/pages/profile-page"
                search={{ userId: event.organizer.id }}
                className="mt-4 inline-flex items-center gap-2 text-regular text-secondary-text"
            >
                <UserAvatar
                    name={event.organizer.name}
                    imageUrl={event.organizer.image}
                    size={28}
                />
                <span>
                    Organized by{' '}
                    <span className="font-medium text-primary-blue">
                        {event.organizer.name}
                    </span>
                </span>
            </Link>
        </header>
    );
}
