import { z } from 'zod';
import type { LocationSuggestion } from '../../../../../backend/src/modules/locations/locations.schema';
import type { SkillLevel } from '../../../../../backend/src/modules/events/events.types';
import type {
    CustomDurationUnit,
    Meridiem,
} from '../components/creation/time-and-location/event-time-and-location';

const isWholeNumber = (value: string) => /^\d+$/.test(value.trim());
const isNonNegativeDecimal = (value: string) =>
    /^(?:\d+|\d+\.\d+)$/.test(value.trim());

const isValidDate = (value: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return false;
    }

    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(`${value}T00:00:00`);
    return (
        !Number.isNaN(date.getTime()) &&
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
    );
};

const resolveDurationMinutes = (
    duration: number,
    customDuration: string,
    customDurationUnit: CustomDurationUnit
) => {
    if (duration !== 0) {
        return duration;
    }

    const normalized = customDuration.trim();
    const isValid =
        customDurationUnit === 'h'
            ? isNonNegativeDecimal(normalized)
            : isWholeNumber(normalized);

    if (!isValid) {
        return null;
    }

    const value = Number(normalized);
    return customDurationUnit === 'h' ? value * 60 : value;
};

const resolveStartTime = (
    eventDate: string,
    startHour: string,
    startMinute: string,
    meridiem: Meridiem
) => {
    let hour = Number(startHour);

    if (meridiem === 'AM' && hour === 12) {
        hour = 0;
    }

    if (meridiem === 'PM' && hour !== 12) {
        hour += 12;
    }

    return new Date(
        `${eventDate}T${String(hour).padStart(2, '0')}:${startMinute}:00`
    );
};

const isLocationValid = (location: LocationSuggestion | null) =>
    location !== null &&
    Number.isFinite(location.lat) &&
    Number.isFinite(location.lng);

export const eventFormSchema = z
    .object({
        eventName: z.string(),
        sportId: z.string(),
        description: z.string(),
        eventDate: z.string(),
        startHour: z.string(),
        startMinute: z.string(),
        location: z.custom<LocationSuggestion | null>(),
        duration: z.number(),
        customDuration: z.string(),
        customDurationUnit: z.custom<CustomDurationUnit>(),
        meridiem: z.custom<Meridiem>(),
        skillLevel: z.custom<SkillLevel>(),
        capacity: z.string(),
        coverImageUrl: z.string(),
    })
    .superRefine((values, ctx) => {
        // Basics
        if (!values.eventName.trim()) {
            ctx.addIssue({
                code: 'custom',
                path: ['eventName'],
                message: 'Event name is required.',
            });
        } else if (values.eventName.trim().length > 200) {
            ctx.addIssue({
                code: 'custom',
                path: ['eventName'],
                message: 'Event name must be 200 characters or less.',
            });
        }

        if (!values.sportId.trim()) {
            ctx.addIssue({
                code: 'custom',
                path: ['sportId'],
                message: 'Please select a sport.',
            });
        }

        if (values.description.length > 2000) {
            ctx.addIssue({
                code: 'custom',
                path: ['description'],
                message: 'Description must be 2000 characters or less.',
            });
        }

        // Date
        if (!values.eventDate.trim()) {
            ctx.addIssue({
                code: 'custom',
                path: ['eventDate'],
                message: 'Date is required.',
            });
        } else if (!isValidDate(values.eventDate)) {
            ctx.addIssue({
                code: 'custom',
                path: ['eventDate'],
                message: 'Date must be in a valid format.',
            });
        }

        // Start time (required + must be in the future)
        if (!values.startHour.trim() || !values.startMinute.trim()) {
            ctx.addIssue({
                code: 'custom',
                path: ['startHour'],
                message: 'Start time is required.',
            });
        } else if (
            isValidDate(values.eventDate) &&
            resolveStartTime(
                values.eventDate,
                values.startHour,
                values.startMinute,
                values.meridiem
            ) <= new Date()
        ) {
            ctx.addIssue({
                code: 'custom',
                path: ['startHour'],
                message: 'Event start time must be in the future.',
            });
        }

        // Duration
        if (values.duration === 0 && !values.customDuration.trim()) {
            ctx.addIssue({
                code: 'custom',
                path: ['customDuration'],
                message: 'Please enter a duration.',
            });
        } else {
            const minutes = resolveDurationMinutes(
                values.duration,
                values.customDuration,
                values.customDurationUnit
            );

            if (minutes === null || minutes < 15 || minutes > 480) {
                ctx.addIssue({
                    code: 'custom',
                    path: ['customDuration'],
                    message: 'Duration must be between 15 and 480 minutes.',
                });
            }
        }

        // Location
        if (!isLocationValid(values.location)) {
            ctx.addIssue({
                code: 'custom',
                path: ['location'],
                message: 'Please select a location.',
            });
        }

        // Capacity
        if (!values.capacity.trim()) {
            ctx.addIssue({
                code: 'custom',
                path: ['capacity'],
                message: 'Capacity is required.',
            });
        } else if (!isWholeNumber(values.capacity)) {
            ctx.addIssue({
                code: 'custom',
                path: ['capacity'],
                message: 'Capacity must be a whole non-negative number.',
            });
        } else {
            const capacity = Number(values.capacity);
            if (capacity < 2 || capacity > 200) {
                ctx.addIssue({
                    code: 'custom',
                    path: ['capacity'],
                    message: 'Capacity must be between 2 and 200.',
                });
            }
        }
    });

export type EventFormValues = z.infer<typeof eventFormSchema>;
