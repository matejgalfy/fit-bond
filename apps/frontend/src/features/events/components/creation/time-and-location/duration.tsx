import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type CustomDurationUnit = 'min' | 'h';

interface DurationFieldProps {
    duration: number;
    customDuration: string;
    customDurationUnit: CustomDurationUnit;
    onDurationChange: (duration: number) => void;
    onCustomDurationChange: (customDuration: string) => void;
    onCustomDurationUnitChange: (unit: CustomDurationUnit) => void;
}

const DURATION_OPTIONS = [
    { label: '30min', value: 30 },
    { label: '1h', value: 60 },
    { label: '1.5h', value: 90 },
    { label: '2h', value: 120 },
    { label: '3h', value: 180 },
    { label: 'Custom', value: 0 },
];

const CUSTOM_DURATION_UNITS: CustomDurationUnit[] = ['min', 'h'];

export function DurationField({
    duration,
    customDuration,
    customDurationUnit,
    onDurationChange,
    onCustomDurationChange,
    onCustomDurationUnitChange,
}: DurationFieldProps) {
    return (
        <FormField label="Duration">
            <div className="flex flex-wrap gap-2">
                {DURATION_OPTIONS.map((option) => (
                    <div key={option.label} className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant={
                                duration === option.value
                                    ? 'default'
                                    : 'outline'
                            }
                            size="sm"
                            onClick={() => {
                                onDurationChange(option.value);
                            }}
                            className={cn(
                                'h-8 rounded-xl px-3 text-tiny',
                                duration !== option.value &&
                                    'bg-transparent text-secondary-text hover:bg-muted-background hover:text-primary-text'
                            )}
                        >
                            {option.label}
                        </Button>

                        {option.value === 0 && duration === 0 && (
                            <div className="flex items-center gap-1">
                                <Input
                                    type="text"
                                    inputMode={
                                        customDurationUnit === 'h'
                                            ? 'decimal'
                                            : 'numeric'
                                    }
                                    value={customDuration}
                                    onChange={(e) => {
                                        onCustomDurationChange(e.target.value);
                                    }}
                                    className="h-8 w-18 rounded-md bg-background text-tiny"
                                />
                                <div className="grid grid-cols-2 gap-1">
                                    {CUSTOM_DURATION_UNITS.map((unit) => (
                                        <Button
                                            key={unit}
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                onCustomDurationUnitChange(
                                                    unit
                                                );
                                            }}
                                            className={cn(
                                                'h-8 rounded-md border-0 bg-transparent px-2 text-tiny shadow-none hover:bg-transparent hover:text-primary-text',
                                                customDurationUnit === unit
                                                    ? 'text-primary-text'
                                                    : 'text-tertiary-text'
                                            )}
                                        >
                                            {unit}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </FormField>
    );
}

export type { CustomDurationUnit };
