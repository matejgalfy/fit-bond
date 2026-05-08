import { Card } from '@/components/ui/card';
import { DateAndTimeFields, type Meridiem } from './date-and-time';
import { DurationField, type CustomDurationUnit } from './duration';
import { LocationField } from './location';
import type { LocationSuggestion } from '../../../../../../../backend/src/modules/locations/locations.schema';

interface CreatingEventTimeLocationProps {
    eventDate: string;
    startHour: string;
    startMinute: string;
    location: LocationSuggestion | null;
    duration: number;
    customDuration: string;
    customDurationUnit: CustomDurationUnit;
    meridiem: Meridiem;
    onEventDateChange: (eventDate: string) => void;
    onStartHourChange: (startHour: string) => void;
    onStartMinuteChange: (startMinute: string) => void;
    onLocationChange: (location: LocationSuggestion | null) => void;
    onDurationChange: (duration: number) => void;
    onCustomDurationChange: (customDuration: string) => void;
    onCustomDurationUnitChange: (unit: CustomDurationUnit) => void;
    onMeridiemChange: (meridiem: Meridiem) => void;
}

export function CreatingEventTimeLocation({
    eventDate,
    startHour,
    startMinute,
    location,
    duration,
    customDuration,
    customDurationUnit,
    meridiem,
    onEventDateChange,
    onStartHourChange,
    onStartMinuteChange,
    onLocationChange,
    onDurationChange,
    onCustomDurationChange,
    onCustomDurationUnitChange,
    onMeridiemChange,
}: CreatingEventTimeLocationProps) {
    return (
        <Card className="p-5 border-outline bg-surface shadow-sm rounded-xl gap-0">
            <h2 className="font-heading text-regular font-bold mb-4">
                When & Where
            </h2>

            <DateAndTimeFields
                eventDate={eventDate}
                startHour={startHour}
                startMinute={startMinute}
                meridiem={meridiem}
                onEventDateChange={onEventDateChange}
                onStartHourChange={onStartHourChange}
                onStartMinuteChange={onStartMinuteChange}
                onMeridiemChange={onMeridiemChange}
            />

            <DurationField
                duration={duration}
                customDuration={customDuration}
                customDurationUnit={customDurationUnit}
                onDurationChange={onDurationChange}
                onCustomDurationChange={onCustomDurationChange}
                onCustomDurationUnitChange={onCustomDurationUnitChange}
            />

            <div className="mt-4">
                <LocationField
                    location={location}
                    onLocationChange={onLocationChange}
                />
            </div>
        </Card>
    );
}

export type { CustomDurationUnit, Meridiem };
