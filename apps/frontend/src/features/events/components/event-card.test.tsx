import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { EventCard } from './event-card';
import type { Event } from '../types';

function makeEvent(overrides: Partial<Event> = {}): Event {
    const base = {
        id: 'evt-1',
        name: 'Saturday Football Match',
        description: 'Casual game in the park',
        startTime: new Date('2026-06-13T18:30:00Z'),
        duration: 90,
        capacity: 10,
        currentParticipants: 4,
        currentInterested: 7,
        skillLevel: 'beginner' as const,
        coverImageUrl: null,
        cancelledAt: null,
        sport: { id: 'sport-1', name: 'Football' },
        organizer: {
            id: 'user-1',
            name: 'Alice Organizer',
            image: null,
        },
        location: {
            id: 'loc-1',
            formattedAddress: 'Brno, Lužánky',
            fullAddress: 'Lužánky park, Brno, Czechia',
            lat: 49.2,
            lng: 16.6,
        },
    };
    return { ...base, ...overrides } as unknown as Event;
}

describe('EventCard', () => {
    test('renders event name, sport, location and participants', () => {
        render(<EventCard event={makeEvent()} />);

        expect(
            screen.getByRole('heading', { name: 'Saturday Football Match' })
        ).toBeInTheDocument();
        expect(screen.getByText('Football')).toBeInTheDocument();
        expect(screen.getByText('Brno, Lužánky')).toBeInTheDocument();
        expect(screen.getByText('4/10 joined')).toBeInTheDocument();
        expect(screen.getByText('7 interested')).toBeInTheDocument();
    });

    test('renders organizer name and capitalized skill level', () => {
        render(
            <EventCard
                event={makeEvent({
                    skillLevel: 'intermediate' as Event['skillLevel'],
                })}
            />
        );

        expect(screen.getByText('Alice Organizer')).toBeInTheDocument();
        expect(screen.getByText('Intermediate')).toBeInTheDocument();
    });

    test('shows "Full" badge when capacity is reached', () => {
        render(
            <EventCard
                event={makeEvent({ currentParticipants: 10, capacity: 10 })}
            />
        );

        expect(screen.getByText('Full')).toBeInTheDocument();
    });

    test('does not show "Full" badge when there is still room', () => {
        render(<EventCard event={makeEvent()} />);

        expect(screen.queryByText('Full')).not.toBeInTheDocument();
    });

    test('shows "Cancelled" badge when event is cancelled', () => {
        render(
            <EventCard
                event={makeEvent({
                    cancelledAt: new Date('2026-06-10T12:00:00Z'),
                })}
            />
        );

        expect(screen.getByText('Cancelled')).toBeInTheDocument();
    });

    test('renders cover image when coverImageUrl is provided', () => {
        render(
            <EventCard
                event={makeEvent({
                    coverImageUrl: 'https://example.com/cover.jpg',
                })}
            />
        );

        const img = screen.getByRole('img', {
            name: 'Saturday Football Match',
        });
        expect(img).toHaveAttribute('src', 'https://example.com/cover.jpg');
    });
});
