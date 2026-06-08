import type { Comment } from './types';

export interface FocusComment {
    authorId: string;
    atMs: number;
}

/* This is needed because notifications don't store a comment id, 
   database migration would be required to add this information */ 
export function findFocusedCommentId(
    comments: Comment[],
    focus: FocusComment
): string | null {
    let bestId: string | null = null;
    let bestDiff = Number.POSITIVE_INFINITY;

    for (const comment of comments) {
        if (comment.author.id !== focus.authorId) continue;

        const diff = Math.abs(
            new Date(comment.createdAt).getTime() - focus.atMs
        );
        if (diff < bestDiff) {
            bestDiff = diff;
            bestId = comment.id;
        }
    }

    return bestId;
}
