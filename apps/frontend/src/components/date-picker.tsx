import { useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DatePickerProps {
    value: string;
    onChange: (value: string) => void;
    id?: string;
    placeholder?: string;
    required?: boolean;
    clearable?: boolean;
    className?: string;
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function parseDateValue(value: string): Date | null {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return null;
    }

    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(year, month - 1, day);

    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    ) {
        return null;
    }

    return date;
}

function formatDateValue(date: Date): string {
    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0'),
    ].join('-');
}

function formatDisplayDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function buildCalendarDays(month: Date) {
    const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
    const calendarStart = new Date(firstDay);
    calendarStart.setDate(firstDay.getDate() - firstDay.getDay());

    return Array.from({ length: 42 }, (_, index) => {
        const date = new Date(calendarStart);
        date.setDate(calendarStart.getDate() + index);
        return date;
    });
}

function isSameDay(left: Date | null, right: Date) {
    return (
        left?.getFullYear() === right.getFullYear() &&
        left.getMonth() === right.getMonth() &&
        left.getDate() === right.getDate()
    );
}

export function DatePicker({
    value,
    onChange,
    id,
    placeholder = 'Select date',
    required = false,
    clearable = false,
    className,
}: DatePickerProps) {
    const selectedDate = parseDateValue(value);
    const [open, setOpen] = useState(false);
    const [visibleMonth, setVisibleMonth] = useState(
        selectedDate ?? new Date()
    );

    const calendarDays = useMemo(
        () => buildCalendarDays(visibleMonth),
        [visibleMonth]
    );

    const monthLabel = visibleMonth.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
    });

    const showPreviousMonth = () => {
        setVisibleMonth(
            new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1)
        );
    };

    const showNextMonth = () => {
        setVisibleMonth(
            new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1)
        );
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <div className="relative">
                <PopoverTrigger asChild>
                    <Button
                        id={id}
                        type="button"
                        variant="outline"
                        className={cn(
                            'h-10 w-full justify-start rounded-xl bg-surface text-left font-normal text-primary-text shadow-sm hover:bg-surface hover:text-primary-text',
                            !selectedDate && 'text-secondary-text',
                            clearable && selectedDate && 'pr-10',
                            className
                        )}
                        aria-required={required}
                    >
                        <CalendarDays />
                        <span className="truncate">
                            {selectedDate
                                ? formatDisplayDate(selectedDate)
                                : placeholder}
                        </span>
                    </Button>
                </PopoverTrigger>
                {clearable && selectedDate && (
                    <button
                        type="button"
                        aria-label="Clear date"
                        className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-sm p-0.5 text-secondary-text transition-colors hover:text-primary-red"
                        onClick={() => {
                            onChange('');
                            setOpen(false);
                        }}
                    >
                        <X className="size-4" />
                    </button>
                )}
            </div>
            <PopoverContent className="w-auto p-3" align="start">
                <div className="flex items-center justify-between gap-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={showPreviousMonth}
                        aria-label="Previous month"
                    >
                        <ChevronLeft />
                    </Button>
                    <div className="text-small font-semibold text-primary-text">
                        {monthLabel}
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={showNextMonth}
                        aria-label="Next month"
                    >
                        <ChevronRight />
                    </Button>
                </div>

                <div className="mt-3 grid grid-cols-7 gap-1">
                    {WEEKDAYS.map((weekday) => (
                        <div
                            key={weekday}
                            className="flex size-8 items-center justify-center text-tiny font-medium text-secondary-text"
                        >
                            {weekday}
                        </div>
                    ))}
                    {calendarDays.map((date) => {
                        const isSelected = isSameDay(selectedDate, date);
                        const isOutsideMonth =
                            date.getMonth() !== visibleMonth.getMonth();

                        return (
                            <Button
                                key={formatDateValue(date)}
                                type="button"
                                variant={isSelected ? 'default' : 'ghost'}
                                size="icon"
                                className={cn(
                                    'size-8 rounded-md text-tiny font-normal',
                                    isOutsideMonth &&
                                        !isSelected &&
                                        'text-tertiary-text',
                                    !isSelected &&
                                        'hover:bg-soft-blue hover:text-strong-blue'
                                )}
                                onClick={() => {
                                    onChange(formatDateValue(date));
                                    setOpen(false);
                                }}
                            >
                                {date.getDate()}
                            </Button>
                        );
                    })}
                </div>
            </PopoverContent>
        </Popover>
    );
}
