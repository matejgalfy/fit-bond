import { Elysia, status} from 'elysia';
import { usersController } from './users.controller';
import { ZodError } from 'zod';
import { updateFullProfileSchema } from './users.schema';

export const usersRoutes = new Elysia({ prefix: '/users' })
    .onError(({ error, set }) => {
        if (error instanceof ZodError) {
            set.status = 422;
            return status(422, { message: 'Validation failed', issues: error.issues });        }
    })
    .get(
        '/:userId/profile',
        ({ params: { userId } }) => usersController.getPublicProfile(userId),
        {
            detail: {
                tags: ['Users'],
                summary: 'Get public profile',
            },
        }
    )
    .put(
        '/:userId/profile',
        ({ params: { userId }, body }) => {
            const validatedData = updateFullProfileSchema.parse(body);

            return usersController.updateFullProfile(userId, validatedData);
        },
        {
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
            detail: {
                tags: ['Users'],
                summary: 'Find user by name',
            },
        }
    );
