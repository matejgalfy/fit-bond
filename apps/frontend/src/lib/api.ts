import { treaty } from '@elysiajs/eden';
import type { Backend } from '../../../backend/src/index';
import { createAuthClient } from 'better-auth/react';
import { adminClient } from 'better-auth/client/plugins';

// Base URL for the REST API. In production the SPA and API share one origin,
// so this is the relative `/api` that the Caddy proxy strips before forwarding
// to the backend. In dev it points straight at the backend (no `/api`).
// Configured via VITE_API_URL.
export const apiUrl = import.meta.env.VITE_API_URL ?? '/api';

// Origin that serves uploaded files (the backend, at `/uploads`). Derived from
// apiUrl by dropping a trailing `/api` — same origin in production (''), the
// backend origin in dev.
export const filesBaseUrl = apiUrl.replace(/\/api$/, '');

// better-auth lives at `<origin>/api/auth` (the proxy preserves that path), so
// its client base is the origin itself. Same origin in production.
const authUrl = import.meta.env.VITE_AUTH_URL ?? window.location.origin;

// `keepDomain` stops Eden from rewriting a relative base: without it, treaty
// prepends a protocol to `/api` (→ `https:///api`), which the browser collapses
// into the host `api` (→ `https://api/...`). With it, `/api` stays relative and
// `fetch` resolves it against the page origin.
export const api = treaty<Backend>(apiUrl, {
    keepDomain: true,
    fetch: {
        credentials: 'include',
    },
});

export const authClient = createAuthClient({
    baseURL: authUrl,
    plugins: [adminClient()],
});
