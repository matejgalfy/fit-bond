import { useEffect, useState } from 'react';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/components/ui/form-field';
import { LocationCombobox } from '@/components/location-combobox';
import { useUpdateFullProfile } from '../hooks/users';
import { ApiError } from '@/lib/api-error';
import { MultiSportCombobox } from '@/features/sports/components/multi-sport-combobox';
import type { UserProfile } from '../../../../../backend/src/modules/users/users.types';
import type { LocationSuggestion } from '../../../../../backend/src/modules/locations/locations.schema';

interface ProfileEditDialogProps {
    user: UserProfile;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const DEFAULT_RADIUS = 10;

function locationToSuggestion(
    loc: NonNullable<UserProfile['location']>
): LocationSuggestion {
    return {
        placeId: loc.id,
        displayName: loc.fullAddress,
        fullAddress: loc.fullAddress,
        formattedAddress: loc.formattedAddress,
        lat: loc.lat,
        lng: loc.lng,
    };
}

export function ProfileEditDialog({
    user,
    open,
    onOpenChange,
}: ProfileEditDialogProps) {
    const primary = user.location;

    const [name, setName] = useState(user.name);
    const [bio, setBio] = useState(user.bio ?? '');
    const [sportIds, setSportIds] = useState<string[]>(
        user.sports.map((s) => s.id)
    );
    const [location, setLocation] = useState<LocationSuggestion | null>(
        primary ? locationToSuggestion(primary) : null
    );
    const [radius, setRadius] = useState<string>(
        primary ? String(primary.radius) : String(DEFAULT_RADIUS)
    );
    const [error, setError] = useState('');

    const { mutateAsync: updateProfile, isPending } = useUpdateFullProfile(
        user.id
    );

    useEffect(() => {
        if (!open) return;
        setName(user.name);
        setBio(user.bio ?? '');
        setSportIds(user.sports.map((s) => s.id));
        setLocation(primary ? locationToSuggestion(primary) : null);
        setRadius(primary ? String(primary.radius) : String(DEFAULT_RADIUS));
        setError('');
    }, [open, user, primary]);

    const submit = async () => {
        setError('');

        const trimmedName = name.trim();
        if (trimmedName.length === 0) {
            setError('Name is required.');
            return;
        }

        const radiusNum = Number(radius);
        if (
            location &&
            (!Number.isFinite(radiusNum) || radiusNum < 1 || radiusNum > 100)
        ) {
            setError('Radius must be between 1 and 100 km.');
            return;
        }

        try {
            await updateProfile({
                base: {
                    name: trimmedName,
                    bio: bio.trim(),
                },
                sportIds,
                location: location
                    ? {
                          placeId: location.placeId,
                          fullAddress: location.fullAddress,
                          formattedAddress: location.formattedAddress,
                          lat: location.lat,
                          lng: location.lng,
                          radius: radiusNum,
                      }
                    : null,
            });
            onOpenChange(false);
        } catch (err) {
            if (err instanceof ApiError || err instanceof Error) {
                setError(err.message);
                return;
            }
            setError('Failed to save profile. Please try again.');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit profile</DialogTitle>
                    <DialogDescription>
                        Update your name, bio, and preferred location.
                    </DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        void submit();
                    }}
                    className="space-y-3 w-full min-w-0"
                >
                    <FormField label="Name" htmlFor="profile-name" required>
                        <Input
                            id="profile-name"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                            }}
                            maxLength={100}
                            className="h-10 bg-background"
                        />
                    </FormField>

                    <FormField label="Bio" htmlFor="profile-bio">
                        <Textarea
                            id="profile-bio"
                            value={bio}
                            onChange={(e) => {
                                setBio(e.target.value);
                            }}
                            maxLength={500}
                            rows={2}
                            className="bg-background"
                        />
                    </FormField>

                    <FormField label="My sports" htmlFor="profile-sports">
                        <MultiSportCombobox
                            id="profile-sports"
                            values={sportIds}
                            onChange={setSportIds}
                        />
                    </FormField>

                    <FormField
                        label="Preferred location"
                        htmlFor="profile-location"
                    >
                        <LocationCombobox
                            id="profile-location"
                            value={location}
                            onChange={setLocation}
                        />
                    </FormField>

                    <FormField label="Radius (km)" htmlFor="profile-radius">
                        <Input
                            id="profile-radius"
                            type="number"
                            min={1}
                            max={100}
                            value={radius}
                            onChange={(e) => {
                                setRadius(e.target.value);
                            }}
                            disabled={!location}
                            className="h-10 w-full bg-background"
                        />
                    </FormField>

                    {error && (
                        <p className="text-regular text-primary-red">{error}</p>
                    )}

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button
                                type="button"
                                variant="outline"
                                disabled={isPending}
                            >
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? 'Saving...' : 'Save'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
