# FitBond Project Guidelines

FitBond is a social sports application for discovering, creating, and joining local sports events. See [docs/Requirements.md](../../docs/Requirements.md) for full product requirements.

## Stack

- **Monorepo**: Bun workspaces (`apps/backend`, `apps/frontend`)
- **Backend**: Elysia on Bun, PostgreSQL with Drizzle ORM, `t` from Elysia for validation, better-auth for authentication
- **Frontend**: React 19 + TypeScript + Vite, `@elysiajs/eden` treaty client
- **Routing**: TanStack Start in SPA mode — file-based routing under `src/routes/`
- **Server state**: React Query (`@tanstack/react-query`) — all API calls go through query/mutation hooks
- **UI components**: Shadcn/ui — components live in `src/components/ui/`, generated via `bunx --bun shadcn@latest add <component>`
- **Styling**: Tailwind CSS — utility classes only, no custom CSS except in `src/index.css` for global tokens
- **Package manager**: Bun only — do not use npm, yarn, or pnpm

## Commands

```bash
# Frontend (from apps/frontend/)
bunx --bun shadcn@latest add <component>   # Add a Shadcn component

# Root level
bun install                  # Install all dependencies
bun run dev                  # Start backend (3000) + frontend (5173)
bun run dev:backend          # Backend only
bun run dev:frontend         # Frontend only
bun run lint                 # Lint both apps
bun format                   # Format all code with Prettier

# Backend (from apps/backend/)
bun test                     # Run all backend tests
bun test src/modules/events  # Run tests for one module
bun test --test-name-pattern "cancel"  # Run tests matching a pattern
bun run dev                  # Start with hot-reload
bun run db:setup             # Docker DB + migrate + seed (first-time setup)
bun run db:seed              # Re-seed database with test data
bun run drizzle:push         # Push schema changes (dev only)
bun run drizzle:migrate      # Create + run migration

# Frontend (from apps/frontend/)
bun run dev                  # Vite dev server
bun run build                # Production build
bun run lint                 # ESLint
```

## Architecture

### Frontend Architecture

#### Routing (TanStack Start — SPA mode)
- File-based routes in `src/routes/`
- Root layout: `src/routes/__root.tsx`
- Index route: `src/routes/index.tsx`
- Nested routes: `src/routes/<segment>/route.tsx` (layout) + `src/routes/<segment>/index.tsx`
- Use `createFileRoute` / `createRootRoute` from `@tanstack/react-router`
- SPA mode only — no SSR, no server functions; data loading via React Query in route `loader` or component

#### Data Fetching (React Query)
- All backend calls go through React Query hooks (`useQuery`, `useMutation`, `useInfiniteQuery`)
- Query keys follow the pattern `['resource', { filters }]` — e.g. `['events', { sportId }]`
- API client (`treaty`) is a singleton exported from `src/lib/api.ts`
- Keep query/mutation hooks co-located with the feature they serve (e.g. `src/features/events/hooks.ts`)

#### Component Library (Shadcn + shared components)
- `src/components/ui/` — Shadcn-generated primitives (Button, Card, Input, …); **do not edit these manually**, re-generate if needed
- `src/components/` — shared composite components built on top of Shadcn primitives
- Feature-specific components live in `src/features/<name>/components/`

#### Styling (Tailwind CSS)
- Use Tailwind utility classes directly in JSX; avoid writing new CSS files
- Design tokens (colors, spacing) configured in `tailwind.config.ts`, reflected as CSS variables in `src/index.css`
- Use `cn()` from `src/lib/utils.ts` (Shadcn-provided) for conditional/merged class names

---

### End-to-End Type Safety

The backend exports `type Backend = typeof app` from `apps/backend/src/index.ts`. The frontend imports this type to create a fully typed API client:

```typescript
// apps/frontend/src/App.tsx
import { treaty } from '@elysiajs/eden';
import type { Backend } from '../../backend/src/index';
const client = treaty<Backend>('localhost:3000');
```

Changing an endpoint contract requires updating both backend and frontend together.

### Backend Module Pattern

Each module in `apps/backend/src/modules/<name>/` follows a layered architecture:

