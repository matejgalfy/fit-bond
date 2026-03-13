import { Elysia, t } from 'elysia';
import { cors } from '@elysiajs/cors';

const app = new Elysia()
    .use(cors())
    .get('/', () => 'Hello Bun!')
    .post('/greet', ({ body }) => `Hello ${body.name}`, {
        body: t.Object({
            name: t.String()
        })
    })
    .listen(3000);

export type App = typeof app; // Crucial for end-to-end type safety
console.log(`Backend running at ${app.server?.hostname}:${app.server?.port}`);