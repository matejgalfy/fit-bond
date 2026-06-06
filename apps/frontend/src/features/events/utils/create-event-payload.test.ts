import { describe, test, expect } from 'vitest';
import {
    buildDurationMinutes,
    buildStartTime,
    buildCreateEventPayload,
} from './create-event-payload';

describe('create-event-payload utils', () => {
    describe('buildDurationMinutes', () => {
        test('returns the preset duration when it is non-zero', () => {
            const result = buildDurationMinutes({
                duration: 90,
                customDuration: '2',
                customDurationUnit: 'h',
            });
            expect(result).toBe(90);
        });

        test('computes custom duration in hours', () => {
            const result = buildDurationMinutes({
                duration: 0,
                customDuration: '1.5',
                customDurationUnit: 'h',
            });
            expect(result).toBe(90);
        });

        test('computes custom duration in minutes', () => {
            const result = buildDurationMinutes({
                duration: 0,
                customDuration: '45',
                customDurationUnit: 'min',
            });
            expect(result).toBe(45);
        });

        test('rounds fractional hours to the nearest minute', () => {
            const result = buildDurationMinutes({
                duration: 0,
                customDuration: '1.333',
                customDurationUnit: 'h',
            });
            expect(result).toBe(80);
        });

        test('ignores leading/trailing whitespace in customDuration', () => {
            const result = buildDurationMinutes({
                duration: 0,
                customDuration: '  30  ',
                customDurationUnit: 'min',
            });
            expect(result).toBe(30);
        });
    });

    describe('buildStartTime', () => {
        test('converts 12 AM to midnight (00:00)', () => {
            const result = buildStartTime({
                eventDate: '2026-06-15',
                startHour: '12',
                startMinute: '00',
                meridiem: 'AM',
            });
            expect(result).toBe(new Date('2026-06-15T00:00:00').toISOString());
        });

        test('converts 12 PM to noon (12:00)', () => {
            const result = buildStartTime({
                eventDate: '2026-06-15',
                startHour: '12',
                startMinute: '00',
                meridiem: 'PM',
            });
            expect(result).toBe(new Date('2026-06-15T12:00:00').toISOString());
        });

        test('converts 1 PM to 13:00', () => {
            const result = buildStartTime({
                eventDate: '2026-06-15',
                startHour: '1',
                startMinute: '30',
                meridiem: 'PM',
            });
            expect(result).toBe(new Date('2026-06-15T13:30:00').toISOString());
        });

        test('keeps AM hours unchanged (except 12)', () => {
            const result = buildStartTime({
                eventDate: '2026-06-15',
                startHour: '9',
                startMinute: '05',
                meridiem: 'AM',
            });
            expect(result).toBe(new Date('2026-06-15T09:05:00').toISOString());
        });
    });

    describe('buildCreateEventPayload', () => {
        const baseForm = {
            eventName: '  Florbal tournament  ',
            sportId: 'sport-uuid-1',
            description: 'Great event',
            eventDate: '2026-12-01',
            startHour: '10',
            startMinute: '00',
            duration: 60,
            customDuration: '',
            customDurationUnit: 'min' as const,
            meridiem: 'AM' as const,
            skillLevel: 'beginner' as const,
            capacity: '20',
            coverImageUrl: 'https://example.com/img.jpg',
        };

        const baseLocation = {
            placeId: 'place-1',
            fullAddress: 'Brno, Czech Republic',
            formattedAddress: 'Brno',
            displayName: 'Brno',
            lat: 49.195,
            lng: 16.608,
        };

        test('trims whitespace from event name', () => {
            const payload = buildCreateEventPayload(baseForm, baseLocation);
            expect(payload.name).toBe('Florbal tournament');
        });

        test('omits description when empty', () => {
            const payload = buildCreateEventPayload(
                { ...baseForm, description: '   ' },
                baseLocation
            );
            expect('description' in payload).toBe(false);
        });

        test('includes description when non-empty', () => {
            const payload = buildCreateEventPayload(baseForm, baseLocation);
            expect(payload.description).toBe('Great event');
        });

        test('omits coverImageUrl when empty', () => {
            const payload = buildCreateEventPayload(
                { ...baseForm, coverImageUrl: '' },
                baseLocation
            );
            expect('coverImageUrl' in payload).toBe(false);
        });

        test('maps capacity string to a number', () => {
            const payload = buildCreateEventPayload(baseForm, baseLocation);
            expect(payload.capacity).toBe(20);
        });
    });
});