| File | Responsibility |
|------|---------------|
| `<name>.types.ts` | TypeScript types (DB types from Drizzle, input types inferred from `t` schemas) |
| `<name>.schema.ts` | Elysia `t` schemas for request/response validation |
| `<name>.model.ts` | Drizzle ORM queries — all functions accept `db: Database` parameter |
| `<name>.service.ts` | Business logic — uses factory pattern `createXxxService(model?)` for testable DI |
| `<name>.controller.ts` | HTTP adapter — extracts auth user from context, injects `db`, calls service |
| `<name>.routes.ts` | Elysia plugin with route definitions and `onError` hook |
| `<name>.test.ts` | Unit tests using `bun:test` with mocked model layer |

Routes are registered in `apps/backend/src/index.ts` via `.use(xxxRoutes)`.

### Validation with Elysia `t`

Schemas are defined using `t` from Elysia and passed directly to route handler options — Elysia validates automatically before the handler runs:

```typescript
import { t } from 'elysia';

export const createEventBody = t.Object({
    name: t.String({ minLength: 1, maxLength: 200 }),
    duration: t.Number({ minimum: 15, maximum: 480 }),
    sportId: t.String({ format: 'uuid' }),
    // ...
});

export const updateEventBody = t.Object({
    name: t.Optional(t.String({ minLength: 1, maxLength: 200 })),
    // ...
});

// Types inferred from schemas
export type CreateEventBody = typeof createEventBody.static;
```

Pass schemas to routes via options: `{ body: createEventBody, params: eventIdParam, query: eventQueryFilters }`. Validation errors are automatically returned as 422.

### Error Handling Pattern

Services throw typed errors that routes catch:

```typescript
export class EventsServiceError extends Error {
    public readonly code: 'NOT_FOUND' | 'FORBIDDEN' | 'CONFLICT' | 'BAD_REQUEST';
    public readonly statusCode: number;
}
```

### Authentication (better-auth)

Auth is implemented with `better-auth` + `drizzleAdapter`:

- Config: `apps/backend/src/auth.ts` — email/password + Google OAuth, trusted origin `http://localhost:5173`
- Middleware: `apps/backend/src/auth_middleware.ts` — `authLayer` Elysia plugin that mounts `auth.handler` and exposes an `auth` macro
- Protected routes declare `auth: true` in their route options; Elysia injects `user` and `session` into the handler context
- Unauthenticated requests to protected routes receive a 401 automatically

```typescript
// Protect a route
app.post('/events', handler, { auth: true, body: createEventBody });

// Access the authenticated user in the handler
({ body, user }) => eventsController.create(db, body, user)
```

### Database

- Schema: `apps/backend/src/db/schema.ts` — tables include `user`, `session`, `account` (better-auth) plus domain tables
- Connection: `apps/backend/src/db/index.ts` — exports `db` instance and `Database` type
- Seeding: `apps/backend/src/db/seed.ts` — uses `drizzle-seed` + `@faker-js/faker`

### Testing Pattern

Services use factory DI for testability — pass a mock model instead of hitting the DB:

```typescript
const mockModel = { findAll: mock(() => Promise.resolve([])), /* ... */ };
const service = createEventsService(mockModel as unknown as EventsModel);
```

Use `expect.assertions(n)` with try/catch for error-throwing tests (avoids ESLint `await-thenable` issues with `rejects.toThrow`).

## Conventions
- Do not write raw CSS for components — use Tailwind classes
- Use `cn()` from `src/lib/utils.ts` for conditional/merged class names
- Shadcn components in `src/components/ui/` are auto-generated — do not edit them manually; re-generate if needed
- All backend data fetching must go through React Query hooks, never direct `await client.xxx.get()` in components
- Route params and search params must be validated using `zodValidator` from TanStack Router (frontend) or `t` schemas (backend)
- After every change ensure `bun test` and `bun lint` passes with no errors
- Use `import type { X }` for type-only imports
- Do not weaken tsconfig strict settings
- Frontend uses Vite
- Do not introduce Express, ws, pg, better-sqlite3, ioredis, or dotenv
- Run `bun format` before committing
- Soft deletes use `deletedAt` timestamp fields
- Array results use `results.length === 0 ? null : results[0]` pattern (not `.at(0)` — ESLint can't resolve Drizzle types with `.at()`)

## Modules Status

| Module | Status |
|--------|--------|
| events | ✅ Implemented (CRUD, cancel, filtering, tests) |
| auth | ✅ Implemented (better-auth — email/password + Google OAuth) |
| admin, comments, notifications, participation, profile, reports | Stub files only |
