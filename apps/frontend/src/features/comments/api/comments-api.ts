import { api } from '@/lib/api';
import { throwIfError } from '@/lib/api-error';
import type {
    CreateCommentBody,
    UpdateCommentBody,
    CommentQueryFilters,
} from '../../../../../backend/src/modules/comments/comments.schema';

export const commentQueryKeys = {
    all: ['comments'] as const,
    lists: () => [...commentQueryKeys.all, 'list'] as const,
    list: (filters: CommentQueryFilters) =>
        [...commentQueryKeys.lists(), filters] as const,
    byEvent: (eventId?: string) =>
        [...commentQueryKeys.lists(), { eventId }] as const,
    details: () => [...commentQueryKeys.all, 'detail'] as const,
    detail: (id?: string) => [...commentQueryKeys.details(), id] as const,
};

export async function listComments(filters: CommentQueryFilters) {
    const { data, error } = await api.comments.get({ query: filters });
    throwIfError(error, 'Failed to fetch comments');
    return data;
}

export async function getComment(id: string) {
    const { data, error } = await api.comments({ id }).get();
    throwIfError(error, 'Failed to fetch comment');
    return data;
}

export async function createComment(eventId: string, body: CreateCommentBody) {
    const { data, error } = await api.comments.events({ eventId }).post(body);
    throwIfError(error, 'Failed to create comment');
    return data;
}

export async function updateComment(id: string, body: UpdateCommentBody) {
    const { data, error } = await api.comments({ id }).patch(body);
    throwIfError(error, 'Failed to update comment');
    return data;
}

export async function deleteComment(id: string, reason?: string) {
    const { data, error } = await api.comments({ id }).delete({ reason });
    throwIfError(error, 'Failed to delete comment');
    return data;
}
