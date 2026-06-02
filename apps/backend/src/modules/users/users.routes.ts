import { Elysia } from 'elysia';
import type { UsersService } from './users.service';
import { db } from '../../db';
import { eventIdParam, updateProfileSchema, userIdParam } from './users.schema';
import { handleServiceError } from '../../utils/error-handler';
import { authLayer } from '../../auth_middleware';
import { ServiceError } from '../../utils/errors';

export function createUsersRoutes(usersService: UsersService) {
    return new Elysia({ prefix: '/users' })
        .use(authLayer)
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
            ({ params: { userId }, user, body }) => {
                if (user.id !== userId) {
                    throw ServiceError.forbidden(
                        'You can only update your own profile'
                    );
                }
                return usersService.updateProfile(db, userId, body);
            },
            {
                auth: true,
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
            ({ params: { eventId } }) =>
                usersService.getUsersByEventId(db, eventId),
            {
                params: eventIdParam,
                detail: {
                    tags: ['Users'],
                    summary: 'Get participants by event',
                },
            }
        );
}
