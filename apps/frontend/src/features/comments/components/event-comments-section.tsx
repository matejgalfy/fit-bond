import { useEffect, useMemo, useRef, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { authClient } from '@/lib/api';
import { useIsAdmin } from '@/features/admin/hooks/current-user';
import type { Comment } from '../types';
import { useComments } from '../hooks/comments';
import { CommentComposer } from './comment-composer';
import { CommentItem } from './comment-item';

interface EventCommentsSectionProps {
    eventId: string;
    // Set when the user arrives from a comment notification: scrolls to and
    // briefly highlights this comment (falls back to the section if it's gone).
    focusCommentId?: string;
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

export function EventCommentsSection({
    eventId,
    focusCommentId,
}: EventCommentsSectionProps) {
    const { data: session } = authClient.useSession();
    const isAdmin = useIsAdmin();
    const { data: comments, isPending, isError } = useComments(eventId);
    const sectionRef = useRef<HTMLElement>(null);
    const [highlightedId, setHighlightedId] = useState<string | null>(null);

    const { roots, repliesByParentId } = useMemo(
        () => groupComments(comments ?? []),
        [comments]
    );

    useEffect(() => {
        if (focusCommentId == null || isPending) return;

        const target = document.getElementById(`comment-${focusCommentId}`);
        if (!target) {
            // Comment not found (deleted or not loaded) — fall back to showing
            // the discussion.
            sectionRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
            return;
        }

        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setHighlightedId(focusCommentId);
        const timer = setTimeout(() => {
            setHighlightedId(null);
        }, 2500);
        return () => {
            clearTimeout(timer);
        };
    }, [focusCommentId, isPending]);

    if (!session?.user) return null;

    const userImage = session.user.image;
    const commentCount = comments?.length ?? 0;

    return (
        <section ref={sectionRef} className="mt-8">
            <div className="mb-4 flex items-center gap-2">
                <MessageCircle size={20} className="text-primary-blue" />
                <h2 className="m-0 font-heading text-subheading font-semibold text-primary-text">
                    Discussion ({String(commentCount)})
                </h2>
            </div>

            {!isAdmin && (
                <CommentComposer
                    eventId={eventId}
                    userName={session.user.name}
                    userImage={userImage}
                    placeholder="Write a comment..."
                    buttonLabel="Post comment"
                />
            )}

            {isPending && (
                <div className="mt-6 space-y-4">
                    {[1, 2, 3].map((item) => (
                        <div key={item} className="flex gap-3">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-40" />
                                <Skeleton className="h-4 w-full" />
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
                            isAdmin={isAdmin}
                            highlightCommentId={highlightedId}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
