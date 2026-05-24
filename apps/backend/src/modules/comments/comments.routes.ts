import { Elysia } from 'elysia';
import {
    createCommentBody,
    updateCommentBody,
    deleteCommentBody,
    commentQueryFilters,
    commentIdParam,
    eventIdParam,
} from './comments.schema';
import { handleServiceError } from '../../utils/error-handler';
import { authLayer } from '../../auth_middleware';
import { commentsService } from '../comments/comments.service';
import { db } from '../../db';

export const commentsRoutes = new Elysia({ prefix: '/comments' })
    .use(authLayer)
    .onError(handleServiceError)
    .get('/', ({ query }) => commentsService.list(db, query), {
        query: commentQueryFilters,
        detail: {
            tags: ['Comments'],
            summary: 'List comments for an event',
            description:
                'Retrieve a flat list of comments for an event ordered by createdAt. Optionally filter by parentCommentId to fetch replies to a specific thread. Excludes soft-deleted comments.',
        },
    })
    .get('/:id', ({ params }) => commentsService.getById(db, params.id), {
        params: commentIdParam,
        detail: {
            tags: ['Comments'],
            summary: 'Get comment by ID',
            description: 'Retrieve a single comment by ID with its author.',
        },
    })
    .post(
        '/events/:eventId',
        ({ params, user, body }) =>
            commentsService.create(db, user.id, params.eventId, body),
        {
            auth: true,
            params: eventIdParam,
            body: createCommentBody,
            detail: {
                tags: ['Comments'],
                summary: 'Create comment on an event',
                description:
                    'Create a comment or a reply (via parentCommentId). Only the event organizer, joined participants, or users who marked interest can comment.',
            },
        }
    )
    .patch(
        '/:id',
        ({ params, user, body }) =>
            commentsService.update(db, params.id, user.id, body),
        {
            auth: true,
            params: commentIdParam,
            body: updateCommentBody,
            detail: {
                tags: ['Comments'],
                summary: 'Update a comment',
                description:
                    'Edit a comment. Only the author can update their own comment.',
            },
        }
    )
    .delete(
        '/:id',
        async ({ params, user, body }) => {
            await commentsService.delete(db, params.id, user, body.reason);
            return { success: true };
        },
        {
            auth: true,
            params: commentIdParam,
            body: deleteCommentBody,
            detail: {
                tags: ['Comments'],
                summary: 'Delete a comment',
                description:
                    'Soft-delete a comment. The author can always delete their own; admins can delete any comment and must provide a reason.',
            },
        }
    );
