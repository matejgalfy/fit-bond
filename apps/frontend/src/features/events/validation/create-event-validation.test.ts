import { describe, test, expect } from 'vitest';
import { validateCreateEventInput } from './create-event-validation';

describe('validateCreateEventInput', () => {
    const validBaseInput = {
        eventName: 'Floorball tournament',
        sportId: 'sport-1',
        description: 'A great tournament',
        eventDate: '2099-10-10',
        startHour: '10',
        startMinute: '00',
        location: {
            placeId: '1',
            fullAddress: 'Brno',
            formattedAddress: 'Brno',
            displayName: 'Brno',
            lat: 49,
            lng: 16,
        },
        duration: 60,
        customDuration: '',
        customDurationUnit: 'min' as const,
        meridiem: 'AM' as const,
        capacity: '10',
    };

    describe('happy path', () => {
        test('returns null for a fully valid input', () => {
            const result = validateCreateEventInput(validBaseInput);
            expect(result).toBeNull();
        });

        test('returns null when a custom duration in hours is used', () => {
            const result = validateCreateEventInput({
                ...validBaseInput,
                duration: 0,
                customDuration: '6.75',
                customDurationUnit: 'h',
            });
            expect(result).toBeNull();
        });
    });

    describe('missing required fields', () => {
        test('returns the missing-fields message when the name is empty', () => {
            const result = validateCreateEventInput({
                ...validBaseInput,
                eventName: '',
            });
            expect(result).toBe('Please fill in all required fields.');
        });

        test('returns the missing-fields message when the name is only whitespace', () => {
            const result = validateCreateEventInput({
                ...validBaseInput,
                eventName: '   ',
            });
            expect(result).toBe('Please fill in all required fields.');
        });

        test('returns the missing-fields message when sportId is empty', () => {
            const result = validateCreateEventInput({
                ...validBaseInput,
                sportId: '',
            });
            expect(result).toBe('Please fill in all required fields.');
        });

        test('returns the missing-fields message when location is null', () => {
            const result = validateCreateEventInput({
                ...validBaseInput,
                location: null,
            });
            expect(result).toBe('Please fill in all required fields.');
        });

        test('returns the missing-fields message when capacity is empty', () => {
            const result = validateCreateEventInput({
                ...validBaseInput,
                capacity: '',
            });
            expect(result).toBe('Please fill in all required fields.');
        });

        test('returns the missing-fields message when eventDate is empty', () => {
            const result = validateCreateEventInput({
                ...validBaseInput,
                eventDate: '',
            });
            expect(result).toBe('Please fill in all required fields.');
        });

        test('returns the missing-fields message when customDuration is empty and duration is 0', () => {
            const result = validateCreateEventInput({
                ...validBaseInput,
                duration: 0,
                customDuration: '',
            });
            expect(result).toBe('Please fill in all required fields.');
        });

        test('returns the missing-fields message when location coordinates are not finite', () => {
            const result = validateCreateEventInput({
                ...validBaseInput,
                location: {
                    ...validBaseInput.location,
                    lat: Number.NaN,
                },
            });
            expect(result).toBe('Please fill in all required fields.');
        });
    });

    describe('basics validation', () => {
        test('rejects an event name longer than 200 characters', () => {
            const result = validateCreateEventInput({
                ...validBaseInput,
                eventName: 'a'.repeat(201),
            });
            expect(result).toBe('Event name must be 200 characters or less.');
        });

        test('accepts an event name with exactly 200 characters', () => {
            const result = validateCreateEventInput({
                ...validBaseInput,
                eventName: 'a'.repeat(200),
            });
            expect(result).toBeNull();
        });

        test('rejects a description longer than 2000 characters', () => {
            const result = validateCreateEventInput({
                ...validBaseInput,
                description: 'x'.repeat(2001),
            });
            expect(result).toBe('Description must be 2000 characters or less.');
        });
    });

    describe('time and location validation', () => {
        test('rejects a malformed date', () => {
            const result = validateCreateEventInput({
                ...validBaseInput,
                eventDate: '2026/10/10',
            });
            expect(result).toBe('Date must be in a valid format.');
        });

        test('rejects an impossible calendar date (Feb 30)', () => {
            const result = validateCreateEventInput({
                ...validBaseInput,
                eventDate: '2099-02-30',
            });
            expect(result).toBe('Date must be in a valid format.');
        });

        test('rejects a start time in the past', () => {
            const result = validateCreateEventInput({
                ...validBaseInput,
                eventDate: '2000-01-01',
            });
            expect(result).toBe('Event start time must be in the future.');
        });

        test('rejects a duration shorter than 15 minutes', () => {
            const result = validateCreateEventInput({
                ...validBaseInput,
                duration: 0,
                customDuration: '10',
                customDurationUnit: 'min',
            });
            expect(result).toBe('Duration must be between 15 and 480 minutes.');
        });

        test('rejects a duration longer than 480 minutes', () => {
            const result = validateCreateEventInput({
                ...validBaseInput,
                duration: 0,
                customDuration: '500',
                customDurationUnit: 'min',
            });
            expect(result).toBe('Duration must be between 15 and 480 minutes.');
        });

        test('rejects a non-numeric custom duration', () => {
            const result = validateCreateEventInput({
                ...validBaseInput,
                duration: 0,
                customDuration: 'abc',
                customDurationUnit: 'min',
            });
            expect(result).toBe('Duration must be between 15 and 480 minutes.');
        });
    });

    describe('details validation', () => {
        test('rejects a non-numeric capacity', () => {
            const result = validateCreateEventInput({
                ...validBaseInput,
                capacity: 'abc',
            });
            expect(result).toBe(
                'Capacity must be a whole non-negative number.'
            );
        });

        test('rejects a fractional capacity', () => {
            const result = validateCreateEventInput({
                ...validBaseInput,
                capacity: '5.5',
            });
            expect(result).toBe(
                'Capacity must be a whole non-negative number.'
            );
        });

        test('rejects a negative capacity', () => {
            const result = validateCreateEventInput({
                ...validBaseInput,
                capacity: '-3',
            });
            expect(result).toBe(
                'Capacity must be a whole non-negative number.'
            );
        });

        test('rejects a capacity below the lower bound', () => {
            const result = validateCreateEventInput({
                ...validBaseInput,
                capacity: '1',
            });
            expect(result).toBe('Capacity must be between 2 and 200.');
        });

        test('rejects a capacity above the upper bound', () => {
            const result = validateCreateEventInput({
                ...validBaseInput,
                capacity: '201',
            });
            expect(result).toBe('Capacity must be between 2 and 200.');
        });

        test('accepts a capacity at the lower bound (2)', () => {
            const result = validateCreateEventInput({
                ...validBaseInput,
                capacity: '2',
            });
            expect(result).toBeNull();
        });

        test('accepts a capacity at the upper bound (200)', () => {
            const result = validateCreateEventInput({
                ...validBaseInput,
                capacity: '200',
            });
            expect(result).toBeNull();
        });
    });
});
