import { describe, test, expect } from 'vitest';
import { eventFormSchema, type EventFormValues } from './event-form-schema';
import type { LocationSuggestion } from '../../../../../backend/src/modules/locations/locations.schema';

const validLocation: LocationSuggestion = {
    placeId: '1',
    displayName: 'Brno',
    fullAddress: 'Brno',
    formattedAddress: 'Brno',
    lat: 49,
    lng: 16,
};

const validBaseInput: EventFormValues = {
    eventName: 'Floorball tournament',
    sportId: 'sport-1',
    description: 'A great tournament',
    eventDate: '2099-10-10',
    startHour: '10',
    startMinute: '00',
    location: validLocation,
    duration: 60,
    customDuration: '',
    customDurationUnit: 'min',
    meridiem: 'AM',
    skillLevel: 'beginner',
    capacity: '10',
    coverImageUrl: '',
};

const messagesFor = (input: EventFormValues): string[] => {
    const result = eventFormSchema.safeParse(input);
    return result.success ? [] : result.error.issues.map((i) => i.message);
};

describe('eventFormSchema', () => {
    describe('happy path', () => {
        test('accepts a fully valid input', () => {
            expect(eventFormSchema.safeParse(validBaseInput).success).toBe(
                true
            );
        });

        test('accepts a custom duration in hours', () => {
            expect(
                eventFormSchema.safeParse({
                    ...validBaseInput,
                    duration: 0,
                    customDuration: '6.75',
                    customDurationUnit: 'h',
                }).success
            ).toBe(true);
        });
    });

    describe('required fields', () => {
        test('rejects an empty name', () => {
            expect(messagesFor({ ...validBaseInput, eventName: '' })).toContain(
                'Event name is required.'
            );
        });

        test('rejects a whitespace-only name', () => {
            expect(
                messagesFor({ ...validBaseInput, eventName: '   ' })
            ).toContain('Event name is required.');
        });

        test('rejects an empty sport', () => {
            expect(messagesFor({ ...validBaseInput, sportId: '' })).toContain(
                'Please select a sport.'
            );
        });

        test('rejects a null location', () => {
            expect(
                messagesFor({ ...validBaseInput, location: null })
            ).toContain('Please select a location.');
        });

        test('rejects a location with non-finite coordinates', () => {
            expect(
                messagesFor({
                    ...validBaseInput,
                    location: { ...validLocation, lat: Number.NaN },
                })
            ).toContain('Please select a location.');
        });

        test('rejects an empty capacity', () => {
            expect(messagesFor({ ...validBaseInput, capacity: '' })).toContain(
                'Capacity is required.'
            );
        });

        test('rejects an empty date', () => {
            expect(messagesFor({ ...validBaseInput, eventDate: '' })).toContain(
                'Date is required.'
            );
        });

        test('rejects an empty custom duration when "Custom" is selected', () => {
            expect(
                messagesFor({
                    ...validBaseInput,
                    duration: 0,
                    customDuration: '',
                })
            ).toContain('Please enter a duration.');
        });
    });

    describe('basics', () => {
        test('rejects a name longer than 200 characters', () => {
            expect(
                messagesFor({ ...validBaseInput, eventName: 'a'.repeat(201) })
            ).toContain('Event name must be 200 characters or less.');
        });

        test('accepts a name with exactly 200 characters', () => {
            expect(
                eventFormSchema.safeParse({
                    ...validBaseInput,
                    eventName: 'a'.repeat(200),
                }).success
            ).toBe(true);
        });

        test('rejects a description longer than 2000 characters', () => {
            expect(
                messagesFor({
                    ...validBaseInput,
                    description: 'x'.repeat(2001),
                })
            ).toContain('Description must be 2000 characters or less.');
        });
    });

    describe('time and location', () => {
        test('rejects a malformed date', () => {
            expect(
                messagesFor({ ...validBaseInput, eventDate: '2026/10/10' })
            ).toContain('Date must be in a valid format.');
        });

        test('rejects an impossible calendar date (Feb 30)', () => {
            expect(
                messagesFor({ ...validBaseInput, eventDate: '2099-02-30' })
            ).toContain('Date must be in a valid format.');
        });

        test('rejects a start time in the past', () => {
            expect(
                messagesFor({ ...validBaseInput, eventDate: '2000-01-01' })
            ).toContain('Event start time must be in the future.');
        });

        test('rejects a duration shorter than 15 minutes', () => {
            expect(
                messagesFor({
                    ...validBaseInput,
                    duration: 0,
                    customDuration: '10',
                    customDurationUnit: 'min',
                })
            ).toContain('Duration must be between 15 and 480 minutes.');
        });

        test('rejects a duration longer than 480 minutes', () => {
            expect(
                messagesFor({
                    ...validBaseInput,
                    duration: 0,
                    customDuration: '500',
                    customDurationUnit: 'min',
                })
            ).toContain('Duration must be between 15 and 480 minutes.');
        });

        test('rejects a non-numeric custom duration', () => {
            expect(
                messagesFor({
                    ...validBaseInput,
                    duration: 0,
                    customDuration: 'abc',
                    customDurationUnit: 'min',
                })
            ).toContain('Duration must be between 15 and 480 minutes.');
        });
    });

    describe('capacity', () => {
        test('rejects a non-numeric capacity', () => {
            expect(
                messagesFor({ ...validBaseInput, capacity: 'abc' })
            ).toContain('Capacity must be a whole non-negative number.');
        });

        test('rejects a fractional capacity', () => {
            expect(
                messagesFor({ ...validBaseInput, capacity: '5.5' })
            ).toContain('Capacity must be a whole non-negative number.');
        });

        test('rejects a negative capacity', () => {
            expect(
                messagesFor({ ...validBaseInput, capacity: '-3' })
            ).toContain('Capacity must be a whole non-negative number.');
        });

        test('rejects a capacity below the lower bound', () => {
            expect(messagesFor({ ...validBaseInput, capacity: '1' })).toContain(
                'Capacity must be between 2 and 200.'
            );
        });

        test('rejects a capacity above the upper bound', () => {
            expect(
                messagesFor({ ...validBaseInput, capacity: '201' })
            ).toContain('Capacity must be between 2 and 200.');
        });

        test('accepts a capacity at the lower bound (2)', () => {
            expect(
                eventFormSchema.safeParse({ ...validBaseInput, capacity: '2' })
                    .success
            ).toBe(true);
        });

        test('accepts a capacity at the upper bound (200)', () => {
            expect(
                eventFormSchema.safeParse({
                    ...validBaseInput,
                    capacity: '200',
                }).success
            ).toBe(true);
        });
    });
});
