import { Elysia } from 'elysia';
import { usersController } from './users.controller';
import {
    updateFullProfileSchema,
    userIdParam,
    userNameParam,
} from './users.schema';
import { handleServiceError } from '../../utils/error-handler';

export const usersRoutes = new Elysia({ prefix: '/users' })
    .onError(handleServiceError)
    .get(
        '/:userId/profile',
        ({ params: { userId } }) => usersController.getPublicProfile(userId),
        {
            params: userIdParam,
            detail: {
                tags: ['Users'],
                summary: 'Get public profile',
            },
        }
    )
    .put(
        '/:userId/profile',
        ({ params: { userId }, body }) =>
            usersController.updateFullProfile(userId, body),
        {
            params: userIdParam,
            body: updateFullProfileSchema,
            detail: {
                tags: ['Users'],
                summary: 'Update full profile',
            },
        }
    )
    .get(
        '/name/:name',
        ({ params: { name } }) => usersController.findUserByName(name),
        {
            params: userNameParam,
            detail: {
                tags: ['Users'],
                summary: 'Find user by name',
            },
        }
    );
