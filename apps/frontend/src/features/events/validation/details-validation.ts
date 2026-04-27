export interface CreateEventDetailsValidationInput {
    capacity: string;
}

const isWholeNumber = (value: string) => /^\d+$/.test(value.trim());

export function hasMissingDetailsRequiredFields({
    capacity,
}: CreateEventDetailsValidationInput) {
    return !capacity.trim();
}

export function validateCreateEventDetails({
    capacity,
}: CreateEventDetailsValidationInput) {
    if (!isWholeNumber(capacity)) {
        return 'Capacity must be a whole non-negative number.';
    }

    const capacityValue = Number(capacity);

    if (capacityValue < 2 || capacityValue > 200) {
        return 'Capacity must be between 2 and 200.';
    }

    return null;
}
