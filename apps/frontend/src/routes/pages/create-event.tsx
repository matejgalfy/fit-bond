import { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { CreatingEventBasics } from '@/features/events/components/creation/event-basics';
import {
    CreatingEventDetails,
    type Visibility,
} from '@/features/events/components/creation/details/event-details';
import {
    CreatingEventTimeLocation,
    type CustomDurationUnit,
    type Meridiem,
} from '@/features/events/components/creation/time-and-location/event-time-and-location';
import { validateCreateEventInput } from '@/features/events/validation/create-event-validation';
import type { SkillLevel } from '../../../../backend/src/modules/events/events.types';

export const Route = createFileRoute('/pages/create-event')({
    component: CreateEventPage,
});

function CreateEventPage() {
    const navigate = useNavigate();
    const [eventName, setEventName] = useState('');
    const [sportType, setSportType] = useState('');
    const [description, setDescription] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [startHour, setStartHour] = useState('');
    const [startMinute, setStartMinute] = useState('');
    const [location, setLocation] = useState('');
    const [duration, setDuration] = useState(60);
    const [customDuration, setCustomDuration] = useState('');
    const [customDurationUnit, setCustomDurationUnit] =
        useState<CustomDurationUnit>('min');
    const [meridiem, setMeridiem] = useState<Meridiem>('AM');
    const [skillLevel, setSkillLevel] = useState<SkillLevel>('beginner');
    const [visibility, setVisibility] = useState<Visibility>('public');
    const [capacity, setCapacity] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = () => {
        setError('');

        const validationError = validateCreateEventInput({
            eventName,
            sportType,
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
    };

    return (
        <div className="max-w-180 mx-auto">
            <div className="mb-6">
                <h1 className="font-heading text-heading font-bold m-0 text-primary-text">
                    Create New Event
                </h1>
            </div>

            <form
                className="space-y-6"
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit();
                }}
            >
                <CreatingEventBasics
                    eventName={eventName}
                    sportType={sportType}
                    description={description}
                    onEventNameChange={setEventName}
                    onSportTypeChange={setSportType}
                    onDescriptionChange={setDescription}
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
                    <Button type="submit" size="sm">
                        Publish Event
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            void navigate({ to: '/pages/my-events' });
                        }}
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
    );
}
