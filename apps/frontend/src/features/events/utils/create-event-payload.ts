import type { CreateEventBody } from '../../../../../backend/src/modules/events/events.schema';
import type { SkillLevel } from '../../../../../backend/src/modules/events/events.types';
import type { LocationSuggestion } from '../../../../../backend/src/modules/locations/locations.schema';
import type {
    CustomDurationUnit,
    Meridiem,
} from '../components/creation/time-and-location/event-time-and-location';
import type { Visibility } from '../components/creation/details/event-details';

export interface CreateEventFormState {
    eventName: string;
    sportId: string;
    description: string;
    eventDate: string;
    startHour: string;
    startMinute: string;
    duration: number;
    customDuration: string;
    customDurationUnit: CustomDurationUnit;
    meridiem: Meridiem;
    skillLevel: SkillLevel;
    visibility: Visibility;
    capacity: string;
    coverImageUrl: string;
}

export function buildStartTime({
    eventDate,
    startHour,
    startMinute,
    meridiem,
}: {
    eventDate: string;
    startHour: string;
    startMinute: string;
    meridiem: Meridiem;
}): string {
    let hour = Number(startHour);

    if (meridiem === 'AM' && hour === 12) {
        hour = 0;
    }

    if (meridiem === 'PM' && hour !== 12) {
        hour += 12;
    }

    return new Date(
        `${eventDate}T${String(hour).padStart(2, '0')}:${startMinute.padStart(2, '0')}:00`
    ).toISOString();
}

export function buildDurationMinutes({
    duration,
    customDuration,
    customDurationUnit,
}: {
    duration: number;
    customDuration: string;
    customDurationUnit: CustomDurationUnit;
}): number {
    if (duration !== 0) {
        return duration;
    }

    const value = Number(customDuration.trim());
    return customDurationUnit === 'h'
        ? Math.round(value * 60)
        : Math.round(value);
}

export function buildCreateEventPayload(
    form: CreateEventFormState,
    location: LocationSuggestion
): CreateEventBody {
    const description = form.description.trim();
    const coverImageUrl = form.coverImageUrl.trim();

    return {
        name: form.eventName.trim(),
        ...(description.length > 0 ? { description } : {}),
        sportId: form.sportId,
        location: {
            placeId: location.placeId,
            fullAddress: location.fullAddress,
            formattedAddress: location.formattedAddress,
            lat: location.lat,
            lng: location.lng,
        },
        skillLevel: form.skillLevel,
        startTime: buildStartTime({
            eventDate: form.eventDate,
            startHour: form.startHour,
            startMinute: form.startMinute,
            meridiem: form.meridiem,
        }),
        duration: buildDurationMinutes({
            duration: form.duration,
            customDuration: form.customDuration,
            customDurationUnit: form.customDurationUnit,
        }),
        capacity: Number(form.capacity),
        isPublic: form.visibility === 'public',
        ...(coverImageUrl.length > 0 ? { coverImageUrl } : {}),
    };
}
