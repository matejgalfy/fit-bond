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
            className="rounded-full bg-linear-to-br from-primary-blue to-strong-blue flex items-center justify-center text-surface font-semibold shrink-0"
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
        <div className="bg-surface rounded-2xl overflow-hidden border border-outline transition-[transform,box-shadow] duration-200 cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)]">
            <div className="h-30 flex items-center justify-center relative bg-linear-to-br bg-soft-blue">
                <span>
                    <Activity
                        size={36}
                        color="var(--primary-blue)"
                        strokeWidth={1.5}
                    />
                </span>
                <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                    {isFull && (
                        <span className="bg-primary-red text-surface text-tiny font-semibold px-2 py-0.5 rounded-md">
                            Full
                        </span>
                    )}
                    {isCancelled && (
                        <span className="bg-muted-background/30 text-secondary-text text-tiny font-semibold px-2 py-0.5 rounded-md">
                            Cancelled
                        </span>
                    )}
                </div>
                <span className="absolute top-2 left-2 bg-primary-blue/10 text-primary-blue text-tiny font-semibold px-2 py-0.5 rounded-md backdrop-blur-sm">
                    {event.sport.name}
                </span>
            </div>

            <div className="px-4 py-3">
                <h3 className="m-0 text-regular font-semibold text-primary-text font-heading">
                    {event.name}
                </h3>

                <div className="flex items-center gap-1.5 mt-2 text-tiny text-secondary-text">
                    <Clock size={13} />
                    <span>
                        {formattedDate} · {formattedTime}
                    </span>
                </div>

                <div className="flex items-center gap-1.5 mt-1 text-tiny text-secondary-text">
                    <MapPin size={13} />
                    <span>{location}</span>
                </div>

                <div className="flex justify-between text-tiny mt-2.5">
                    <span className="text-secondary-text flex items-center gap-1">
                        <Users size={13} /> {event.currentParticipants}/
                        {event.capacity} joined
                    </span>
                </div>

                <div className="flex items-center gap-2 mt-2.5 pt-2.5 border-t border-outline">
                    <Avatar name={event.organizer.name} size={24} />
                    <span className="text-tiny text-secondary-text">
                        {event.organizer.name}
                    </span>
                    <span
                        className={cn(
                            'ml-auto text-tiny font-medium px-2 py-0.5 rounded-sm',
                            event.skillLevel === 'beginner' &&
                                'text-primary-blue bg-soft-blue',
                            event.skillLevel === 'advanced' &&
                                'text-primary-red bg-soft-red',
                            event.skillLevel === 'intermediate' &&
                                'text-strong-orange bg-soft-orange'
                        )}
                    >
                        {skillLevelDisplay}
                    </span>
                </div>
            </div>
        </div>
    );
}
