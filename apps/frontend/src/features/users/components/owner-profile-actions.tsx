import { useState } from 'react';
import type { UserProfile } from '../../../../../backend/src/modules/users/users.types';
import { Button } from '@/components/ui/button';
import { Pencil, LogOut } from 'lucide-react';
import { ProfileEditDialog } from './profile-edit-dialog';

interface OwnerProfileActionsProps {
    user: UserProfile;
    onLogout?: () => void | Promise<void>;
    isLoggingOut?: boolean;
    logoutError?: string;
}

export function OwnerProfileActions({
    user,
    onLogout,
    isLoggingOut = false,
    logoutError,
}: OwnerProfileActionsProps) {
    const [editOpen, setEditOpen] = useState(false);

    return (
        <>
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

            <ProfileEditDialog
                user={user}
                open={editOpen}
                onOpenChange={setEditOpen}
            />
        </>
    );
}
