import { Elysia } from 'elysia';
import { commentsController } from './comments.controller';
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

export const commentsRoutes = new Elysia({ prefix: '/comments' })
    .use(authLayer)
    .onError(handleServiceError)
    .get('/', ({ query }) => commentsController.list(query), {
        query: commentQueryFilters,
        detail: {
            tags: ['Comments'],
            summary: 'List comments for an event',
            description:
                'Retrieve a flat list of comments for an event ordered by createdAt. Optionally filter by parentCommentId to fetch replies to a specific thread. Excludes soft-deleted comments.',
        },
    })
    .get('/:id', ({ params }) => commentsController.getById(params.id), {
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
            commentsController.create(user, params.eventId, body),
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
            commentsController.update(params.id, user, body),
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
        ({ params, user, body }) =>
            commentsController.delete(params.id, user, body),
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
