import { db } from '../../db';
import { commentsService, type CommentActor } from './comments.service';

import type {
    CreateCommentBody,
    UpdateCommentBody,
    DeleteCommentBody,
    CommentQueryFilters,
} from './comments.schema';

export const commentsController = {
    async list(filters: CommentQueryFilters) {
        return commentsService.list(db, filters);
    },

    async getById(id: string) {
        return commentsService.getById(db, id);
    },

    async create(
        actor: CommentActor,
        eventId: string,
        data: CreateCommentBody
    ) {
        return commentsService.create(db, actor.id, eventId, data);
    },

    async update(id: string, actor: CommentActor, data: UpdateCommentBody) {
        return commentsService.update(db, id, actor.id, data);
    },

    async delete(id: string, actor: CommentActor, data: DeleteCommentBody) {
        await commentsService.delete(db, id, actor, data.reason);
        return { success: true };
    },
};
