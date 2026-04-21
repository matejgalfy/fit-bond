import { api } from '@/lib/api';

export type CommentsGetData = Awaited<
    ReturnType<typeof api.comments.get>
>['data'];

export type CommentListResponse = Extract<
    NonNullable<CommentsGetData>,
    unknown[]
>;

export type Comment = CommentListResponse[number];
