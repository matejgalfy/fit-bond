import { Activity, Clock, MapPin, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Event } from '../types';

export interface EventCardProps {
    event: Event;
}

interface AvatarProps {
    name: string;
    size?: number;
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

function formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });
}

function formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
}

function getSkillLevelDisplay(skillLevel: string): string {
    return skillLevel.charAt(0).toUpperCase() + skillLevel.slice(1);
}

export function EventCard({ event }: EventCardProps) {
    const isFull = event.currentParticipants >= event.capacity;
    const isCancelled = event.cancelledAt !== null;
    const formattedDate = formatDate(event.startTime);
    const formattedTime = formatTime(event.startTime);
    const skillLevelDisplay = getSkillLevelDisplay(event.skillLevel);
    const location = `${event.location.city}, ${event.location.country}`;

    return (
        <div className="bg-card rounded-2xl overflow-hidden border border-border transition-[transform,box-shadow] duration-200 cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)]">
            <div
                className="h-30 flex items-center justify-center relative"
                style={{
                    background: `linear-gradient(135deg, hsl(var(--primary)), hsl(var(--ring)))`,
                }}
            >
                <span className="opacity-60">
                    <Activity
                        size={36}
                        color="var(--primary)"
                        strokeWidth={1.5}
                    />
                </span>
                {isFull && (
                    <span className="absolute top-2 right-2 bg-destructive text-primary-foreground text-[11px] font-semibold px-2 py-0.5 rounded-md">
                        Full
                    </span>
                )}
                {isCancelled && (
                    <span className="absolute top-2 right-2 bg-muted text-muted-foreground text-[11px] font-semibold px-2 py-0.5 rounded-md">
                        Cancelled
                    </span>
                )}
                <span className="absolute top-2 left-2 bg-secondary text-primary text-[11px] font-semibold px-2 py-0.5 rounded-md backdrop-blur-sm">
                    {event.sport.name}
                </span>
            </div>

            <div className="px-4 py-3">
                <h3 className="m-0 text-[15px] font-semibold text-card-foreground font-heading">
                    {event.name}
                </h3>

                <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                    <Clock size={13} />
                    <span>
                        {formattedDate} · {formattedTime}
                    </span>
                </div>

                <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                    <MapPin size={13} />
                    <span>{location}</span>
                </div>

                <div className="flex justify-between text-xs mt-2.5">
                    <span className="text-muted-foreground flex items-center gap-1">
                        <Users size={13} /> {event.currentParticipants}/
                        {event.capacity} joined
                    </span>
                </div>

                <div className="flex items-center gap-2 mt-2.5 pt-2.5 border-t border-border">
                    <Avatar name={event.organizer.name} size={24} />
                    <span className="text-xs text-muted-foreground">
                        {event.organizer.name}
                    </span>
                    <span
                        className={cn(
                            'ml-auto text-[11px] font-medium px-2 py-0.5 rounded-md',
                            event.skillLevel === 'beginner' &&
                                'text-primary bg-secondary',
                            event.skillLevel === 'advanced' &&
                                'text-destructive bg-secondary',
                            event.skillLevel === 'intermediate' &&
                                'text-secondary-foreground bg-accent'
                        )}
                    >
                        {skillLevelDisplay}
                    </span>
                </div>
            </div>
        </div>
    );
}
