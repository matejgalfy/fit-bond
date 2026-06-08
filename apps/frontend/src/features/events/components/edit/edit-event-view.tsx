import type { ReactNode } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/empty-state';
import { EventForm } from '@/features/events/components/creation/event-form';
import { useEvent, useUpdateEvent } from '@/features/events/hooks/events';
import {
    buildEventFormState,
    buildEventLocationSuggestion,
} from '@/features/events/utils/event-form-state';

interface EditEventViewProps {
    eventId: string;
    /** Where to go after a successful save or a cancel. */
    onDone: () => void | Promise<void>;
    /** Back action rendered in the error state (links back to the right list). */
    errorBackLink: ReactNode;
}

export function EditEventView({
    eventId,
    onDone,
    errorBackLink,
}: EditEventViewProps) {
    const { data: event, isPending, isError } = useEvent(eventId);
    const { mutateAsync: updateEvent, isPending: isUpdating } =
        useUpdateEvent(eventId);

    if (isPending) {
        return (
            <div className="max-w-180">
                <Skeleton className="mb-6 h-8 w-40" />
                <div className="space-y-6">
                    <Skeleton className="h-70 rounded-xl" />
                    <Skeleton className="h-58 rounded-xl" />
                    <Skeleton className="h-48 rounded-xl" />
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="max-w-180">
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
                        {errorBackLink}
                    </div>
                </EmptyState>
            </div>
        );
    }

    return (
        <div className="max-w-180">
            <div className="mb-6">
                <h1 className="font-heading text-heading font-bold m-0 text-primary-text">
                    Edit Event
                </h1>
            </div>

            <EventForm
                key={event.id}
                initialState={buildEventFormState(event)}
                initialLocation={buildEventLocationSuggestion(event)}
                isPending={isUpdating}
                submitLabel="Save Event"
                pendingLabel="Saving..."
                fallbackErrorMessage="Failed to save event. Please try again."
                onSubmit={async (payload) => {
                    await updateEvent(payload);
                    await onDone();
                }}
                onCancel={() => {
                    void onDone();
                }}
            />
        </div>
    );
}
