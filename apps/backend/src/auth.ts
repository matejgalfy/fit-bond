import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './db';
import { admin } from 'better-auth/plugins';
import { eventBus } from './lib/eventBus';

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const frontendOrigin = process.env.FRONTEND_URL;

if (!clientId || !clientSecret || !frontendOrigin) {
    throw new Error(
        'Google client ID, secret, and frontend origin must be set in environment variables.'
    );
}

export const auth = betterAuth({
    database: drizzleAdapter(db, { provider: 'pg' }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
    },
    socialProviders: {
        google: {
            clientId: clientId,
            clientSecret: clientSecret,
        },
    },
    plugins: [admin()],
    onAPIError: {
        errorURL: `${frontendOrigin}/auth/login`,
    },
    trustedOrigins: [frontendOrigin],
    user: {
        additionalFields: {
            role: {
                type: 'string',
                defaultValue: 'user',
                input: false,
            },
        },
    },

    databaseHooks: {
        user: {
            create: {
                after: async (user) => {
                    await eventBus.emit(db, 'user.registered', {
                        userId: user.id,
                        email: user.email,
                        name: user.name,
                    });
                },
            },
        },
    },
});
