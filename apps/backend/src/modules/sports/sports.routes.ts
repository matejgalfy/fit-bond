import { Elysia } from 'elysia';
import { sportsService } from './sports.service';
import { db } from '../../db';
import { createSportBody, sportIdParam } from './sports.schema';
import { handleServiceError } from '../../utils/error-handler';
import { authLayer } from '../../auth_middleware';

export const sportsRoutes = new Elysia({ prefix: '/sports' })
    .use(authLayer)
    .onError(handleServiceError)
    .get('/', () => sportsService.list(db), {
        detail: {
            tags: ['Sports'],
            summary: 'List sports',
            description:
                'Retrieve all available sports, ordered alphabetically by name.',
        },
    })
    .get('/:id', ({ params }) => sportsService.getById(db, params.id), {
        params: sportIdParam,
        detail: {
            tags: ['Sports'],
            summary: 'Get sport by ID',
            description: 'Retrieve a single sport by its UUID.',
        },
    })
    .post('/', ({ body }) => sportsService.create(db, body), {
        auth: true,
        body: createSportBody,
        detail: {
            tags: ['Sports'],
            summary: 'Create sport',
            description:
                'Create a new sport. Requires authentication. Sport names must be unique.',
        },
    })
    .delete('/:id', async ({ params }) => {
        await sportsService.delete(db, params.id);
        return { success: true };
    }, {
        auth: true,
        params: sportIdParam,
        detail: {
            tags: ['Sports'],
            summary: 'Delete sport',
            description:
                'Soft-delete a sport. Requires authentication. Existing events that reference the sport are preserved.',
        },
    });
