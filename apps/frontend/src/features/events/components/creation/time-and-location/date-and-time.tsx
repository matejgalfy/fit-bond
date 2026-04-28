import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type Meridiem = 'AM' | 'PM';

interface DateAndTimeFieldsProps {
    eventDate: string;
    startHour: string;
    startMinute: string;
    meridiem: Meridiem;
    onEventDateChange: (eventDate: string) => void;
    onStartHourChange: (startHour: string) => void;
    onStartMinuteChange: (startMinute: string) => void;
    onMeridiemChange: (meridiem: Meridiem) => void;
}

const MERIDIEM_OPTIONS: Meridiem[] = ['AM', 'PM'];

export function DateAndTimeFields({
    eventDate,
    startHour,
    startMinute,
    meridiem,
    onEventDateChange,
    onStartHourChange,
    onStartMinuteChange,
    onMeridiemChange,
}: DateAndTimeFieldsProps) {
    const handleStartHourChange = (value: string) => {
        if (!/^\d{0,2}$/.test(value)) {
            return;
        }

        if (value !== '' && Number(value) > 12) {
            return;
        }

        onStartHourChange(value);
    };

    const handleStartMinuteChange = (value: string) => {
        if (!/^\d{0,2}$/.test(value)) {
            return;
        }

        if (value !== '' && Number(value) > 59) {
            return;
        }

        onStartMinuteChange(value);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <FormField label="Date" htmlFor="event-date" required>
                <Input
                    id="event-date"
                    type="date"
                    value={eventDate}
                    onChange={(e) => {
                        onEventDateChange(e.target.value);
                    }}
                    className="h-10 rounded-xl w-full block bg-background text-primary-text"
                />
            </FormField>

            <FormField label="Start time" htmlFor="event-start-time" required>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <div className="flex h-10 items-center rounded-xl border border-outline bg-background px-3 pr-9 shadow-sm transition-colors focus-within:ring-2 focus-within:ring-primary-blue focus-within:ring-offset-2">
                            <input
                                id="event-start-time"
                                type="text"
                                inputMode="numeric"
                                aria-label="Start hour"
                                placeholder="HH"
                                maxLength={2}
                                value={startHour}
                                onChange={(e) => {
                                    handleStartHourChange(e.target.value);
                                }}
                                onBlur={() => {
                                    if (startHour !== '') {
                                        onStartHourChange(
                                            startHour.padStart(2, '0')
                                        );
                                    }
                                }}
                                className="w-7 bg-transparent text-center text-regular text-primary-text outline-none placeholder:text-secondary-text"
                            />
                            <span className="text-secondary-text">:</span>
                            <input
                                type="text"
                                inputMode="numeric"
                                aria-label="Start minute"
                                placeholder="MM"
                                maxLength={2}
                                value={startMinute}
                                onChange={(e) => {
                                    handleStartMinuteChange(e.target.value);
                                }}
                                onBlur={() => {
                                    if (startMinute !== '') {
                                        onStartMinuteChange(
                                            startMinute.padStart(2, '0')
                                        );
                                    }
                                }}
                                className="w-7 bg-transparent text-center text-regular text-primary-text outline-none placeholder:text-secondary-text"
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
                                    meridiem === option ? 'default' : 'outline'
                                }
                                size="sm"
                                onClick={() => {
                                    onMeridiemChange(option);
                                }}
                                className={cn(
                                    'h-10 rounded-xl px-3 text-tiny',
                                    meridiem !== option &&
                                        'bg-transparent text-secondary-text hover:bg-muted-background hover:text-primary-text'
                                )}
                            >
                                {option}
                            </Button>
                        ))}
                    </div>
                </div>
            </FormField>
        </div>
    );
}

export type { Meridiem };
