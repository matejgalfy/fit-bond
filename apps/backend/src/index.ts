import { Elysia, t } from 'elysia';
import { cors } from '@elysiajs/cors';
import { eventsRoutes } from './modules/events/events.routes';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const app = new Elysia()
    .use(cors())
    .use(eventsRoutes)
    .get('/', () => 'Hello Bun!')
    .post('/greet', ({ body }) => `Hello ${body.name}`, {
        body: t.Object({
            name: t.String(),
        }),
    })
    .listen(3000);

export type Backend = typeof app; // Crucial for end-to-end type safety
