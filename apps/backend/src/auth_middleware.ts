import { Elysia } from 'elysia';
import { auth } from './auth';

export const authLayer = new Elysia({ name: 'better-auth' })
    .mount(auth.handler)
    .macro({
        auth: {
            async resolve({ status, request: { headers } }) {
                // Retrieve the session using Better Auth's internal API
                const session = await auth.api.getSession({
                    headers,
                });

                if (!session) {
                    return status(401);
                }

                // Return user and session to make them available in the context
                return {
                    user: session.user,
                    session: session.session,
                };
            },
        },
    });
