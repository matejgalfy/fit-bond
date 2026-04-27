import { Card } from '@/components/ui/card';
import { DateAndTimeFields, type Meridiem } from './date-and-time';
import { DurationField, type CustomDurationUnit } from './duration';
import { LocationField } from './location';

interface CreatingEventTimeLocationProps {
    eventDate: string;
    startHour: string;
    startMinute: string;
    location: string;
    duration: number;
    customDuration: string;
    customDurationUnit: CustomDurationUnit;
    meridiem: Meridiem;
    // eslint-disable-next-line no-unused-vars
    onEventDateChange: (eventDate: string) => void;
    // eslint-disable-next-line no-unused-vars
    onStartHourChange: (startHour: string) => void;
    // eslint-disable-next-line no-unused-vars
    onStartMinuteChange: (startMinute: string) => void;
    // eslint-disable-next-line no-unused-vars
    onLocationChange: (location: string) => void;
    // eslint-disable-next-line no-unused-vars
    onDurationChange: (duration: number) => void;
    // eslint-disable-next-line no-unused-vars
    onCustomDurationChange: (customDuration: string) => void;
    // eslint-disable-next-line no-unused-vars
    onCustomDurationUnitChange: (unit: CustomDurationUnit) => void;
    // eslint-disable-next-line no-unused-vars
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
