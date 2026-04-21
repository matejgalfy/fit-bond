import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
    CreateCommentBody,
    UpdateCommentBody,
} from '../../../../../backend/src/modules/comments/comments.schema';
import type { Comment } from '../types';
import {
    commentQueryKeys,
    createComment,
    deleteComment,
    getComment,
    listComments,
    updateComment,
} from '../api/comments-api';

export function useComments(eventId?: string) {
    return useQuery<Comment[]>({
        queryKey: commentQueryKeys.byEvent(eventId ?? 'missing'),
        queryFn: () => {
            if (!eventId) {
                throw new Error('Missing event id');
            }

            return listComments({ eventId });
        },
        enabled: Boolean(eventId),
    });
}

export function useComment(id?: string) {
    return useQuery<Comment>({
        queryKey: commentQueryKeys.detail(id ?? 'missing'),
        queryFn: () => {
            if (!id) {
                throw new Error('Missing comment id');
            }

            return getComment(id);
        },
        enabled: Boolean(id),
    });
}

export function useCreateComment(eventId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (body: CreateCommentBody) => createComment(eventId, body),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: commentQueryKeys.byEvent(eventId),
            });
        },
    });
}

export function useUpdateComment(id: string, eventId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (body: UpdateCommentBody) => updateComment(id, body),
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: commentQueryKeys.byEvent(eventId),
                }),
                queryClient.invalidateQueries({
                    queryKey: commentQueryKeys.detail(id),
                }),
            ]);
        },
    });
}

export function useDeleteComment(eventId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
            deleteComment(id, reason),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: commentQueryKeys.byEvent(eventId),
            });
        },
    });
}
