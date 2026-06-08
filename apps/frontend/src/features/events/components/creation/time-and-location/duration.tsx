import { useFormContext, useController } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { EventFormValues } from '../../../validation/event-form-schema';

type CustomDurationUnit = 'min' | 'h';

const DURATION_OPTIONS = [
    { label: '30min', value: 30 },
    { label: '1h', value: 60 },
    { label: '1.5h', value: 90 },
    { label: '2h', value: 120 },
    { label: '3h', value: 180 },
    { label: 'Custom', value: 0 },
];

const CUSTOM_DURATION_UNITS: CustomDurationUnit[] = ['min', 'h'];

export function DurationField() {
    const form = useFormContext<EventFormValues>();
    const { field: durationField } = useController({
        control: form.control,
        name: 'duration',
    });
    const { field: unitField } = useController({
        control: form.control,
        name: 'customDurationUnit',
    });

    return (
        <FormField
            control={form.control}
            name="customDuration"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Duration</FormLabel>
                    <div className="flex flex-wrap gap-2">
                        {DURATION_OPTIONS.map((option) => (
                            <div
                                key={option.label}
                                className="flex items-center gap-2"
                            >
                                <Button
                                    type="button"
                                    variant={
                                        durationField.value === option.value
                                            ? 'default'
                                            : 'outline'
                                    }
                                    size="sm"
                                    onClick={() => {
                                        durationField.onChange(option.value);
                                    }}
                                    className={cn(
                                        'h-8 rounded-xl px-3 text-tiny',
                                        durationField.value !== option.value &&
                                            'bg-transparent text-secondary-text hover:bg-muted-background hover:text-primary-text'
                                    )}
                                >
                                    {option.label}
                                </Button>

                                {option.value === 0 &&
                                    durationField.value === 0 && (
                                        <div className="flex items-center gap-1">
                                            <Input
                                                type="text"
                                                inputMode={
                                                    unitField.value === 'h'
                                                        ? 'decimal'
                                                        : 'numeric'
                                                }
                                                value={field.value}
                                                onChange={(e) => {
                                                    field.onChange(
                                                        e.target.value
                                                    );
                                                }}
                                                className="h-8 w-18 rounded-md bg-background text-tiny"
                                            />
                                            <div className="grid grid-cols-2 gap-1">
                                                {CUSTOM_DURATION_UNITS.map(
                                                    (unit) => (
                                                        <Button
                                                            key={unit}
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                unitField.onChange(
                                                                    unit
                                                                );
                                                            }}
                                                            className={cn(
                                                                'h-8 rounded-md border-0 bg-transparent px-2 text-tiny shadow-none hover:bg-transparent hover:text-primary-text',
                                                                unitField.value ===
                                                                    unit
                                                                    ? 'text-primary-text'
                                                                    : 'text-tertiary-text'
                                                            )}
                                                        >
                                                            {unit}
                                                        </Button>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    )}
                            </div>
                        ))}
                    </div>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}

export type { CustomDurationUnit };
