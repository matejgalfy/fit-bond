import { Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReportTargetDialog } from './report-target-dialog';

interface ReportCommentDialogProps {
    commentId: string;
}

export function ReportCommentDialog({ commentId }: ReportCommentDialogProps) {
    return (
        <ReportTargetDialog
            targetId={commentId}
            reportType="comment"
            title="Report comment"
            description="Send this comment to moderators for review."
            reasonInputId={`comment-report-reason-${commentId}`}
            trigger={
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 px-1.5 text-secondary-text hover:bg-soft-red hover:text-primary-red"
                >
                    <Flag />
                    Report
                </Button>
            }
        />
    );
}
