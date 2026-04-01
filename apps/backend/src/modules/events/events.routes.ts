import { Elysia } from 'elysia';
import { eventsController } from './events.controller';
import { EventsServiceError } from './events.service';
import {
    createEventBody,
    updateEventBody,
    cancelEventBody,
    eventQueryFilters,
    eventIdParam,
} from './events.schema';

export const eventsRoutes = new Elysia({ prefix: '/events' })
    .onError(({ error, set }) => {
        if (error instanceof EventsServiceError) {
            set.status = error.statusCode;
            return { error: error.message, code: error.code };
        }
    })
    .get('/', ({ query }) => eventsController.list(query), {
        query: eventQueryFilters,
        detail: {
            tags: ['Events'],
            summary: 'List events',
            description:
                'Retrieve a paginated list of events with optional filtering by sport, skill level, city, date range, and search term.',
        },
    })
    .get('/:id', ({ params }) => eventsController.getById(params.id), {
        params: eventIdParam,
        detail: {
            tags: ['Events'],
            summary: 'Get event by ID',
            description:
                'Retrieve detailed information about a specific event.',
        },
    })
    .post('/', ({ headers, body }) => eventsController.create(headers, body), {
        body: createEventBody,
        detail: {
            tags: ['Events'],
            summary: 'Create event',
            description:
                'Create a new sports event. Requires x-user-id header.',
        },
    })
    .patch(
        '/:id',
        ({ params, headers, body }) =>
            eventsController.update(params.id, headers, body),
        {
            params: eventIdParam,
            body: updateEventBody,
            detail: {
                tags: ['Events'],
                summary: 'Update event',
                description:
                    'Partially update an existing event. Requires x-user-id header.',
            },
        }
    )
    .post(
        '/:id/cancel',
        ({ params, headers, body }) =>
            eventsController.cancel(params.id, headers, body),
        {
            params: eventIdParam,
            body: cancelEventBody,
            detail: {
                tags: ['Events'],
                summary: 'Cancel event',
                description:
                    'Cancel an event with an optional reason. Requires x-user-id header.',
            },
        }
    )
    .delete(
        '/:id',
        ({ params, headers }) => eventsController.delete(params.id, headers),
        {
            params: eventIdParam,
            detail: {
                tags: ['Events'],
                summary: 'Delete event',
                description: 'Soft-delete an event. Requires x-user-id header.',
            },
        }
    );
