import { useState } from 'react';
import { Reply } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/ui/user-avatar';
import { timeAgo } from '@/lib/utils';
import { ReportCommentDialog } from '@/features/reports/components/report-comment-dialog';
import type { Comment } from '../types';
import { CommentComposer } from './comment-composer';

interface CommentItemProps {
    comment: Comment;
    replies: Comment[];
    eventId: string;
    currentUserId: string;
    currentUserName: string;
    currentUserImage?: string | null;
}

export function CommentItem({
    comment,
    replies,
    eventId,
    currentUserId,
    currentUserName,
    currentUserImage,
}: CommentItemProps) {
    const [replyOpen, setReplyOpen] = useState(false);
    const isOwnComment = comment.author.id === currentUserId;

    return (
        <article className="flex gap-3">
            <UserAvatar
                name={comment.author.name}
                imageUrl={comment.author.image}
                size={32}
            />
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <h3 className="m-0 text-small font-semibold text-primary-text">
                        {comment.author.name}
                    </h3>
                    <span className="text-tiny text-tertiary-text">
                        {timeAgo(comment.createdAt)}
                    </span>
                </div>

                <p className="m-0 mt-0.5 whitespace-pre-wrap text-small leading-5 text-primary-text">
                    {comment.content}
                </p>

                <div className="mt-0.5 flex items-center gap-1">
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
                </div>

                {replyOpen && (
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
                            <article key={reply.id} className="flex gap-2.5">
                                <UserAvatar
                                    name={reply.author.name}
                                    imageUrl={reply.author.image}
                                    size={26}
                                />
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                        <h4 className="m-0 text-tiny font-semibold text-primary-text">
                                            {reply.author.name}
                                        </h4>
                                        <span className="text-tiny text-tertiary-text">
                                            {timeAgo(reply.createdAt)}
                                        </span>
                                    </div>
                                    <p className="m-0 whitespace-pre-wrap text-tiny leading-5 text-primary-text">
                                        {reply.content}
                                    </p>
                                    {reply.author.id !== currentUserId && (
                                        <div className="mt-0.5">
                                            <ReportCommentDialog
                                                commentId={reply.id}
                                            />
                                        </div>
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
