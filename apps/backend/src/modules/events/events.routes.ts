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
import { authLayer } from '../../auth_middleware';

export const eventsRoutes = new Elysia({ prefix: '/events' })
    .use(authLayer)
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
            auth: true,
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
    .post('/', ({ user, body }) => eventsController.create(user, body), {
        auth: true,
        body: createEventBody,
        detail: {
            tags: ['Events'],
            summary: 'Create event',
            description: 'Create a new sports event.',
        },
    })
    .patch(
        '/:id',
        ({ params, user, body }) =>
            eventsController.update(params.id, user, body),
        {
            auth: true,
            params: eventIdParam,
            body: updateEventBody,
            detail: {
                tags: ['Events'],
                summary: 'Update event',
                description:
                    'Partially update an existing event. Requires user authentication.',
            },
        }
    )
    .post(
        '/:id/cancel',
        ({ params, user, body }) =>
            eventsController.cancel(params.id, user, body),
        {
            auth: true,
            params: eventIdParam,
            body: cancelEventBody,
            detail: {
                tags: ['Events'],
                summary: 'Cancel event',
                description:
                    'Cancel an event with an optional reason. Requires user authentication.',
            },
        }
    )
    .delete(
        '/:id',
        ({ params, user }) => eventsController.delete(params.id, user),
        {
            auth: true,
            params: eventIdParam,
            detail: {
                tags: ['Events'],
                summary: 'Delete event',
                description:
                    'Soft-delete an event. Requires user authentication.',
            },
        }
    );
