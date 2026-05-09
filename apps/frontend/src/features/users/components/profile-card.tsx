import { useState } from 'react';
import type { UserProfile } from '../../../../../backend/src/modules/users/users.types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, LogOut, MapPin } from 'lucide-react';
import { UserAvatar } from '@/components/ui/user-avatar';
import { ImageUpload } from '@/components/ui/image-upload';
import { useUpdateFullProfile } from '../hooks/users';
import { ProfileEditDialog } from './profile-edit-dialog';

interface ProfileCardProps {
    user: UserProfile;
    isOwner?: boolean;
    onLogout?: () => void | Promise<void>;
    isLoggingOut?: boolean;
    logoutError?: string;
}

export function ProfileCard({
    user,
    isOwner = true,
    onLogout,
    isLoggingOut = false,
    logoutError,
}: ProfileCardProps) {
    const primaryLocation = user.location;

    const { mutate: updateProfile } = useUpdateFullProfile(user.id);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [editOpen, setEditOpen] = useState(false);

    function handleAvatarUpload(url: string) {
        updateProfile({ base: { profilePictureUrl: url } });
    }

    return (
        <Card className="w-full max-w-2xl border-outline shadow-sm bg-surface rounded-3xl p-6">
            <CardContent className="p-0 space-y-8">
                {/* Upper part: Avatar and Info */}
                <div className="flex items-start gap-6">
                    <div className="relative">
                        {isOwner ? (
                            <ImageUpload
                                currentUrl={user.image}
                                onUpload={handleAvatarUpload}
                                onPreview={setAvatarPreview}
                                className="rounded-full"
                            >
                                <div className="relative">
                                    <UserAvatar
                                        name={user.name}
                                        imageUrl={avatarPreview ?? user.image}
                                        size={96}
                                    />
                                    <div className="absolute cursor-pointer bottom-0 right-0 p-1.5 bg-background rounded-full border border-outline shadow-sm hover:bg-soft-blue transition-colors">
                                        <Pencil className="w-4 h-4 text-primary-blue" />
                                    </div>
                                </div>
                            </ImageUpload>
                        ) : (
                            <UserAvatar
                                name={user.name}
                                imageUrl={user.image}
                                size={96}
                            />
                        )}
                    </div>

                    <div className="space-y-1 py-1">
                        <h1 className="text-heading font-bold text-primary-text">
                            {user.name}
                        </h1>
                        <p className="text-secondary-text text-subheading leading-relaxed max-w-md">
                            {user.bio ?? 'No bio yet.'}
                        </p>
                    </div>
                </div>

                {/* Buttons */}
                {isOwner && (
                    <div className="flex flex-wrap gap-3">
                        <Button
                            variant="outline"
                            className="rounded-xl border-primary-blue text-primary-blue hover:bg-primary-blue/10 hover:text-primary-blue px-6 font-semibold"
                            onClick={() => {
                                setEditOpen(true);
                            }}
                        >
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit Profile
                        </Button>
                        <Button
                            variant="outline"
                            className="rounded-xl border-primary-red text-primary-red hover:bg-primary-red/10 hover:text-primary-red px-6 font-semibold"
                            onClick={() => {
                                void onLogout?.();
                            }}
                            disabled={isLoggingOut || !onLogout}
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            {isLoggingOut ? 'Logging out...' : 'Log Out'}
                        </Button>
                        {logoutError && (
                            <p className="basis-full text-regular text-primary-red">
                                {logoutError}
                            </p>
                        )}
                    </div>
                )}

                {/* Sports */}
                <div className="space-y-3">
                    <h3 className="text-regular font-semibold text-secondary-text uppercase tracking-wider">
                        Preferred Sports
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {user.sports.map((sport) => (
                            <div
                                key={sport.id}
                                className="px-4 py-1.5 rounded-full bg-soft-orange text-strong-orange font-bold text-regular"
                            >
                                {sport.name}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Locations */}
                <div className="space-y-3">
                    <h3 className="text-regular font-semibold text-secondary-text uppercase tracking-wider">
                        Preferred Location
                    </h3>
                    {primaryLocation && (
                        <div className="inline-flex items-center px-3 py-1.5 rounded-xl bg-soft-blue font-semibold text-regular gap-2">
                            <MapPin className="w-4 h-4 text-strong-blue" />
                            <span className="text-primary-text">
                                {primaryLocation.formattedAddress} ·{' '}
                                {primaryLocation.radius} km radius
                            </span>
                        </div>
                    )}
                </div>
            </CardContent>
            {isOwner && (
                <ProfileEditDialog
                    user={user}
                    open={editOpen}
                    onOpenChange={setEditOpen}
                />
            )}
        </Card>
    );
}
