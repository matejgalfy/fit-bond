# FitBond Project Guidelines

## Overview

FitBond is a social sports application enabling users to discover, create, and join sports events with their local community. For detailed requirements, see [docs/Requirements.md](../../docs/Requirements.md).

**For developer setup**, see [README.md](../../README.md) for quick start guide, database setup, and available commands.

## Stack and Architecture

- **Monorepo**: Bun workspaces
- **Backend**: Elysia on Bun (Node.js alternative) in `apps/backend/`
    - Database: PostgreSQL with Drizzle ORM
    - Exports type `Backend` (not `App`) for end-to-end type safety
- **Frontend**: React + TypeScript + Vite in `apps/frontend/`
- **Package management**: Bun (not npm/yarn/pnpm)

## Development Commands

**Root level (from workspace root):**

```bash
bun install               # Install all dependencies
bun run dev              # Start both backend (3000) and frontend (5173)
bun run dev:backend      # Start backend only
bun run dev:frontend     # Start frontend only
bun format               # Format all code
```

**Backend specific** (from `apps/backend/`):

```bash
bun run dev              # Start with hot-reload
bun run db:seed          # Seed database with realistic test data
bun run drizzle:migrate  # Run migrations
bun run drizzle:push     # Push schema to database
bun run drizzle:studio   # Open GUI database explorer
bun test                 # Run tests (basic setup exists)
```

**Frontend specific** (from `apps/frontend/`):

```bash
bun run dev              # Start Vite dev server
bun run build            # Build for production
bun run lint             # Run ESLint
bun run preview          # Preview production build locally
```

## Architecture Boundaries

**Backend:**

- Main entry point: [apps/backend/src/index.ts](../../apps/backend/src/index.ts)
- Database schema: [apps/backend/src/db/schema.ts](../../apps/backend/src/db/schema.ts)
- Database seeder: [apps/backend/src/db/seed.ts](../../apps/backend/src/db/seed.ts) (generates realistic test data)
- Exports: `export type Backend = typeof app` (critical for client-side type safety)

**Frontend:**

- Main entry point: [apps/frontend/src/main.tsx](../../apps/frontend/src/main.tsx)
- Root component: [apps/frontend/src/App.tsx](../../apps/frontend/src/App.tsx)
- Uses Vite for bundling and HMR

**API Contract:**

- Backend endpoints use Elysia validation (e.g., `t.Object({ ... })`)
- Frontend calls backend via end-to-end typed client generated from `Backend` type
- Changes to endpoint contracts must update both backend and frontend in the same task

## Coding Conventions

**Runtime and Tools:**

- Always use Bun commands (`bun run`, `bun install`, `bun test`, etc.). Do not use npm, yarn, or pnpm.
- Prefer Bun-native APIs: `Bun.serve()`, `Bun.file`, `Bun.$``, `bun:sqlite`, `Bun.redis`, `Bun.sql`
- **Do NOT introduce** Express, ws, pg, better-sqlite3, ioredis, dotenv, or competing tools unless explicitly requested
- Bun automatically loads `.env` files; no dotenv setup needed

**TypeScript:**

- Keep TypeScript strictness intact (see existing [tsconfig.json](../../tsconfig.json))
- Use explicit type-only imports: `import type { Thing } from 'module'`
- Never weaken tsconfig settings (`strict: false`, `noImplicitAny: false`, etc.)
- Frontend follows its own [tsconfig.app.json](../../apps/frontend/tsconfig.app.json)

**Code Style:**

- Follow existing ESLint and Prettier configuration
- Run `bun format` before committing
- Keep changes minimal and localized; avoid unrelated refactors
- Do not delete user-authored comments describing critical behavior

## Database and ORM (Drizzle)

- Schema is in [apps/backend/src/db/schema.ts](../../apps/backend/src/db/schema.ts)
- Write ORM operations using Drizzle patterns
- Define relationships explicitly in schema relations
- Never modify schema manually; always use migrations
- To test schema changes locally: `bun run drizzle:push` (overwrites schema) or `bun run drizzle:migrate` (creates migration file)

**Seeding:**

- Realistic test data comes from [apps/backend/src/db/seed.ts](../../apps/backend/src/db/seed.ts)
- Uses `drizzle-seed` with `@faker-js/faker` for realistic names, emails, locations, etc.
- Run: `bun run db:seed` after migrations
- Edit seed script to adjust data generation or add new entities

## API and Validation Patterns

**Endpoint Definition (Elysia):**

```typescript
app.post(
    '/endpoint-path',
    ({ body }) => {
        // handler
    },
    {
        body: t.Object({
            field: t.String(),
            count: t.Number(),
        }),
    }
);
```

**Key Rules:**

- Always define request schemas explicitly using Elysia `t` validators
- Response types are inferred; add JSDoc if unclear
- Keep response shapes stable—frontend already depends on them
- If you must change a contract: update both backend and frontend in the same commit/PR
- Test endpoint with the seed database to verify realistic scenarios

**Frontend API Usage:**

```typescript
// End-to-end typed client from backend
import { client } from '@/api';

const response = await client['endpoint-path'].post({
    field: 'value',
    count: 5,
});
```

## Editing and Safety

- **Minimal changes**: Focus on the task at hand; avoid refactoring unrelated code
- **Preserve intent**: Keep comments that explain _why_ something is done, delete _how_ comments
- **Stability**: When features already exist, don't replace them unless explicitly asked
- **Test data**: Use seeded database to verify new endpoints work with realistic data
- **Documentation**: Update [docs/](../../docs/) files if requirements change; link from [README.md](../../README.md) if it's developer-facing

## Known Pitfalls and Current State

- **Frontend runs on Vite**, not `Bun.serve()` with HTML imports. Use Vite scripts as source of truth for dev/build/lint
- **Backend type export**: Named `Backend`, not `App`. Preserve `export type Backend = typeof app`
- **No backend tests yet**: Do not fabricate test commands; if tests are needed, set them up properly
- **Seed script**: Uses Drizzle Seed with Faker for realistic data—regenerate if schema changes
- **New developers**: Point to [README.md](../../README.md) for setup (Docker database, environment variables, etc.)

## Feature Development Checklist

When adding a new feature:

1. **Database**: Update schema in [apps/backend/src/db/schema.ts](../../apps/backend/src/db/schema.ts) if needed
    - Run `bun run drizzle:push` or create migrations
    - Update seed script if new data types needed

2. **Backend API**: Add endpoint(s) to [apps/backend/src/index.ts](../../apps/backend/src/index.ts)
    - Define Elysia validators explicitly
    - Test manually with seeded data

3. **Frontend**: Update UI in [apps/frontend/src/](../../apps/frontend/src/)
    - Use end-to-end typed API client
    - Keep component structure flat per existing patterns

4. **Testing**: If critical, add test case (backend tests are minimal for now)

5. **Documentation**: If user-facing, update [docs/Requirements.md](../../docs/Requirements.md); if dev-facing, update [README.md](../../README.md)
