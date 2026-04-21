import type { Database } from '../../db';
import type { CommentsModel } from './comments.model';
import { commentsModel as defaultModel } from './comments.model';
import type {
    CommentFilters,
    CreateCommentInput,
    UpdateCommentInput,
} from './comments.types';
import { ServiceError } from '../../utils/errors';

export interface CommentActor {
    id: string;
    role: 'user' | 'admin';
}

export function createCommentsService(model: CommentsModel = defaultModel) {
    return {
        async list(db: Database, filters: CommentFilters) {
            return model.findAll(db, filters);
        },

        async getById(db: Database, id: string) {
            const comment = await model.findById(db, id);
            if (!comment) {
                throw ServiceError.notFound('Comment not found');
            }
            return comment;
        },

        async create(
            db: Database,
            userId: string,
            eventId: string,
            input: CreateCommentInput
        ) {
            const eligible = await model.isUserEligibleToComment(
                db,
                eventId,
                userId
            );
            if (!eligible) {
                throw ServiceError.forbidden(
                    'Only the organizer, joined participants, or interested users can comment'
                );
            }

            if (input.parentCommentId) {
                const parent = await model.findRawById(
                    db,
                    input.parentCommentId
                );
                if (!parent) {
                    throw ServiceError.badRequest('Parent comment not found');
                }
                if (parent.eventId !== eventId) {
                    throw ServiceError.badRequest(
                        'Parent comment must belong to the same event'
                    );
                }
            }

            return model.create(db, userId, eventId, input);
        },

        async update(
            db: Database,
            commentId: string,
            userId: string,
            input: UpdateCommentInput
        ) {
            const existing = await model.findRawById(db, commentId);
            if (!existing) {
                throw ServiceError.notFound('Comment not found');
            }
            if (existing.userId !== userId) {
                throw ServiceError.forbidden(
                    'Only the comment author can update this comment'
                );
            }

            return model.update(db, commentId, input);
        },

        async delete(
            db: Database,
            commentId: string,
            actor: CommentActor,
            reason?: string
        ) {
            const existing = await model.findRawById(db, commentId);
            if (!existing) {
                throw ServiceError.notFound('Comment not found');
            }

            const isAuthor = existing.userId === actor.id;
            const isAdmin = actor.role === 'admin';
            if (!isAuthor && !isAdmin) {
                throw ServiceError.forbidden(
                    'Only the author or an admin can delete this comment'
                );
            }

            await model.softDelete(
                db,
                commentId,
                actor.id,
                isAuthor ? undefined : reason
            );
        },
    };
}

export const commentsService = createCommentsService();
