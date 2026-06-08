import { describe, test, expect } from 'vitest';
import { findFocusedCommentId } from './utils';
import type { Comment } from './types';

function makeComment(
    id: string,
    authorId: string,
    createdAt: string
): Comment {
    return {
        id,
        author: { id: authorId },
        createdAt,
    } as unknown as Comment;
}

describe('findFocusedCommentId', () => {
    test('returns the comment by the author closest to the timestamp', () => {
        const comments = [
            makeComment('a', 'user-1', '2026-05-09T10:00:00.000Z'),
            makeComment('b', 'user-2', '2026-05-09T10:05:00.000Z'),
            makeComment('c', 'user-1', '2026-05-09T10:10:00.000Z'),
        ];

        const id = findFocusedCommentId(comments, {
            authorId: 'user-1',
            atMs: new Date('2026-05-09T10:09:59.500Z').getTime(),
        });

        expect(id).toBe('c');
    });

    test('ignores comments by other authors', () => {
        const comments = [
            makeComment('a', 'user-2', '2026-05-09T10:00:00.000Z'),
            makeComment('b', 'user-1', '2026-05-09T11:00:00.000Z'),
        ];

        const id = findFocusedCommentId(comments, {
            authorId: 'user-1',
            atMs: new Date('2026-05-09T10:00:00.000Z').getTime(),
        });

        expect(id).toBe('b');
    });

    test('returns null when the author has no comments', () => {
        const comments = [
            makeComment('a', 'user-2', '2026-05-09T10:00:00.000Z'),
        ];

        const id = findFocusedCommentId(comments, {
            authorId: 'user-1',
            atMs: Date.now(),
        });

        expect(id).toBeNull();
    });

    test('returns null for an empty comment list', () => {
        const id = findFocusedCommentId([], {
            authorId: 'user-1',
            atMs: Date.now(),
        });

        expect(id).toBeNull();
    });
});
