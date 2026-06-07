import type { Database } from '../../db';
import type { CommentsModel } from './comments.model';
import { commentsModel as defaultModel } from './comments.model';
import type {
    CommentFilters,
    CreateCommentInput,
    UpdateCommentInput,
} from './comments.types';
import { ServiceError } from '../../utils/errors';
import type { EventsService } from '../events/events.service';
import type { EventBus } from '../../lib/eventBus';
import type { Actor } from '../../utils/actor';

export interface CommentsServiceDeps {
    model?: CommentsModel;
    eventsService: Pick<EventsService, 'loadRaw'>;
    bus: Pick<EventBus, 'emit'>;
}

export function createCommentsService({
    model = defaultModel,
    eventsService,
    bus,
}: CommentsServiceDeps) {
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

        async loadRaw(db: Database, id: string) {
            const comment = await model.findRawById(db, id);
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

            const comment = await model.create(db, userId, eventId, input);

            const event = await eventsService.loadRaw(db, eventId);
            await bus.emit(db, 'event.commented', {
                eventId,
                eventName: event.name,
                organizerId: event.organizerId,
                actorId: userId,
                commentId: comment.id,
            });

            return comment;
        },

        async update(
            db: Database,
            commentId: string,
            userId: string,
            input: UpdateCommentInput
        ) {
            const existing = await this.loadRaw(db, commentId);
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
            actor: Actor,
            reason?: string
        ) {
            const existing = await this.loadRaw(db, commentId);
            const isAuthor = existing.userId === actor.id;
            const isAdmin = actor.role === 'admin';
            if (!isAuthor && !isAdmin) {
                throw ServiceError.forbidden(
                    'Only the author or an admin can delete this comment'
                );
            }

            const reasonToStore = isAuthor ? undefined : reason;
            await model.softDelete(db, commentId, actor.id, reasonToStore);
            // Cascade: deleting a comment also removes all of its replies.
            await model.softDeleteReplies(
                db,
                commentId,
                actor.id,
                reasonToStore
            );
            return { success: true };
        },
    };
}

export type CommentsService = ReturnType<typeof createCommentsService>;
