import {
    CalendarDays,
    Clock,
    MapPin,
    Users,
    type LucideIcon,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { Event } from '../../types';
import {
    formatEventDate,
    formatEventDuration,
    formatEventTime,
} from '../../utils/event-formatters';

interface EventDetailInfoGridProps {
    event: Event;
}

interface EventInfoItem {
    icon: LucideIcon;
    label: string;
    value: string;
}

export function EventDetailInfoGrid({ event }: EventDetailInfoGridProps) {
    const items: EventInfoItem[] = [
        {
            icon: CalendarDays,
            label: 'Date',
            value: formatEventDate(event.startTime),
        },
        {
            icon: Clock,
            label: 'Time',
            value: `${formatEventTime(event.startTime)} - ${formatEventDuration(event.duration)}`,
        },
        {
            icon: MapPin,
            label: 'Location',
            value: event.location.formattedAddress,
        },
        {
            icon: Users,
            label: 'Capacity',
            value: `${String(event.currentParticipants)}/${String(event.capacity)} spots filled`,
        },
    ];

    return (
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {items.map((item) => {
                const Icon = item.icon;

                return (
                    <Card
                        key={item.label}
                        size="default"
                        className="gap-1 rounded-xl px-4 py-3"
                    >
                        <div className="flex items-center gap-1.5 text-tiny font-medium text-secondary-text">
                            <Icon size={18} className="text-primary-blue" />
                            <span className="text-regular">{item.label}</span>
                        </div>
                        <p className="m-0 text-small font-medium leading-5 text-primary-text">
                            {item.value}
                        </p>
                    </Card>
                );
            })}
        </div>
    );
}
