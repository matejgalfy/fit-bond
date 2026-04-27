import type {
    CustomDurationUnit,
    Meridiem,
} from '../components/creation/time-and-location/event-time-and-location';

export interface CreateEventTimeAndLocationValidationInput {
    eventDate: string;
    startHour: string;
    startMinute: string;
    location: string;
    duration: number;
    customDuration: string;
    customDurationUnit: CustomDurationUnit;
    meridiem: Meridiem;
}

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

const getDurationInMinutes = (
    duration: number,
    customDuration: string,
    customDurationUnit: CustomDurationUnit
) => {
    if (duration !== 0) {
        return duration;
    }

    const normalizedCustomDuration = customDuration.trim();
    const isValidCustomDuration =
        customDurationUnit === 'h'
            ? isNonNegativeDecimal(normalizedCustomDuration)
            : isWholeNumber(normalizedCustomDuration);

    if (!isValidCustomDuration) {
        return null;
    }

    const customDurationValue = Number(normalizedCustomDuration);
    return customDurationUnit === 'h'
        ? customDurationValue * 60
        : customDurationValue;
};

const getStartTime = (
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

export function hasMissingTimeAndLocationRequiredFields({
    eventDate,
    startHour,
    startMinute,
    location,
    duration,
    customDuration,
}: CreateEventTimeAndLocationValidationInput) {
    return (
        !eventDate.trim() ||
        !startHour.trim() ||
        !startMinute.trim() ||
        !location.trim() ||
        (duration === 0 && !customDuration.trim())
    );
}

export function validateCreateEventTimeAndLocation({
    eventDate,
    startHour,
    startMinute,
    duration,
    customDuration,
    customDurationUnit,
    meridiem,
}: CreateEventTimeAndLocationValidationInput) {
    if (!isValidDate(eventDate)) {
        return 'Date must be in a valid format.';
    }

    if (
        getStartTime(eventDate, startHour, startMinute, meridiem) <= new Date()
    ) {
        return 'Event start time must be in the future.';
    }

    const durationInMinutes = getDurationInMinutes(
        duration,
        customDuration,
        customDurationUnit
    );

    if (
        durationInMinutes === null ||
        durationInMinutes < 15 ||
        durationInMinutes > 480
    ) {
        return 'Duration must be between 15 and 480 minutes.';
    }

    return null;
}
