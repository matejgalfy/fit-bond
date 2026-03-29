# FitBond Project Guidelines

FitBond is a social sports application for discovering, creating, and joining local sports events. See [docs/Requirements.md](../../docs/Requirements.md) for full product requirements.

## Stack

- **Monorepo**: Bun workspaces (`apps/backend`, `apps/frontend`)
- **Backend**: Elysia on Bun, PostgreSQL with Drizzle ORM, Zod validation
- **Frontend**: React 19 + TypeScript + Vite, `@elysiajs/eden` treaty client
- **Package manager**: Bun only — do not use npm, yarn, or pnpm

## Commands

```bash
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
| `<name>.types.ts` | TypeScript types (DB types from Drizzle, input types from Zod schemas) |
| `<name>.schema.ts` | Zod validation schemas, built with `createInsertSchema`/`createSelectSchema` from `drizzle-zod` |
| `<name>.model.ts` | Drizzle ORM queries — all functions accept `db: Database` parameter |
| `<name>.service.ts` | Business logic — uses factory pattern `createXxxService(model?)` for testable DI |
| `<name>.controller.ts` | HTTP adapter — validates input with Zod `.parse()`, extracts auth, injects `db`, calls service |
| `<name>.routes.ts` | Elysia plugin with route definitions and `onError` hook |
| `<name>.test.ts` | Unit tests using `bun:test` with mocked model layer |

Routes are registered in `apps/backend/src/index.ts` via `.use(xxxRoutes)`.

### Validation with Zod + drizzle-zod

Schemas are derived from the DB schema and refined with validation rules:

```typescript
import { createInsertSchema } from 'drizzle-zod';
import { events } from '../../db/schema';

export const createEventBody = createInsertSchema(events, {
    name: (schema) => schema.min(1).max(200),
    duration: (schema) => schema.min(15).max(480),
}).pick({ name: true, duration: true, /* ... */ });

export const updateEventBody = createEventBody
    .omit({ sportId: true, locationId: true })
    .partial();

// Types inferred from schemas
export type CreateEventBody = z.infer<typeof createEventBody>;
```

Validation runs in the controller via `.parse()`. `ZodError` is caught in each module's route-level `onError` hook and returned as 422.

### Error Handling Pattern

Services throw typed errors that routes catch:

```typescript
export class EventsServiceError extends Error {
    public readonly code: 'NOT_FOUND' | 'FORBIDDEN' | 'CONFLICT' | 'BAD_REQUEST';
    public readonly statusCode: number;
}
```

### Database

- Schema: `apps/backend/src/db/schema.ts` — 9 tables with explicit Drizzle relations
- Connection: `apps/backend/src/db/index.ts` — exports `db` instance and `Database` type
- Seeding: `apps/backend/src/db/seed.ts` — uses `drizzle-seed` + `@faker-js/faker`
- Auth placeholder: `x-user-id` header (until auth module is implemented)

### Testing Pattern

Services use factory DI for testability — pass a mock model instead of hitting the DB:

```typescript
const mockModel = { findAll: mock(() => Promise.resolve([])), /* ... */ };
const service = createEventsService(mockModel as unknown as EventsModel);
```

Use `expect.assertions(n)` with try/catch for error-throwing tests (avoids ESLint `await-thenable` issues with `rejects.toThrow`).

## Conventions
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
| admin, auth, comments, notifications, participation, profile, reports | Stub files only |
