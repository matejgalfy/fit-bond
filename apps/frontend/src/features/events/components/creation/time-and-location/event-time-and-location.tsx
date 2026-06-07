import { Card } from '@/components/ui/card';
import { DateAndTimeFields, type Meridiem } from './date-and-time';
import { DurationField, type CustomDurationUnit } from './duration';
import { LocationField } from './location';

export function CreatingEventTimeLocation() {
    return (
        <Card className="p-5 border-outline bg-surface shadow-sm rounded-xl gap-0">
            <h2 className="font-heading text-regular font-bold mb-4">
                When & Where
            </h2>

            <DateAndTimeFields />

            <DurationField />

            <div className="mt-4">
                <LocationField />
            </div>
        </Card>
    );
}

export type { CustomDurationUnit, Meridiem };
