import { Activity } from 'lucide-react';
import type { Event } from '../../types';

interface EventDetailCoverProps {
    event: Event;
}

export function EventDetailCover({ event }: EventDetailCoverProps) {
    return (
        <div className="h-45 rounded-2xl border border-outline bg-linear-to-br from-soft-blue to-primary-blue/20 flex items-center justify-center overflow-hidden">
            {event.coverImageUrl ? (
                <img
                    src={event.coverImageUrl}
                    alt={event.name}
                    className="h-full w-full object-cover"
                />
            ) : (
                <Activity
                    size={56}
                    className="text-primary-blue"
                    strokeWidth={1.25}
                />
            )}
        </div>
    );
}
