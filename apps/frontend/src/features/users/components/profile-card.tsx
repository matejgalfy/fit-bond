import type { UserProfile } from '../../../../../backend/src/modules/users/users.types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, LogOut, MapPin } from 'lucide-react';

interface ProfileCardProps {
    user: UserProfile;
    isOwner?: boolean;
}

export function ProfileCard({ user, isOwner = true }: ProfileCardProps) {
    const initials = user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase();

    const primaryLocation =
        user.locations.find((l) => l.isPrimary) ?? user.locations.at(0);

    return (
        <Card className="w-full max-w-2xl border-outline shadow-sm bg-surface rounded-3xl p-6">
            <CardContent className="p-0 space-y-8">
                {/* Upper part: Avatar and Info */}
                <div className="flex items-start gap-6">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-linear-to-br from-primary-blue to-strong-blue flex items-center justify-center text-surface text-heading font-bold">
                            {initials}
                        </div>
                        {isOwner && (
                            <button className="absolute cursor-pointer bottom-0 right-0 p-1.5 bg-background rounded-full border border-outline shadow-sm hover:bg-soft-blue transition-colors">
                                <Pencil className="w-4 h-4 text-primary-blue" />
                            </button>
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
                        >
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit Profile
                        </Button>
                        <Button
                            variant="outline"
                            className="rounded-xl border-primary-red text-primary-red hover:bg-primary-red/10 hover:text-primary-red px-6 font-semibold"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Log Out
                        </Button>
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
                                {primaryLocation.city} ·{' '}
                                {primaryLocation.radius} km radius
                            </span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
