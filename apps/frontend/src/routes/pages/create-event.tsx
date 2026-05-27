import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/empty-state';
import { EventForm } from '@/features/events/components/creation/event-form';
import {
    useCreateEvent,
    useEvent,
    useUpdateEvent,
} from '@/features/events/hooks/events';
import {
    buildEventFormState,
    buildEventLocationSuggestion,
} from '@/features/events/utils/event-form-state';

interface CreateEventSearch {
    eventId?: string;
    from?: 'my-events';
}

export const Route = createFileRoute('/pages/create-event')({
    validateSearch: (search): CreateEventSearch => {
        return {
            eventId:
                typeof search.eventId === 'string' ? search.eventId : undefined,
            from: search.from === 'my-events' ? 'my-events' : undefined,
        };
    },
    component: CreateEventPage,
});

function CreateEventPage() {
    const navigate = useNavigate();
    const { eventId, from }: CreateEventSearch = Route.useSearch();
    const isEditMode = Boolean(eventId);

    const { data: event, isPending: eventPending, isError } = useEvent(eventId);
    const { mutateAsync: createEvent, isPending } = useCreateEvent();
    const { mutateAsync: updateEvent, isPending: isUpdating } =
        useUpdateEvent(eventId);

    const isFormPending = isPending || isUpdating;

    if (isEditMode && eventPending) {
        return (
            <div className="max-w-180 mx-auto">
                <Skeleton className="mb-6 h-8 w-40" />
                <div className="space-y-6">
                    <Skeleton className="h-70 rounded-xl" />
                    <Skeleton className="h-58 rounded-xl" />
                    <Skeleton className="h-48 rounded-xl" />
                </div>
            </div>
        );
    }

    if (isEditMode && (isError || !event)) {
        return (
            <div className="max-w-180 mx-auto">
                <EmptyState>
                    <div className="flex flex-col items-center gap-4">
                        <div>
                            <h1 className="font-heading text-subheading font-semibold text-primary-text">
                                Failed to load event
                            </h1>
                            <p className="mt-1 text-regular text-secondary-text">
                                The event may no longer exist or could not be
                                loaded right now.
                            </p>
                        </div>
                        <Button variant="outline" asChild>
                            <Link to="/pages/my-events">Back to my events</Link>
                        </Button>
                    </div>
                </EmptyState>
            </div>
        );
    }

    return (
        <div className="max-w-180 mx-auto">
            <div className="mb-6">
                <h1 className="font-heading text-heading font-bold m-0 text-primary-text">
                    {isEditMode ? 'Edit Event' : 'Create New Event'}
                </h1>
            </div>

            <EventForm
                key={event?.id ?? 'create'}
                initialState={event ? buildEventFormState(event) : undefined}
                initialLocation={
                    event ? buildEventLocationSuggestion(event) : undefined
                }
                isPending={isFormPending}
                submitLabel={isEditMode ? 'Save Event' : 'Publish Event'}
                pendingLabel={isEditMode ? 'Saving...' : 'Publishing...'}
                fallbackErrorMessage={
                    isEditMode
                        ? 'Failed to save event. Please try again.'
                        : 'Failed to create event. Please try again.'
                }
                onSubmit={async (payload) => {
                    if (isEditMode) {
                        await updateEvent(payload);
                        await navigate({
                            to: '/pages/event-detail-page',
                            search: {
                                eventId,
                                ...(from ? { from } : {}),
                            },
                        });
                        return;
                    }

                    await createEvent(payload);
                    await navigate({ to: '/pages/my-events' });
                }}
                onCancel={() => {
                    if (isEditMode) {
                        void navigate({
                            to: '/pages/event-detail-page',
                            search: {
                                eventId,
                                ...(from ? { from } : {}),
                            },
                        });
                        return;
                    }

                    void navigate({ to: '/pages/my-events' });
                }}
            />
        </div>
    );
}
