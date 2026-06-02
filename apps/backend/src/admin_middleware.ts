import { Elysia } from 'elysia';
import { auth } from './auth';

export const adminLayer = new Elysia({ name: 'admin-layer' }).macro({
    admin: {
        async resolve({ status, request: { headers } }) {
            const session = await auth.api.getSession({ headers });

            if (!session) {
                return status(401);
            }
            if (session.user.role !== 'admin') {
                return status(403);
            }

            return {
                user: session.user,
                session: session.session,
            };
        },
    },
});
