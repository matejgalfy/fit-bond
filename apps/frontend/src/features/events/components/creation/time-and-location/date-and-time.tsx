import { Clock } from 'lucide-react';
import { useFormContext, useController } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/date-picker';
import { cn } from '@/lib/utils';
import type { EventFormValues } from '../../../validation/event-form-schema';

type Meridiem = 'AM' | 'PM';

const MERIDIEM_OPTIONS: Meridiem[] = ['AM', 'PM'];

const clampTimePart = (value: string, max: number) => {
    if (!/^\d{0,2}$/.test(value)) {
        return null;
    }

    if (value !== '' && Number(value) > max) {
        return null;
    }

    return value;
};

export function DateAndTimeFields() {
    const form = useFormContext<EventFormValues>();
    const { field: minuteField } = useController({
        control: form.control,
        name: 'startMinute',
    });
    const { field: meridiemField } = useController({
        control: form.control,
        name: 'meridiem',
    });

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <FormField
                control={form.control}
                name="eventDate"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel htmlFor="event-date">
                            Date<span className="text-primary-red">*</span>
                        </FormLabel>
                        <FormControl>
                            <DatePicker
                                id="event-date"
                                value={field.value}
                                onChange={field.onChange}
                                required
                                className="bg-background hover:bg-background"
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="startHour"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel htmlFor="event-start-time">
                            Start time
                            <span className="text-primary-red">*</span>
                        </FormLabel>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <div className="flex h-10 items-center rounded-xl border border-outline bg-background px-3 pr-9 shadow-sm transition-colors focus-within:ring-2 focus-within:ring-primary-blue focus-within:ring-offset-2">
                                    <Input
                                        id="event-start-time"
                                        type="text"
                                        inputMode="numeric"
                                        autoComplete="off"
                                        aria-label="Start hour"
                                        placeholder="HH"
                                        maxLength={2}
                                        value={field.value}
                                        onChange={(e) => {
                                            const next = clampTimePart(
                                                e.target.value,
                                                12
                                            );
                                            if (next !== null) {
                                                field.onChange(next);
                                            }
                                        }}
                                        onBlur={() => {
                                            field.onBlur();
                                            if (field.value !== '') {
                                                field.onChange(
                                                    field.value.padStart(2, '0')
                                                );
                                            }
                                        }}
                                        className="h-auto w-7 rounded-none border-0 bg-transparent px-0 py-0 text-center text-regular text-primary-text shadow-none outline-none placeholder:text-secondary-text focus-visible:ring-0 focus-visible:ring-offset-0"
                                    />
                                    <span className="text-secondary-text">
                                        :
                                    </span>
                                    <Input
                                        type="text"
                                        inputMode="numeric"
                                        autoComplete="off"
                                        aria-label="Start minute"
                                        placeholder="MM"
                                        maxLength={2}
                                        value={minuteField.value}
                                        onChange={(e) => {
                                            const next = clampTimePart(
                                                e.target.value,
                                                59
                                            );
                                            if (next !== null) {
                                                minuteField.onChange(next);
                                            }
                                        }}
                                        onBlur={() => {
                                            minuteField.onBlur();
                                            if (minuteField.value !== '') {
                                                minuteField.onChange(
                                                    minuteField.value.padStart(
                                                        2,
                                                        '0'
                                                    )
                                                );
                                            }
                                        }}
                                        className="h-auto w-7 rounded-none border-0 bg-transparent px-0 py-0 text-center text-regular text-primary-text shadow-none outline-none placeholder:text-secondary-text focus-visible:ring-0 focus-visible:ring-offset-0"
                                    />
                                </div>
                                <Clock
                                    size={16}
                                    aria-hidden="true"
                                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-secondary-text"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-1">
                                {MERIDIEM_OPTIONS.map((option) => (
                                    <Button
                                        key={option}
                                        type="button"
                                        variant={
                                            meridiemField.value === option
                                                ? 'default'
                                                : 'outline'
                                        }
                                        size="sm"
                                        onClick={() => {
                                            meridiemField.onChange(option);
                                        }}
                                        className={cn(
                                            'h-10 rounded-xl px-3 text-tiny',
                                            meridiemField.value !== option &&
                                                'bg-transparent text-secondary-text hover:bg-muted-background hover:text-primary-text'
                                        )}
                                    >
                                        {option}
                                    </Button>
                                ))}
                            </div>
                        </div>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
}

export type { Meridiem };
