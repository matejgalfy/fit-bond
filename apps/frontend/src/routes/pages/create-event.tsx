import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { EventForm } from '@/features/events/components/creation/event-form';
import { useCreateEvent } from '@/features/events/hooks/events';

export const Route = createFileRoute('/pages/create-event')({
    component: CreateEventPage,
});

function CreateEventPage() {
    const navigate = useNavigate();
    const { mutateAsync: createEvent, isPending } = useCreateEvent();

    return (
        <div className="max-w-180 mx-auto">
            <div className="mb-6">
                <h1 className="font-heading text-heading font-bold m-0 text-primary-text">
                    Create New Event
                </h1>
            </div>

            <EventForm
                isPending={isPending}
                submitLabel="Publish Event"
                pendingLabel="Publishing..."
                fallbackErrorMessage="Failed to create event. Please try again."
                onSubmit={async (payload) => {
                    await createEvent(payload);
                    await navigate({ to: '/pages/my-events' });
                }}
                onCancel={() => {
                    void navigate({ to: '/pages/my-events' });
                }}
            />
        </div>
    );
}
