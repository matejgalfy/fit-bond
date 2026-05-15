import { Heart, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { Event } from '../../types';

interface EventEngagementSummaryProps {
    event: Event;
}

export function EventEngagementSummary({ event }: EventEngagementSummaryProps) {
    const remainingSpots = Math.max(
        event.capacity - event.currentParticipants,
        0
    );

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
                <p className="m-0 text-tiny text-tertiary-text">
                    User list will appear when participation data is available.
                </p>
            </Card>
        </section>
    );
}
