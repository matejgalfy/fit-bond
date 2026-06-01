import type { ReactNode } from 'react';
import { useState } from 'react';
import type { UserProfile } from '../../../../../backend/src/modules/users/users.types';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Pencil, MapPin } from 'lucide-react';
import { UserAvatar } from '@/components/ui/user-avatar';
import { ImageUpload } from '@/components/ui/image-upload';

interface ProfileCardProps {
    user: UserProfile;
    onAvatarUpload?: (url: string) => void;
    children?: ReactNode;
}

export function ProfileCard({
    user,
    onAvatarUpload,
    children,
}: ProfileCardProps) {
    const primaryLocation = user.location;
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    const avatar = (
        <UserAvatar
            name={user.name}
            imageUrl={avatarPreview ?? user.image}
            size={96}
        />
    );

    return (
        <Card className="w-full max-w-2xl border-outline shadow-sm bg-surface rounded-3xl p-6">
            <CardContent className="p-0 space-y-8">
                {/* Upper part: Avatar and Info */}
                <div className="flex items-start gap-6">
                    <div className="relative shrink-0">
                        {onAvatarUpload ? (
                            <ImageUpload
                                currentUrl={user.image}
                                onUpload={onAvatarUpload}
                                onPreview={setAvatarPreview}
                                className="rounded-full"
                            >
                                <div className="relative">
                                    {avatar}
                                    <div className="absolute cursor-pointer bottom-0 right-0 p-1.5 bg-background rounded-full border border-outline shadow-sm hover:bg-soft-blue transition-colors">
                                        <Pencil className="w-4 h-4 text-primary-blue" />
                                    </div>
                                </div>
                            </ImageUpload>
                        ) : (
                            avatar
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

                {/* Action slot */}
                {children}

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
        </Card>
    );
}

export function ProfileCardSkeleton() {
    return (
        <Card className="w-full max-w-2xl border-outline shadow-sm bg-surface rounded-3xl p-6">
            <CardContent className="p-0 space-y-8">
                <div className="flex items-start gap-6">
                    <Skeleton className="h-24 w-24 shrink-0 rounded-full" />
                    <div className="space-y-3 py-1">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-5 w-64" />
                    </div>
                </div>
                <div className="flex flex-wrap gap-3">
                    <Skeleton className="h-10 w-36 rounded-xl" />
                    <Skeleton className="h-10 w-32 rounded-xl" />
                </div>
                <div className="space-y-3">
                    <Skeleton className="h-4 w-32" />
                    <div className="flex flex-wrap gap-2">
                        <Skeleton className="h-8 w-20 rounded-full" />
                        <Skeleton className="h-8 w-24 rounded-full" />
                        <Skeleton className="h-8 w-16 rounded-full" />
                    </div>
                </div>
                <div className="space-y-3">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-9 w-64 rounded-xl" />
                </div>
            </CardContent>
        </Card>
    );
}
