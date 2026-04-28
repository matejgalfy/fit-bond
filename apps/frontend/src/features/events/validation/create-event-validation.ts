import type {
    CustomDurationUnit,
    Meridiem,
} from '../components/creation/time-and-location/event-time-and-location';
import {
    hasMissingBasicsRequiredFields,
    validateCreateEventBasics,
} from './basics-validation';
import {
    hasMissingDetailsRequiredFields,
    validateCreateEventDetails,
} from './details-validation';
import {
    hasMissingTimeAndLocationRequiredFields,
    validateCreateEventTimeAndLocation,
} from './time-and-location-validation';

interface CreateEventValidationInput {
    eventName: string;
    sportId: string;
    description: string;
    eventDate: string;
    startHour: string;
    startMinute: string;
    location: string;
    duration: number;
    customDuration: string;
    customDurationUnit: CustomDurationUnit;
    meridiem: Meridiem;
    capacity: string;
}

export function validateCreateEventInput(input: CreateEventValidationInput) {
    if (
        hasMissingBasicsRequiredFields(input) ||
        hasMissingTimeAndLocationRequiredFields(input) ||
        hasMissingDetailsRequiredFields(input)
    ) {
        return 'Please fill in all required fields.';
    }

    return (
        validateCreateEventBasics(input) ??
        validateCreateEventTimeAndLocation(input) ??
        validateCreateEventDetails(input)
    );
}
