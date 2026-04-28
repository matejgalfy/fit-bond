export interface CreateEventBasicsValidationInput {
    eventName: string;
    sportId: string;
    description: string;
}

export function hasMissingBasicsRequiredFields({
    eventName,
    sportId,
}: CreateEventBasicsValidationInput) {
    return !eventName.trim() || !sportId.trim();
}

export function validateCreateEventBasics({
    eventName,
    description,
}: CreateEventBasicsValidationInput) {
    if (eventName.trim().length > 200) {
        return 'Event name must be 200 characters or less.';
    }

    if (description.length > 2000) {
        return 'Description must be 2000 characters or less.';
    }

    return null;
}
