import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Reply, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/ui/user-avatar';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { cn, timeAgo } from '@/lib/utils';
import { ReportCommentDialog } from '@/features/reports/components/report-comment-dialog';
import type { Comment } from '../types';
import { useDeleteComment } from '../hooks/comments';
import { CommentComposer } from './comment-composer';

// Applied to a comment scrolled into view from a notification.
const highlightClass =
    'rounded-xl ring-2 ring-primary-blue ring-offset-4 ring-offset-surface transition-shadow duration-300';

interface CommentItemProps {
    comment: Comment;
    replies: Comment[];
    eventId: string;
    currentUserId: string;
    currentUserName: string;
    currentUserImage?: string | null;
    isAdmin?: boolean;
    highlightCommentId?: string | null;
}

export function CommentItem({
    comment,
    replies,
    eventId,
    currentUserId,
    currentUserName,
    currentUserImage,
    isAdmin = false,
    highlightCommentId,
}: CommentItemProps) {
    const [replyOpen, setReplyOpen] = useState(false);
    const isOwnComment = comment.author.id === currentUserId;
    const profileTo = isAdmin ? '/admin/profile-page' : '/pages/profile-page';

    return (
        <article
            id={`comment-${comment.id}`}
            className={cn(
                'flex gap-3',
                highlightCommentId === comment.id && highlightClass
            )}
        >
            <Link
                to={profileTo}
                search={{ userId: comment.author.id }}
                className="shrink-0"
            >
                <UserAvatar
                    name={comment.author.name}
                    imageUrl={comment.author.image}
                    size={32}
                />
            </Link>
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <h3 className="m-0 text-small font-semibold text-primary-text">
                        <Link
                            to={profileTo}
                            search={{ userId: comment.author.id }}
                            className="hover:underline"
                        >
                            {comment.author.name}
                        </Link>
                    </h3>
                    <span className="text-tiny text-tertiary-text">
                        {timeAgo(comment.createdAt)}
                    </span>
                </div>

                <p className="m-0 mt-0.5 whitespace-pre-wrap text-small leading-5 text-primary-text">
                    {comment.content}
                </p>

                <div className="mt-0.5 flex items-center gap-1">
                    {isAdmin ? (
                        <DeleteCommentButton
                            commentId={comment.id}
                            eventId={eventId}
                            isReply={false}
                        />
                    ) : (
                        <>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-7 gap-1 px-1.5 text-primary-blue"
                                onClick={() => {
                                    setReplyOpen((open) => !open);
                                }}
                            >
                                <Reply />
                                Reply
                            </Button>
                            {!isOwnComment && (
                                <ReportCommentDialog commentId={comment.id} />
                            )}
                        </>
                    )}
                </div>

                {replyOpen && !isAdmin && (
                    <div className="mt-3 border-l-4 border-outline pl-4">
                        <CommentComposer
                            eventId={eventId}
                            userName={currentUserName}
                            userImage={currentUserImage}
                            parentCommentId={comment.id}
                            placeholder="Write your reply..."
                            buttonLabel="Post reply"
                            cancelLabel="Cancel"
                            onSubmitted={() => {
                                setReplyOpen(false);
                            }}
                            onCancel={() => {
                                setReplyOpen(false);
                            }}
                        />
                    </div>
                )}

                {replies.length > 0 && (
                    <div className="mt-3 space-y-3 border-l-2 border-outline pl-4">
                        {replies.map((reply) => (
                            <article
                                key={reply.id}
                                id={`comment-${reply.id}`}
                                className={cn(
                                    'flex gap-2.5',
                                    highlightCommentId === reply.id &&
                                        highlightClass
                                )}
                            >
                                <Link
                                    to={profileTo}
                                    search={{ userId: reply.author.id }}
                                    className="shrink-0"
                                >
                                    <UserAvatar
                                        name={reply.author.name}
                                        imageUrl={reply.author.image}
                                        size={26}
                                    />
                                </Link>
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                        <h4 className="m-0 text-tiny font-semibold text-primary-text">
                                            <Link
                                                to={profileTo}
                                                search={{
                                                    userId: reply.author.id,
                                                }}
                                                className="hover:underline"
                                            >
                                                {reply.author.name}
                                            </Link>
                                        </h4>
                                        <span className="text-tiny text-tertiary-text">
                                            {timeAgo(reply.createdAt)}
                                        </span>
                                    </div>
                                    <p className="m-0 whitespace-pre-wrap text-tiny leading-5 text-primary-text">
                                        {reply.content}
                                    </p>
                                    {isAdmin ? (
                                        <div className="mt-0.5">
                                            <DeleteCommentButton
                                                commentId={reply.id}
                                                eventId={eventId}
                                                isReply
                                            />
                                        </div>
                                    ) : (
                                        reply.author.id !== currentUserId && (
                                            <div className="mt-0.5">
                                                <ReportCommentDialog
                                                    commentId={reply.id}
                                                />
                                            </div>
                                        )
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </article>
    );
}

interface DeleteCommentButtonProps {
    commentId: string;
    eventId: string;
    isReply: boolean;
}

function DeleteCommentButton({
    commentId,
    eventId,
    isReply,
}: DeleteCommentButtonProps) {
    const [open, setOpen] = useState(false);
    const deleteComment = useDeleteComment(eventId);

    return (
        <>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 gap-1 px-1.5 text-primary-red hover:text-primary-red"
                onClick={() => {
                    setOpen(true);
                }}
            >
                <Trash2 />
                Delete
            </Button>

            <Dialog
                open={open}
                onOpenChange={(next) => {
                    setOpen(next);
                    if (!next) deleteComment.reset();
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Delete {isReply ? 'reply' : 'comment'}?
                        </DialogTitle>
                        <DialogDescription>
                            {isReply
                                ? 'This permanently removes the reply.'
                                : 'This removes the comment and all of its replies.'}
                        </DialogDescription>
                    </DialogHeader>
                    {deleteComment.isError && (
                        <p className="m-0 text-small text-primary-red">
                            {deleteComment.error.message}
                        </p>
                    )}
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setOpen(false);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            disabled={deleteComment.isPending}
                            onClick={() => {
                                deleteComment.mutate(
                                    { id: commentId },
                                    {
                                        onSuccess: () => {
                                            setOpen(false);
                                        },
                                    }
                                );
                            }}
                        >
                            {deleteComment.isPending ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
