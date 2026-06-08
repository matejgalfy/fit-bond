import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { useUpdateAdminUser } from '../hooks/use-admin-users';

interface AdminProfileEditDialogProps {
    userId: string;
    userName: string;
    userBio: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const adminProfileEditSchema = z.object({
    name: z.string().trim().min(1, 'Name is required.').max(200),
    bio: z.string().trim().max(1000),
});

type AdminProfileEditValues = z.infer<typeof adminProfileEditSchema>;

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
    const form = useForm<AdminProfileEditValues>({
        resolver: zodResolver(adminProfileEditSchema),
        defaultValues: {
            name: userName,
            bio: userBio ?? '',
        },
    });

    const { mutateAsync: updateUser, isPending } = useUpdateAdminUser();

    const onSubmit = async (values: AdminProfileEditValues) => {
        try {
            await updateUser({
                id: userId,
                body: {
                    name: values.name,
                    bio: values.bio || null,
                },
            });
            onOpenChange(false);
        } catch (err) {
            form.setError('root', {
                message:
                    err instanceof Error
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
                                    maxLength={200}
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
                                    maxLength={1000}
                                    rows={3}
                                    className="bg-background"
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
