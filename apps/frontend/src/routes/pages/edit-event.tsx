import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { EditEventView } from '@/features/events/components/edit/edit-event-view';
import { z } from 'zod';
import { zodValidator } from '@tanstack/zod-adapter';

const editEventSearchSchema = z.object({
    eventId: z.string(),
    from: z.literal('my-events').optional().catch(undefined),
});

type EditEventSearch = z.infer<typeof editEventSearchSchema>;

export const Route = createFileRoute('/pages/edit-event')({
    validateSearch: zodValidator(editEventSearchSchema),
    component: EditEventPage,
});

function EditEventPage() {
    const navigate = useNavigate();
    const { eventId, from }: EditEventSearch = Route.useSearch();

    return (
        <EditEventView
            eventId={eventId}
            onDone={() =>
                navigate({
                    to: '/pages/event-detail-page',
                    search: {
                        eventId,
                        ...(from ? { from } : {}),
                    },
                })
            }
            errorBackLink={
                <Button variant="outline" asChild>
                    <Link to="/pages/my-events">Back to my events</Link>
                </Button>
            }
        />
    );
}
