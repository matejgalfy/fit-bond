import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { openapi } from '@elysiajs/openapi';
import { staticPlugin } from '@elysiajs/static';
import { eventsRoutes } from './modules/events/events.routes';
import { participationRoutes } from './modules/participation/participation.routes';
import { sportsRoutes } from './modules/sports/sports.routes';
import { usersRoutes } from './modules/users/users.routes';
import { commentsRoutes } from './modules/comments/comments.routes';
import { notificationsRoutes } from './modules/notifications/notifications.routes';
import { uploadRoutes } from './modules/upload/upload.routes';
import { locationsRoutes } from './modules/locations/locations.routes';
import { adminRoutes } from './modules/admin/admin.routes';
import { reportsRoutes } from './modules/reports/reports.routes';
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
                    {
                        name: 'Participation',
                        description:
                            'Joining, leaving, and marking interest in events',
                    },
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
                    {
                        name: 'Admin',
                        description:
                            'Administrative moderation: user search, ban/unban, profile edits, and admin event search',
                    },
                    {
                        name: 'Reports',
                        description: 'User-submitted moderation reports',
                    },
                ],
            },
            exclude: { methods: ['OPTIONS'] },
        })
    )
    .use(staticPlugin({ assets: 'uploads', prefix: '/uploads' }))
    .use(uploadRoutes)
    .use(eventsRoutes)
    .use(participationRoutes)
    .use(sportsRoutes)
    .use(usersRoutes)
    .use(commentsRoutes)
    .use(notificationsRoutes)
    .use(locationsRoutes)
    .use(adminRoutes)
    .use(reportsRoutes)
    .listen(3000);

console.log('Server running on http://localhost:3000');
console.log('API documentation available at http://localhost:3000/openapi');
export type Backend = typeof app; // Crucial for end-to-end type safety
