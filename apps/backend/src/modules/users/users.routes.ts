import { Elysia } from 'elysia';
import { usersService } from './users.service';
import { db } from '../../db';
import { eventIdParam, updateProfileSchema, userIdParam } from './users.schema';
import { handleServiceError } from '../../utils/error-handler';

export const usersRoutes = new Elysia({ prefix: '/users' })
    .onError(handleServiceError)
    .get(
        '/:userId/profile',
        ({ params: { userId } }) => usersService.getUserProfile(db, userId),
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
            usersService.updateProfile(db, userId, body),
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
        ({ params: { eventId } }) => usersService.getUsersByEventId(db, eventId),
        {
            params: eventIdParam,
            detail: {
                tags: ['Users'],
                summary: 'Get participants by event',
            },
        }
    );
