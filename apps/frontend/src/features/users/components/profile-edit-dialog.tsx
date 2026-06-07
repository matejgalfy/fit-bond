import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { LocationCombobox } from '@/components/location-combobox';
import { useUpdateProfile } from '../hooks/use-users';
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

const profileEditSchema = z
    .object({
        name: z.string().trim().min(1, 'Name is required.').max(100),
        bio: z.string().trim().max(500),
        sportIds: z.array(z.string()),
        location: z.custom<LocationSuggestion | null>(),
        radius: z.string(),
    })
    .superRefine((values, ctx) => {
        if (!values.location) {
            return;
        }

        const radiusNum = Number(values.radius);
        if (!Number.isFinite(radiusNum) || radiusNum < 1 || radiusNum > 100) {
            ctx.addIssue({
                code: 'custom',
                path: ['radius'],
                message: 'Radius must be between 1 and 100 km.',
            });
        }
    });

type ProfileEditValues = z.infer<typeof profileEditSchema>;

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

function ProfileEditForm({
    user,
    onOpenChange,
}: {
    user: UserProfile;
    onOpenChange: (open: boolean) => void;
}) {
    const primary = user.location;

    const form = useForm<ProfileEditValues>({
        resolver: zodResolver(profileEditSchema),
        defaultValues: {
            name: user.name,
            bio: user.bio ?? '',
            sportIds: user.sports.map((s) => s.id),
            location: primary ? locationToSuggestion(primary) : null,
            radius: primary ? String(primary.radius) : String(DEFAULT_RADIUS),
        },
    });

    const { mutateAsync: updateProfile, isPending } = useUpdateProfile(user.id);

    const location = form.watch('location');

    const onSubmit = async (values: ProfileEditValues) => {
        try {
            await updateProfile({
                base: {
                    name: values.name,
                    bio: values.bio,
                },
                sportIds: values.sportIds,
                location: values.location
                    ? {
                          placeId: values.location.placeId,
                          fullAddress: values.location.fullAddress,
                          formattedAddress: values.location.formattedAddress,
                          lat: values.location.lat,
                          lng: values.location.lng,
                          radius: Number(values.radius),
                      }
                    : null,
            });
            onOpenChange(false);
        } catch (err) {
            form.setError('root', {
                message:
                    err instanceof ApiError || err instanceof Error
                        ? err.message
                        : 'Failed to save profile. Please try again.',
            });
        }
    };

    const rootError = form.formState.errors.root?.message;

    return (
        <Form {...form}>
            <form
                onSubmit={(e) => {
                    void form.handleSubmit(onSubmit)(e);
                }}
                className="space-y-3 w-full min-w-0"
            >
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                Name
                                <span className="text-primary-red">*</span>
                            </FormLabel>
                            <FormControl>
                                <Input
                                    maxLength={100}
                                    className="h-10 bg-background"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Bio</FormLabel>
                            <FormControl>
                                <Textarea
                                    maxLength={500}
                                    rows={2}
                                    className="bg-background"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="sportIds"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>My sports</FormLabel>
                            <FormControl>
                                <MultiSportCombobox
                                    values={field.value}
                                    onChange={field.onChange}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Preferred location</FormLabel>
                            <FormControl>
                                <LocationCombobox
                                    value={field.value}
                                    onChange={field.onChange}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="radius"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Radius (km)</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    min={1}
                                    max={100}
                                    disabled={!location}
                                    className="h-10 w-full bg-background"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {rootError && (
                    <p className="text-regular text-primary-red">{rootError}</p>
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
        </Form>
    );
}

export function ProfileEditDialog({
    user,
    open,
    onOpenChange,
}: ProfileEditDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit profile</DialogTitle>
                    <DialogDescription>
                        Update your name, bio, and preferred location.
                    </DialogDescription>
                </DialogHeader>

                <ProfileEditForm user={user} onOpenChange={onOpenChange} />
            </DialogContent>
        </Dialog>
    );
}
