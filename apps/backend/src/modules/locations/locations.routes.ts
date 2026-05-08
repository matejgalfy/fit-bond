import { Elysia } from 'elysia';
import { authLayer } from '../../auth_middleware';
import { handleServiceError } from '../../utils/error-handler';
import { locationsController } from './locations.controller';
import {
    locationSearchQuery,
    locationSuggestionsResponse,
} from './locations.schema';

export const locationsRoutes = new Elysia({ prefix: '/locations' })
    .use(authLayer)
    .onError(handleServiceError)
    .get('/search', ({ query }) => locationsController.search(query.q), {
        auth: true,
        query: locationSearchQuery,
        response: {
            200: locationSuggestionsResponse,
        },
        detail: {
            tags: ['Locations'],
            summary: 'Search address suggestions',
            description:
                'Returns autocomplete suggestions from the configured geocoding provider (LocationIQ).',
        },
    });
