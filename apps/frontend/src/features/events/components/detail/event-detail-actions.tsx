import { Heart, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReportEventDialog } from '@/features/reports/components/report-event-dialog';
import type { Event } from '../../types';

interface EventDetailActionsProps {
    event: Event;
}

export function EventDetailActions({ event }: EventDetailActionsProps) {
    return (
        <div className="mt-5 flex flex-wrap gap-2">
            <Button disabled>
                <UserPlus />
                Join Event
            </Button>
            <Button variant="outline" disabled>
                <Heart />
                Interested
            </Button>
            <ReportEventDialog eventId={event.id} />
        </div>
    );
}
