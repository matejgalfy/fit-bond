import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { EditEventView } from '@/features/events/components/edit/edit-event-view';
import { z } from 'zod';
import { zodValidator } from '@tanstack/zod-adapter';

const adminEditEventSearchSchema = z.object({
    eventId: z.string(),
});

type AdminEditEventSearch = z.infer<typeof adminEditEventSearchSchema>;

export const Route = createFileRoute('/admin/edit-event')({
    validateSearch: zodValidator(adminEditEventSearchSchema),
    component: AdminEditEventPage,
});

function AdminEditEventPage() {
    const navigate = useNavigate();
    const { eventId }: AdminEditEventSearch = Route.useSearch();

    return (
        <EditEventView
            eventId={eventId}
            onDone={() =>
                navigate({
                    to: '/admin/event-detail-page',
                    search: { eventId },
                })
            }
            errorBackLink={
                <Button variant="outline" asChild>
                    <Link to="/admin/discover">Back to discovery</Link>
                </Button>
            }
        />
    );
}
