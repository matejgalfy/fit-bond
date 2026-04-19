import { Elysia } from 'elysia';
import { eventsController } from './events.controller';
import {
    createEventBody,
    updateEventBody,
    cancelEventBody,
    eventQueryFilters,
    eventIdParam,
    userIdParam,
    eventStatsResponse,
} from './events.schema';
import { handleServiceError } from '../../utils/error-handler';

export const eventsRoutes = new Elysia({ prefix: '/events' })
    .onError(handleServiceError)
    .get('/', ({ query }) => eventsController.list(query), {
        query: eventQueryFilters,
        detail: {
            tags: ['Events'],
            summary: 'List events',
            description:
                'Retrieve a paginated list of events with optional filtering by sport, skill level, city, date range, search term, and user relationship. Use userRelation (organized/joined/interested) to get events with specific user relationships. Use excludeUserInteractions=true to get events the user has no interaction with (for discovery). Both require userId parameter.',
        },
    })
    .get(
        '/stats/:userId',
        ({ params }) => eventsController.getStatsByUserId(params.userId),
        {
            params: userIdParam,
            response: eventStatsResponse,
            detail: {
                tags: ['Events'],
                summary: 'Get event statistics for a user',
                description:
                    'Returns the count of events organized, joined, and interested by a specific user.',
            },
        }
    )
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
