import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export interface BanUserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userName: string;
    pending: boolean;
    onConfirm: (reason: string) => void;
}

function BanUserForm({
    onOpenChange,
    pending,
    onConfirm,
}: {
    onOpenChange: (open: boolean) => void;
    pending: boolean;
    onConfirm: (reason: string) => void;
}) {
    const [reason, setReason] = useState('');

    const handleSubmit = () => {
        if (!reason.trim()) return;
        onConfirm(reason.trim());
    };

    return (
        <>
            <Textarea
                placeholder="Reason for ban (required)"
                value={reason}
                onChange={(e) => {
                    setReason(e.target.value);
                }}
                rows={3}
            />
            <DialogFooter>
                <Button
                    variant="outline"
                    onClick={() => {
                        onOpenChange(false);
                    }}
                >
                    Cancel
                </Button>
                <Button
                    variant="destructive"
                    onClick={handleSubmit}
                    disabled={pending || !reason.trim()}
                >
                    Ban user
                </Button>
            </DialogFooter>
        </>
    );
}

export function BanUserDialog({
    open,
    onOpenChange,
    userName,
    pending,
    onConfirm,
}: BanUserDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Ban {userName}</DialogTitle>
                    <DialogDescription>
                        The user will be blocked from authenticated actions
                        until unbanned.
                    </DialogDescription>
                </DialogHeader>
                <BanUserForm
                    onOpenChange={onOpenChange}
                    pending={pending}
                    onConfirm={onConfirm}
                />
            </DialogContent>
        </Dialog>
    );
}
