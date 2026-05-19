import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/lib/api-error';
import type { CreateEventBody } from '../../../../../../backend/src/modules/events/events.schema';
import type { SkillLevel } from '../../../../../../backend/src/modules/events/events.types';
import type { LocationSuggestion } from '../../../../../../backend/src/modules/locations/locations.schema';
import {
    buildCreateEventPayload,
    type CreateEventFormState,
} from '../../utils/create-event-payload';
import { validateCreateEventInput } from '../../validation/create-event-validation';
import { CreatingEventBasics } from './event-basics';
import { CreatingEventDetails, type Visibility } from './details/event-details';
import {
    CreatingEventTimeLocation,
    type CustomDurationUnit,
    type Meridiem,
} from './time-and-location/event-time-and-location';

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
    visibility: 'public',
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
    const [eventName, setEventName] = useState(initialState.eventName);
    const [sportId, setSportId] = useState(initialState.sportId);
    const [description, setDescription] = useState(initialState.description);
    const [eventDate, setEventDate] = useState(initialState.eventDate);
    const [startHour, setStartHour] = useState(initialState.startHour);
    const [startMinute, setStartMinute] = useState(initialState.startMinute);
    const [location, setLocation] = useState<LocationSuggestion | null>(
        initialLocation
    );
    const [duration, setDuration] = useState(initialState.duration);
    const [customDuration, setCustomDuration] = useState(
        initialState.customDuration
    );
    const [customDurationUnit, setCustomDurationUnit] =
        useState<CustomDurationUnit>(initialState.customDurationUnit);
    const [meridiem, setMeridiem] = useState<Meridiem>(initialState.meridiem);
    const [skillLevel, setSkillLevel] = useState<SkillLevel>(
        initialState.skillLevel
    );
    const [visibility, setVisibility] = useState<Visibility>(
        initialState.visibility
    );
    const [capacity, setCapacity] = useState(initialState.capacity);
    const [coverImageUrl, setCoverImageUrl] = useState(
        initialState.coverImageUrl
    );
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        setError('');

        const validationError = validateCreateEventInput({
            eventName,
            sportId,
            description,
            eventDate,
            startHour,
            startMinute,
            location,
            duration,
            customDuration,
            customDurationUnit,
            meridiem,
            capacity,
        });

        if (validationError) {
            setError(validationError);
            return;
        }

        if (!location) {
            setError('Please select a location.');
            return;
        }

        try {
            const payload = buildCreateEventPayload(
                {
                    eventName,
                    sportId,
                    description,
                    eventDate,
                    startHour,
                    startMinute,
                    duration,
                    customDuration,
                    customDurationUnit,
                    meridiem,
                    skillLevel,
                    visibility,
                    capacity,
                    coverImageUrl,
                },
                location
            );

            await onSubmit(payload);
        } catch (err) {
            if (err instanceof ApiError || err instanceof Error) {
                setError(err.message);
                return;
            }
            setError(fallbackErrorMessage);
        }
    };

    return (
        <form
            className="space-y-6"
            onSubmit={(e) => {
                e.preventDefault();
                void handleSubmit();
            }}
        >
            <CreatingEventBasics
                eventName={eventName}
                sportId={sportId}
                description={description}
                coverImageUrl={coverImageUrl}
                onEventNameChange={setEventName}
                onSportIdChange={setSportId}
                onDescriptionChange={setDescription}
                onCoverImageUrlChange={setCoverImageUrl}
                onCoverImageError={setError}
            />

            <CreatingEventTimeLocation
                eventDate={eventDate}
                startHour={startHour}
                startMinute={startMinute}
                location={location}
                duration={duration}
                customDuration={customDuration}
                customDurationUnit={customDurationUnit}
                meridiem={meridiem}
                onEventDateChange={setEventDate}
                onStartHourChange={setStartHour}
                onStartMinuteChange={setStartMinute}
                onLocationChange={setLocation}
                onDurationChange={setDuration}
                onCustomDurationChange={setCustomDuration}
                onCustomDurationUnitChange={setCustomDurationUnit}
                onMeridiemChange={setMeridiem}
            />

            <CreatingEventDetails
                capacity={capacity}
                skillLevel={skillLevel}
                visibility={visibility}
                onCapacityChange={setCapacity}
                onSkillLevelChange={setSkillLevel}
                onVisibilityChange={setVisibility}
            />

            {error && (
                <p className="text-regular text-primary-red text-center">
                    {error}
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
    );
}
