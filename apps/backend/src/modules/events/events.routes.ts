import { Elysia } from 'elysia';
import { eventsController } from './events.controller';
import { EventsServiceError } from './events.service';
import { ZodError } from 'zod';

export const eventsRoutes = new Elysia({ prefix: '/events' })
    .onError(({ error, set }) => {
        if (error instanceof EventsServiceError) {
            set.status = error.statusCode;
            return { error: error.message, code: error.code };
        }
        if (error instanceof ZodError) {
            set.status = 422;
            return { error: 'Validation failed', issues: error.issues };
        }
    })
    .get('/', ({ query }) => eventsController.list(query))
    .get('/:id', ({ params }) => eventsController.getById(params.id))
    .post('/', ({ headers, body }) => eventsController.create(headers, body))
    .patch('/:id', ({ params, headers, body }) =>
        eventsController.update(params.id, headers, body)
    )
    .post('/:id/cancel', ({ params, headers, body }) =>
        eventsController.cancel(params.id, headers, body)
    )
    .delete('/:id', ({ params, headers }) =>
        eventsController.delete(params.id, headers)
    );
