import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { ApiError } from '@/lib/api-error';
import type { CreateEventBody } from '../../../../../../backend/src/modules/events/events.schema';
import type { LocationSuggestion } from '../../../../../../backend/src/modules/locations/locations.schema';
import {
    buildCreateEventPayload,
    type CreateEventFormState,
} from '../../utils/create-event-payload';
import {
    eventFormSchema,
    type EventFormValues,
} from '../../validation/event-form-schema';
import { CreatingEventBasics } from './event-basics';
import { CreatingEventDetails } from './details/event-details';
import { CreatingEventTimeLocation } from './time-and-location/event-time-and-location';

const EMPTY_FORM_STATE: CreateEventFormState = {
    eventName: '',
    sportId: '',
    description: '',
    eventDate: '',
    startHour: '',
    startMinute: '',
    duration: 60,
    customDuration: '',
    customDurationUnit: 'min',
    meridiem: 'AM',
    skillLevel: 'beginner',
    capacity: '',
    coverImageUrl: '',
};

interface EventFormProps {
    initialState?: CreateEventFormState;
    initialLocation?: LocationSuggestion | null;
    isPending: boolean;
    submitLabel: string;
    pendingLabel: string;
    fallbackErrorMessage: string;
    onSubmit: (payload: CreateEventBody) => Promise<void>;
    onCancel: () => void;
}

export function EventForm({
    initialState = EMPTY_FORM_STATE,
    initialLocation = null,
    isPending,
    submitLabel,
    pendingLabel,
    fallbackErrorMessage,
    onSubmit,
    onCancel,
}: EventFormProps) {
    const form = useForm<EventFormValues>({
        resolver: zodResolver(eventFormSchema),
        defaultValues: { ...initialState, location: initialLocation },
    });

    const handleSubmit = async (values: EventFormValues) => {
        const { location } = values;
        if (!location) {
            return;
        }

        try {
            const payload = buildCreateEventPayload(values, location);
            await onSubmit(payload);
        } catch (err) {
            form.setError('root', {
                message:
                    err instanceof ApiError || err instanceof Error
                        ? err.message
                        : fallbackErrorMessage,
            });
        }
    };

    const rootError = form.formState.errors.root?.message;

    return (
        <Form {...form}>
            <form
                className="space-y-6"
                onSubmit={(e) => {
                    void form.handleSubmit(handleSubmit)(e);
                }}
            >
                <CreatingEventBasics />

                <CreatingEventTimeLocation />

                <CreatingEventDetails />

                {rootError && (
                    <p className="text-regular text-primary-red text-center">
                        {rootError}
                    </p>
                )}

                <div className="flex items-center gap-2">
                    <Button type="submit" size="sm" disabled={isPending}>
                        {isPending ? pendingLabel : submitLabel}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isPending}
                        onClick={onCancel}
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </Form>
    );
}
