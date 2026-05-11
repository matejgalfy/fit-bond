import { Elysia } from 'elysia';
import { usersController } from './users.controller';
import {
    eventIdParam,
    updateProfileSchema,
    userIdParam,
    userNameParam,
} from './users.schema';
import { handleServiceError } from '../../utils/error-handler';

export const usersRoutes = new Elysia({ prefix: '/users' })
    .onError(handleServiceError)
    .get(
        '/:userId/profile',
        ({ params: { userId } }) => usersController.getUserProfile(userId),
        {
            params: userIdParam,
            detail: {
                tags: ['Users'],
                summary: 'Get user profile',
            },
        }
    )
    .patch(
        '/:userId/profile',
        ({ params: { userId }, body }) =>
            usersController.updateFullProfile(userId, body),
        {
            params: userIdParam,
            body: updateProfileSchema,
            detail: {
                tags: ['Users'],
                summary: 'Update profile',
            },
        }
    )
    .get(
        '/event/:eventId',
        ({ params: { eventId } }) => usersController.getUsersByEventId(eventId),
        {
            params: eventIdParam,
            detail: {
                tags: ['Users'],
                summary: 'Get participants by event',
            },
        }
    );
