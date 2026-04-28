import { Elysia } from 'elysia';
import { sportsController } from './sports.controller';
import { createSportBody, sportIdParam } from './sports.schema';
import { handleServiceError } from '../../utils/error-handler';
import { authLayer } from '../../auth_middleware';

export const sportsRoutes = new Elysia({ prefix: '/sports' })
    .use(authLayer)
    .onError(handleServiceError)
    .get('/', () => sportsController.list(), {
        detail: {
            tags: ['Sports'],
            summary: 'List sports',
            description:
                'Retrieve all available sports, ordered alphabetically by name.',
        },
    })
    .get('/:id', ({ params }) => sportsController.getById(params.id), {
        params: sportIdParam,
        detail: {
            tags: ['Sports'],
            summary: 'Get sport by ID',
            description: 'Retrieve a single sport by its UUID.',
        },
    })
    .post('/', ({ body }) => sportsController.create(body), {
        auth: true,
        body: createSportBody,
        detail: {
            tags: ['Sports'],
            summary: 'Create sport',
            description:
                'Create a new sport. Requires authentication. Sport names must be unique.',
        },
    })
    .delete('/:id', ({ params }) => sportsController.delete(params.id), {
        auth: true,
        params: sportIdParam,
        detail: {
            tags: ['Sports'],
            summary: 'Delete sport',
            description:
                'Soft-delete a sport. Requires authentication. Existing events that reference the sport are preserved.',
        },
    });
