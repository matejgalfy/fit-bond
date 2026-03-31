/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    verbose: true,
    dialect: 'postgresql',
    schema: './src/db/schema.ts',
    out: './drizzle',
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
});
