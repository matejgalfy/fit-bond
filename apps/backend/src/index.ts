import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { openapi } from '@elysiajs/openapi';
import { staticPlugin } from '@elysiajs/static';
import { eventsRoutes } from './modules/events/events.routes';
import { sportsRoutes } from './modules/sports/sports.routes';
import { usersRoutes } from './modules/users/users.routes';
import { commentsRoutes } from './modules/comments/comments.routes';
import { notificationsRoutes } from './modules/notifications/notifications.routes';
import { uploadRoutes } from './modules/upload/upload.routes';
import { locationsRoutes } from './modules/locations/locations.routes';
import { authLayer } from './auth_middleware';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const app = new Elysia()
    .use(authLayer)
    .use(
        cors({
            credentials: true,
        })
    )
    .use(
        openapi({
            documentation: {
                info: {
                    title: 'FitBond API',
                    version: '1.0.0',
                    description:
                        'Social sports application for discovering, creating, and joining local sports events',
                },
                tags: [
                    { name: 'Events', description: 'Event management' },
                    { name: 'Sports', description: 'Sports catalog' },
                    { name: 'Users', description: 'User management' },
                    { name: 'Comments', description: 'Event comments' },
                    {
                        name: 'Notifications',
                        description: 'User notification management',
                    },
                    {
                        name: 'Locations',
                        description: 'Address geocoding and lookup',
                    },
                ],
            },
            exclude: { methods: ['OPTIONS'] },
        })
    )
    .use(staticPlugin({ assets: 'uploads', prefix: '/uploads' }))
    .use(uploadRoutes)
    .use(eventsRoutes)
    .use(sportsRoutes)
    .use(usersRoutes)
    .use(commentsRoutes)
    .use(notificationsRoutes)
    .use(locationsRoutes)
    .listen(3000);

console.log('Server running on http://localhost:3000');
console.log('API documentation available at http://localhost:3000/openapi');
export type Backend = typeof app; // Crucial for end-to-end type safety
