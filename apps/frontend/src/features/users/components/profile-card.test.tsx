import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import type { UserProfile } from '../../../../../backend/src/modules/users/users.types';

const mutateMock = vi.fn();

vi.mock('../hooks/users', () => ({
    useUpdateProfile: () => ({ mutate: mutateMock }),
}));

vi.mock('./profile-edit-dialog', () => ({
    ProfileEditDialog: () => null,
}));

vi.mock('@/components/ui/image-upload', () => ({
    ImageUpload: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="image-upload">{children}</div>
    ),
}));

import { ProfileCard } from './profile-card';

function makeUser(overrides: Partial<UserProfile> = {}): UserProfile {
    const base: UserProfile = {
        id: 'user-1',
        name: 'Alice Example',
        bio: 'I love football',
        image: null,
        sports: [
            { id: '11111111-1111-1111-1111-111111111111', name: 'Football' },
            { id: '22222222-2222-2222-2222-222222222222', name: 'Tennis' },
        ],
        location: {
            id: 'loc-1',
            fullAddress: 'Brno, Czechia',
            formattedAddress: 'Brno',
            lat: 49.2,
            lng: 16.6,
            radius: 10,
        },
    };
    return { ...base, ...overrides };
}

describe('ProfileCard', () => {
    beforeEach(() => {
        mutateMock.mockReset();
    });

    test('renders user name and bio', () => {
        render(<ProfileCard user={makeUser()} isOwner={false} />);

        expect(
            screen.getByRole('heading', { name: 'Alice Example' })
        ).toBeInTheDocument();
        expect(screen.getByText('I love football')).toBeInTheDocument();
    });

    test('falls back to placeholder when bio is missing', () => {
        render(<ProfileCard user={makeUser({ bio: null })} isOwner={false} />);

        expect(screen.getByText('No bio yet.')).toBeInTheDocument();
    });

    test('renders preferred sports', () => {
        render(<ProfileCard user={makeUser()} isOwner={false} />);

        expect(screen.getByText('Football')).toBeInTheDocument();
        expect(screen.getByText('Tennis')).toBeInTheDocument();
    });

    test('renders preferred location with radius', () => {
        render(<ProfileCard user={makeUser()} isOwner={false} />);

        expect(screen.getByText(/Brno · 10 km radius/)).toBeInTheDocument();
    });

    test('renders Edit Profile and Log Out buttons only when isOwner', () => {
        render(<ProfileCard user={makeUser()} isOwner={true} />);

        expect(
            screen.getByRole('button', { name: /Edit Profile/i })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: /Log Out/i })
        ).toBeInTheDocument();
    });

    test('does NOT render owner-only buttons when isOwner is false', () => {
        render(<ProfileCard user={makeUser()} isOwner={false} />);

        expect(
            screen.queryByRole('button', { name: /Edit Profile/i })
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole('button', { name: /Log Out/i })
        ).not.toBeInTheDocument();
    });

    test('renders ImageUpload wrapper around avatar only when isOwner', () => {
        const { rerender } = render(
            <ProfileCard user={makeUser()} isOwner={true} />
        );
        expect(screen.getByTestId('image-upload')).toBeInTheDocument();

        rerender(<ProfileCard user={makeUser()} isOwner={false} />);
        expect(screen.queryByTestId('image-upload')).not.toBeInTheDocument();
    });
});
