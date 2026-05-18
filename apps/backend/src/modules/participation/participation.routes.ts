import { Elysia } from 'elysia';
import { participationController } from './participation.controller';
import { eventIdParam, participantsResponse } from './participation.schema';
import { handleServiceError } from '../../utils/error-handler';
import { authLayer } from '../../auth_middleware';

export const participationRoutes = new Elysia({ prefix: '/events' })
    .use(authLayer)
    .onError(handleServiceError)
    .get(
        '/:id/participants',
        ({ params }) => participationController.listParticipants(params.id),
        {
            params: eventIdParam,
            response: participantsResponse,
            detail: {
                tags: ['Participation'],
                summary: 'List joined participants',
                description:
                    'Retrieve the users who have joined a specific event.',
            },
        }
    )
    .get(
        '/:id/interested',
        ({ params }) => participationController.listInterested(params.id),
        {
            params: eventIdParam,
            response: participantsResponse,
            detail: {
                tags: ['Participation'],
                summary: 'List interested users',
                description:
                    'Retrieve the users who have marked interest in a specific event.',
            },
        }
    )
    .post(
        '/:id/join',
        ({ params, user }) => participationController.join(params.id, user),
        {
            auth: true,
            params: eventIdParam,
            detail: {
                tags: ['Participation'],
                summary: 'Join an event',
                description:
                    'Join an event as a participant. Clears any existing interest mark. Requires authentication.',
            },
        }
    )
    .delete(
        '/:id/join',
        ({ params, user }) => participationController.leave(params.id, user),
        {
            auth: true,
            params: eventIdParam,
            detail: {
                tags: ['Participation'],
                summary: 'Leave an event',
                description:
                    'Leave an event you have joined. Requires authentication.',
            },
        }
    )
    .post(
        '/:id/interest',
        ({ params, user }) =>
            participationController.markInterest(params.id, user),
        {
            auth: true,
            params: eventIdParam,
            detail: {
                tags: ['Participation'],
                summary: 'Mark interest in an event',
                description:
                    'Mark interest in an event. Not allowed if you have already joined. Requires authentication.',
            },
        }
    )
    .delete(
        '/:id/interest',
        ({ params, user }) =>
            participationController.unmarkInterest(params.id, user),
        {
            auth: true,
            params: eventIdParam,
            detail: {
                tags: ['Participation'],
                summary: 'Unmark interest in an event',
                description:
                    'Remove your interest mark from an event. Requires authentication.',
            },
        }
    );
