import type { InferSelectModel } from 'drizzle-orm';
import type { comments } from '../../db/schema';
import type {
    CreateCommentBody,
    UpdateCommentBody,
    CommentQueryFilters,
} from './comments.schema';

export type CommentType = InferSelectModel<typeof comments>;

export type CreateCommentInput = CreateCommentBody;
export type UpdateCommentInput = UpdateCommentBody;
export type CommentFilters = CommentQueryFilters;
