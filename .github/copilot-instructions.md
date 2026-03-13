# Project Guidelines

## Stack and Scope
- Monorepo with Bun workspaces.
- Backend: Elysia on Bun in apps/backend.
- Frontend: React + TypeScript in apps/frontend.
- Product scope reference: docs/Requirements.md.

## Build, Run, and Lint
- Use Bun commands by default.
- Install dependencies: bun install.
- Start both apps: bun run dev (from workspace root).
- Start backend only: bun run dev:backend.
- Start frontend only: bun run dev:frontend.
- Frontend lint: bun --filter frontend run lint.
- Frontend build: bun --filter frontend run build.
- Backend tests are not implemented yet; do not invent a fake test command.

## Architecture Boundaries
- Backend API lives in apps/backend/src/index.ts.
- Frontend app lives in apps/frontend/src.
- Frontend uses end-to-end typed API calls via @elysiajs/eden treaty and imports type App from backend.
- Keep export type App = typeof app in backend to preserve typed client-server integration.

## Coding Conventions
- Prefer Bun-native tooling and APIs when adding runtime/server code.
- Do not introduce Express, ws, pg, better-sqlite3, ioredis, or dotenv unless explicitly requested.
- Keep TypeScript strictness intact; avoid weakening tsconfig settings.
- Use explicit type-only imports where appropriate.
- Follow existing ESLint and TypeScript configuration in apps/frontend.

## API and Validation Patterns
- When adding backend endpoints, define request validation schemas explicitly (Elysia t.Object pattern).
- Keep endpoint behavior and response shape stable when frontend already depends on it.
- If endpoint contracts change, update frontend usage in the same task.

## Editing and Safety
- Keep changes minimal and localized; avoid unrelated refactors.
- Do not delete user-authored comments that describe critical behavior.
- When modifying requirements or docs-driven behavior, align with docs/Requirements.md unless user instructions override it.

## Known Pitfalls
- Frontend currently runs on Vite scripts; use existing scripts as source of truth for frontend dev/build/lint commands.
- Backend currently exposes only simple starter endpoints; new feature work should extend existing structure rather than replacing it.