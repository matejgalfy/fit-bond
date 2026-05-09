import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './db';
import { emailService } from './modules/email/email.service';

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!clientId || !clientSecret) {
    throw new Error(
        'Google client ID and secret must be set in environment variables.'
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
    trustedOrigins: ['http://localhost:5173'],

    databaseHooks: {
        user: {
            create: {
                after: async (user) => {
                    emailService.sendWelcomeEmail(user.email, user.name)
                        .catch(err => console.error('Failed to send welcome email:', err));
                }
            }
        }
    }
});
