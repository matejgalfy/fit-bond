import type { ReactNode } from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import type { CreateReportBody } from '../../../../../backend/src/modules/reports/reports.schema';
import { useCreateReport } from '../hooks/reports';

interface ReportTargetDialogProps {
    targetId: string;
    reportType: CreateReportBody['reportType'];
    title: string;
    description: string;
    reasonInputId: string;
    trigger: ReactNode;
}

export function ReportTargetDialog({
    targetId,
    reportType,
    title,
    description,
    reasonInputId,
    trigger,
}: ReportTargetDialogProps) {
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const createReport = useCreateReport();
    const trimmedReason = reason.trim();

    const submitReport = () => {
        if (trimmedReason.length === 0) return;

        createReport.mutate(
            {
                reportType,
                targetId,
                reason: trimmedReason,
            },
            {
                onSuccess: () => {
                    setSubmitted(true);
                    setReason('');
                },
            }
        );
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
                setOpen(nextOpen);
                if (!nextOpen) {
                    setReason('');
                    setSubmitted(false);
                    createReport.reset();
                }
            }}
        >
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                {submitted ? (
                    <p className="m-0 rounded-lg bg-soft-green px-3 py-2 text-small text-primary-green">
                        Report submitted.
                    </p>
                ) : (
                    <div className="grid gap-2">
                        <label
                            htmlFor={reasonInputId}
                            className="text-small font-medium text-primary-text"
                        >
                            Reason
                        </label>
                        <Textarea
                            id={reasonInputId}
                            value={reason}
                            onChange={(event) => {
                                setReason(event.target.value);
                            }}
                            maxLength={1000}
                            placeholder="Describe what moderators should review."
                            aria-invalid={createReport.isError}
                        />
                        {createReport.isError && (
                            <p className="m-0 text-small text-primary-red">
                                {createReport.error.message}
                            </p>
                        )}
                    </div>
                )}

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">
                            {submitted ? 'Close' : 'Cancel'}
                        </Button>
                    </DialogClose>
                    {!submitted && (
                        <Button
                            type="button"
                            onClick={submitReport}
                            disabled={
                                trimmedReason.length === 0 ||
                                createReport.isPending
                            }
                        >
                            {createReport.isPending
                                ? 'Submitting...'
                                : 'Submit report'}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
