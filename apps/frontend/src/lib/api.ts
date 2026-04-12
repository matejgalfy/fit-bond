import { treaty } from '@elysiajs/eden';
import type { Backend } from '../../../backend/src/index';
import { createAuthClient } from 'better-auth/react';

const api_url = 'http://localhost:3000';

// TODO: move the API base URL to env file.
export const api = treaty<Backend>(api_url);

export const authClient = createAuthClient({
    baseURL: api_url,
});
