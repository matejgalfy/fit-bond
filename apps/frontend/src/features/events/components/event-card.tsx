import { Activity, Clock, Heart, MapPin, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SportEvent {
    id: number;
    name: string;
    sport: string;
    date: string;
    time: string;
    location: string;
    participants: number;
    capacity: number;
    interested: number;
    organizer: string;
    skill: string;
    color: string;
    full?: boolean;
}

interface AvatarProps {
    name: string;
    size?: number;
}

interface EventCardProps {
    event: SportEvent;
}

export function Avatar({ name, size = 32 }: AvatarProps) {
    const initials = name
        .split(' ')
        .map((n) => n[0])
        .join('');

    return (
        <div
            className="rounded-full bg-[linear-gradient(135deg,var(--primary),var(--ring))] flex items-center justify-center text-primary-foreground font-semibold shrink-0"
            style={{
                width: size,
                height: size,
                fontSize: size * 0.38,
            }}
        >
            {initials}
        </div>
    );
}

export function EventCard({ event }: EventCardProps) {
    return (
        <div className="bg-card rounded-2xl overflow-hidden border border-border transition-[transform,box-shadow] duration-200 cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)]">
            <div
                className="h-30 flex items-center justify-center relative"
                style={{
                    background: `linear-gradient(135deg, color-mix(in srgb, ${event.color} 12%, transparent), color-mix(in srgb, ${event.color} 40%, transparent))`,
                }}
            >
                <span className="opacity-60">
                    <Activity size={36} color={event.color} strokeWidth={1.5} />
                </span>
                {event.full && (
                    <span className="absolute top-2 right-2 bg-destructive text-primary-foreground text-[11px] font-semibold px-2 py-0.5 rounded-md">
                        Full
                    </span>
                )}
                <span className="absolute top-2 left-2 bg-secondary text-primary text-[11px] font-semibold px-2 py-0.5 rounded-md backdrop-blur-sm">
                    {event.sport}
                </span>
            </div>

            <div className="px-4 py-3">
                <h3 className="m-0 text-[15px] font-semibold text-card-foreground font-heading">
                    {event.name}
                </h3>

                <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                    <Clock size={13} />
                    <span>
                        {event.date} · {event.time}
                    </span>
                </div>

                <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                    <MapPin size={13} />
                    <span>{event.location}</span>
                </div>

                <div className="flex justify-between text-xs mt-2.5">
                    <span className="text-muted-foreground flex items-center gap-1">
                        <Users size={13} /> {event.participants}/
                        {event.capacity} joined
                    </span>
                    <span className="text-primary flex items-center gap-1">
                        <Heart size={13} fill="var(--primary)" />{' '}
                        {event.interested}
                    </span>
                </div>

                <div className="flex items-center gap-2 mt-2.5 pt-2.5 border-t border-border">
                    <Avatar name={event.organizer} size={24} />
                    <span className="text-xs text-muted-foreground">
                        {event.organizer}
                    </span>
                    <span
                        className={cn(
                            'ml-auto text-[11px] font-medium px-2 py-0.5 rounded-md',
                            event.skill === 'Beginner' &&
                                'text-primary bg-secondary',
                            event.skill === 'Advanced' &&
                                'text-destructive bg-secondary',
                            event.skill === 'Intermediate' &&
                                'text-secondary-foreground bg-accent'
                        )}
                    >
                        {event.skill}
                    </span>
                </div>
            </div>
        </div>
    );
}
