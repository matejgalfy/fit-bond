import { useMemo } from 'react';
import { MessageCircle } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import { authClient } from '@/lib/api';
import type { Comment } from '../types';
import { useComments } from '../hooks/comments';
import { CommentComposer } from './comment-composer';
import { CommentItem } from './comment-item';

interface EventCommentsSectionProps {
    eventId: string;
}

function groupComments(comments: Comment[]) {
    const roots: Comment[] = [];
    const repliesByParentId = new Map<string, Comment[]>();

    for (const comment of comments) {
        if (comment.parentCommentId == null) {
            roots.push(comment);
            continue;
        }

        const replies = repliesByParentId.get(comment.parentCommentId) ?? [];
        replies.push(comment);
        repliesByParentId.set(comment.parentCommentId, replies);
    }

    return { roots, repliesByParentId };
}

export function EventCommentsSection({ eventId }: EventCommentsSectionProps) {
    const { data: session } = authClient.useSession();
    const { data: comments, isPending, isError } = useComments(eventId);

    const { roots, repliesByParentId } = useMemo(
        () => groupComments(comments ?? []),
        [comments]
    );

    if (!session?.user) return null;

    const userImage = session.user.image;
    const commentCount = comments?.length ?? 0;

    return (
        <section className="mt-8">
            <div className="mb-4 flex items-center gap-2">
                <MessageCircle size={20} className="text-primary-blue" />
                <h2 className="m-0 font-heading text-subheading font-semibold text-primary-text">
                    Discussion ({String(commentCount)})
                </h2>
            </div>

            <CommentComposer
                eventId={eventId}
                userName={session.user.name}
                userImage={userImage}
                placeholder="Write a comment..."
                buttonLabel="Post comment"
            />

            {isPending && (
                <div className="mt-6 space-y-4 animate-pulse">
                    {[1, 2, 3].map((item) => (
                        <div key={item} className="flex gap-3">
                            <div className="h-8 w-8 rounded-full bg-muted-background" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-40 rounded-md bg-muted-background" />
                                <div className="h-4 w-full rounded-md bg-muted-background" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isError && (
                <EmptyState className="mt-6">
                    Failed to load comments.
                </EmptyState>
            )}

            {!isPending && !isError && roots.length === 0 && (
                <EmptyState className="mt-6">
                    No comments yet. Start the discussion.
                </EmptyState>
            )}

            {roots.length > 0 && (
                <div className="mt-5 space-y-4">
                    {roots.map((comment) => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            replies={repliesByParentId.get(comment.id) ?? []}
                            eventId={eventId}
                            currentUserId={session.user.id}
                            currentUserName={session.user.name}
                            currentUserImage={userImage}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
