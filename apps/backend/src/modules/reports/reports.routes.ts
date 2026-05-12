import { Elysia } from 'elysia';
import { reportsController } from './reports.controller';
import { createReportBody, myReportsQuery } from './reports.schema';
import { handleServiceError } from '../../utils/error-handler';
import { authLayer } from '../../auth_middleware';

export const reportsRoutes = new Elysia({ prefix: '/reports' })
    .use(authLayer)
    .onError(handleServiceError)
    .post('/', ({ user, body }) => reportsController.create(user, body), {
        auth: true,
        body: createReportBody,
        detail: {
            tags: ['Reports'],
            summary: 'Submit a report',
            description:
                'Submit a moderation report against an event, comment, or another user. The same reporter cannot file multiple pending reports against the same target.',
        },
    })
    .get('/me', ({ user, query }) => reportsController.listMine(user, query), {
        auth: true,
        query: myReportsQuery,
        detail: {
            tags: ['Reports'],
            summary: 'List my reports',
            description:
                'Retrieve a paginated list of reports submitted by the authenticated user, optionally filtered by status.',
        },
    });
