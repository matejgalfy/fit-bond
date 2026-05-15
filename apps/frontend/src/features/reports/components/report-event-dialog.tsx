import { Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReportTargetDialog } from './report-target-dialog';

interface ReportEventDialogProps {
    eventId: string;
}

export function ReportEventDialog({ eventId }: ReportEventDialogProps) {
    return (
        <ReportTargetDialog
            targetId={eventId}
            reportType="event"
            title="Report event"
            description="Send this event to moderators for review."
            reasonInputId="event-report-reason"
            trigger={
                <Button
                    variant="outline"
                    className="hover:bg-soft-red hover:text-primary-red"
                >
                    <Flag />
                    Report
                </Button>
            }
        />
    );
}
