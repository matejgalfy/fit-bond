import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './db';
import { admin } from 'better-auth/plugins';
import { eventBus } from './lib/eventBus';

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const frontendOrigin = process.env.FRONTEND_URL;

if (!frontendOrigin) {
    throw new Error('FRONTEND_URL must be set in environment variables.');
}

// Google sign-in is optional: without credentials only email/password works,
// and the frontend hides the Google button (it reads GET /auth-config).
export const googleAuthEnabled = Boolean(clientId && clientSecret);
if (!googleAuthEnabled) {
    console.warn(
        'GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET not set: Google sign-in is disabled.'
    );
}

export const auth = betterAuth({
    database: drizzleAdapter(db, { provider: 'pg' }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
    },
    socialProviders:
        clientId && clientSecret ? { google: { clientId, clientSecret } } : {},
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
