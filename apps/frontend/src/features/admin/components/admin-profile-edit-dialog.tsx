import { useState } from 'react';
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
import { useUpdateAdminUser } from '../hooks/use-admin-users';

interface AdminProfileEditDialogProps {
    userId: string;
    userName: string;
    userBio: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function AdminProfileEditForm({
    userId,
    userName,
    userBio,
    onOpenChange,
}: {
    userId: string;
    userName: string;
    userBio: string | null;
    onOpenChange: (open: boolean) => void;
}) {
    const [name, setName] = useState(userName);
    const [bio, setBio] = useState(userBio ?? '');
    const [error, setError] = useState('');

    const { mutateAsync: updateUser, isPending } = useUpdateAdminUser();

    const submit = async () => {
        setError('');

        const trimmedName = name.trim();
        if (trimmedName.length === 0) {
            setError('Name is required.');
            return;
        }

        try {
            await updateUser({
                id: userId,
                body: {
                    name: trimmedName,
                    bio: bio.trim() || null,
                },
            });
            onOpenChange(false);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
                return;
            }
            setError('Failed to save profile. Please try again.');
        }
    };

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                void submit();
            }}
            className="space-y-3 w-full min-w-0"
        >
            <FormField label="Name" htmlFor="admin-edit-name" required>
                <Input
                    id="admin-edit-name"
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value);
                    }}
                    maxLength={200}
                    className="h-10 bg-background"
                />
            </FormField>

            <FormField label="Bio" htmlFor="admin-edit-bio">
                <Textarea
                    id="admin-edit-bio"
                    value={bio}
                    onChange={(e) => {
                        setBio(e.target.value);
                    }}
                    maxLength={1000}
                    rows={3}
                    className="bg-background"
                />
            </FormField>

            {error && <p className="text-regular text-primary-red">{error}</p>}

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
    );
}

export function AdminProfileEditDialog({
    userId,
    userName,
    userBio,
    open,
    onOpenChange,
}: AdminProfileEditDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit user profile</DialogTitle>
                    <DialogDescription>
                        Update this user&apos;s name and bio as an
                        administrator.
                    </DialogDescription>
                </DialogHeader>

                <AdminProfileEditForm
                    userId={userId}
                    userName={userName}
                    userBio={userBio}
                    onOpenChange={onOpenChange}
                />
            </DialogContent>
        </Dialog>
    );
}
