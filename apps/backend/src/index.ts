import { Elysia, t } from 'elysia';
import { cors } from '@elysiajs/cors';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const app = new Elysia()
    .use(cors())
    .get('/', () => 'Hello Bun!')
    .post('/greet', ({ body }) => `Hello ${body.name}`, {
        body: t.Object({
            name: t.String(),
        }),
    })
    .listen(3000);

export type Backend = typeof app; // Crucial for end-to-end type safety
