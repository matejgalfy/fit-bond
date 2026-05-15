import { useState } from 'react';
import { Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { UserAvatar } from '@/components/ui/user-avatar';
import { useCreateComment } from '../hooks/comments';

interface CommentComposerProps {
    eventId: string;
    userName: string;
    userImage?: string | null;
    parentCommentId?: string;
    placeholder: string;
    buttonLabel: string;
    cancelLabel?: string;
    onSubmitted?: () => void;
    onCancel?: () => void;
}

export function CommentComposer({
    eventId,
    userName,
    userImage,
    parentCommentId,
    placeholder,
    buttonLabel,
    cancelLabel = 'Cancel',
    onSubmitted,
    onCancel,
}: CommentComposerProps) {
    const [content, setContent] = useState('');
    const createComment = useCreateComment(eventId);
    const trimmedContent = content.trim();

    const submitComment = () => {
        if (trimmedContent.length === 0) return;

        createComment.mutate(
            {
                content: trimmedContent,
                parentCommentId,
            },
            {
                onSuccess: () => {
                    setContent('');
                    onSubmitted?.();
                },
            }
        );
    };

    const cancelComment = () => {
        setContent('');
        createComment.reset();
        onCancel?.();
    };

    return (
        <div className="flex gap-3">
            <UserAvatar name={userName} imageUrl={userImage} size={32} />
            <div className="min-w-0 flex-1">
                <Textarea
                    value={content}
                    onChange={(event) => {
                        setContent(event.target.value);
                    }}
                    maxLength={2000}
                    placeholder={placeholder}
                    aria-invalid={createComment.isError}
                    className="min-h-12 resize-none bg-surface py-3 text-small leading-6"
                />
                {createComment.isError && (
                    <p className="m-0 mt-2 text-small text-primary-red">
                        {createComment.error.message}
                    </p>
                )}
                <div className="mt-2 flex justify-end gap-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1 px-2 text-tiny"
                        onClick={cancelComment}
                        disabled={
                            content.length === 0 && onCancel === undefined
                        }
                    >
                        <X />
                        {cancelLabel}
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        className="h-7 px-2 text-tiny"
                        onClick={submitComment}
                        disabled={
                            trimmedContent.length === 0 ||
                            createComment.isPending
                        }
                    >
                        <Send />
                        {createComment.isPending ? 'Posting...' : buttonLabel}
                    </Button>
                </div>
            </div>
        </div>
    );
}
