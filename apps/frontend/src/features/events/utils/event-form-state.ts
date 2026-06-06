import type { LocationSuggestion } from '../../../../../backend/src/modules/locations/locations.schema';
import type { Event } from '../types';
import type { CreateEventFormState } from './create-event-payload';

const PRESET_DURATIONS = new Set([30, 60, 90, 120, 180]);

type EditableLocation = Event['location'] & {
    id: string;
    fullAddress?: string | null;
    lat?: string | number;
    lng?: string | number;
};

function formatDateInputValue(date: Date) {
    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0'),
    ].join('-');
}

function getTimeFields(date: Date) {
    const hour24 = date.getHours();
    const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;

    return {
        startHour: String(hour12).padStart(2, '0'),
        startMinute: String(date.getMinutes()).padStart(2, '0'),
        meridiem: hour24 >= 12 ? ('PM' as const) : ('AM' as const),
    };
}

function getDurationFields(duration: number) {
    if (PRESET_DURATIONS.has(duration)) {
        return {
            duration,
            customDuration: '',
            customDurationUnit: 'min' as const,
        };
    }

    return {
        duration: 0,
        customDuration: String(duration),
        customDurationUnit: 'min' as const,
    };
}

export function buildEventLocationSuggestion(event: Event): LocationSuggestion {
    const location = event.location as EditableLocation;

    return {
        placeId: location.id,
        displayName: location.formattedAddress,
        fullAddress: location.fullAddress ?? location.formattedAddress,
        formattedAddress: location.formattedAddress,
        lat: Number(location.lat),
        lng: Number(location.lng),
    };
}

export function buildEventFormState(event: Event): CreateEventFormState {
    const startTime = new Date(event.startTime);
    const timeFields = getTimeFields(startTime);
    const durationFields = getDurationFields(event.duration);

    return {
        eventName: event.name,
        sportId: event.sport.id,
        description: event.description ?? '',
        eventDate: formatDateInputValue(startTime),
        startHour: timeFields.startHour,
        startMinute: timeFields.startMinute,
        duration: durationFields.duration,
        customDuration: durationFields.customDuration,
        customDurationUnit: durationFields.customDurationUnit,
        meridiem: timeFields.meridiem,
        skillLevel: event.skillLevel,
        capacity: String(event.capacity),
        coverImageUrl: event.coverImageUrl ?? '',
    };
}
