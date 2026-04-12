import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { openapi } from '@elysiajs/openapi';
import { z } from 'zod';
import { eventsRoutes } from './modules/events/events.routes';
import { auth } from './auth';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const app = new Elysia()
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
                tags: [{ name: 'Events', description: 'Event management' }],
            },
            mapJsonSchema: { zod: z.toJSONSchema },
            exclude: { methods: ['OPTIONS'] },
        })
    )
    .mount(auth.handler) // Mount authentication routes
    .use(eventsRoutes)
    .listen(3000);

console.log('Server running on http://localhost:3000');
console.log('API documentation available at http://localhost:3000/openapi');
export type Backend = typeof app; // Crucial for end-to-end type safety
