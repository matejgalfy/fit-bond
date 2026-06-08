# FitBond - Developer Guide

[FitBond](https://fit-bond.app)

FitBond is a social sports application that helps people find others to exercise with, create sport events, and build a local activity community.

## Tech Stack

- **Runtime / package manager**: [Bun](https://bun.sh) (workspaces monorepo — `apps/backend`, `apps/frontend`)
- **Backend**: [Elysia](https://elysiajs.com) on Bun, organized into layered domain modules; request/response validation with Elysia's `t`; OpenAPI docs via `@elysiajs/openapi`
- **Frontend**: React 19 + TypeScript + [Vite](https://vite.dev), [TanStack Router](https://tanstack.com/router) (file-based, SPA mode), [TanStack Query](https://tanstack.com/query) for all server state
- **UI / styling**: [Shadcn/ui](https://ui.shadcn.com) + [Tailwind CSS v4](https://tailwindcss.com)
- **Database**: PostgreSQL with [Drizzle ORM](https://orm.drizzle.team) + versioned migrations
- **Auth**: [better-auth](https://better-auth.com) — email/password + Google OAuth, role-based admin
- **Type safety**: the backend exports its app type and the frontend consumes it through the [`@elysiajs/eden`](https://elysiajs.com/eden/overview.html) treaty client (end-to-end typed API)
- **Integrations**: [LocationIQ](https://locationiq.com) (location autocomplete/geocoding), [Resend](https://resend.com) (transactional email)
- **Testing**: Vitest (backend unit + frontend unit/component), Playwright (E2E)
- **Deployment**: Docker Compose (PostgreSQL + Bun backend + [Caddy](https://caddyserver.com)-served SPA with automatic HTTPS)

## Features

- **Authentication** — register/login with email + password or Google; role-based access (`user` / `admin`).
- **Discover events** — browse and filter events by sport, skill level, location/radius, date, and free-text search, with pagination/infinite scroll.
- **Create & manage events** — organizers create, edit, and cancel events (cover image upload, location autocomplete, capacity, skill level, schedule).
- **Participate** — join events or mark interest; capacity is enforced.
- **Comments** — threaded comments on events.
- **Notifications** — in-app notifications for event updates, cancellations, joins, comments, and interest (with welcome/cancellation emails via Resend).
- **Profiles** — user profiles with bio, image, preferred sports, and preferred location/radius.
- **Reporting & moderation** — users report events, comments, or other users; admins review reports and ban/delete/promote users via an admin area.

## Prerequisites

- **Bun** (v1.0 or later) - [Install Bun](https://bun.sh)
- **Docker & Docker Compose** - For running PostgreSQL database
- **Git** - For version control
- **Node.js** (v20 LTS or later) - Required only for E2E tests (Playwright). Install via `winget install OpenJS.NodeJS.LTS` on Windows, or your platform's package manager.

Verify installations:

```bash
bun --version
docker --version
docker compose --version
git --version
node --version    # only needed if you run E2E tests
```

**Windows users — PowerShell execution policy** (one-time, only if running E2E tests):

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

This allows `npx` (a `.ps1` script) to run, which is required for E2E tests.

## Getting Started

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd pb138-project
bun install
```

### 2. Start the Development Database

```bash
bun run db:setup
```

This starts a PostgreSQL database at `localhost:5432` with:

- **Username**: `dev_user`
- **Password**: `password`
- **Database**: `fitbound`

Verify the database is running:

```bash
docker compose ps
```

To stop the database:

```bash
docker compose down
```

### 3. Set Up Environment Variables

Both apps ship a committed template — copy each to a local `.env` (git-ignored):

```bash
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env
```

**Backend** (`apps/backend/.env`) — the dev defaults point at the local Docker database:

```env
DATABASE_URL=postgres://dev_user:password@localhost:5432/fitbound
BACKEND_URL=http://localhost:3000
BETTER_AUTH_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173

# REQUIRED — the backend refuses to boot without these (auth.ts).
# Create OAuth credentials in the Google Cloud Console and add the callback
# http://localhost:3000/api/auth/callback/google
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Optional — only needed for location autocomplete/geocoding (free tier at
# https://locationiq.com). Event creation needs a location, so set this to use
# the location search.
LOCATIONIQ_API_KEY=
```

> **Heads-up:** `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `FRONTEND_URL` are validated at startup — if any is missing the backend throws and exits. `RESEND_API_KEY` is optional in dev (a dummy key is used and emails simply aren't delivered).

**Frontend** (`apps/frontend/.env`) — points the SPA at the dev backend:

```env
VITE_API_URL=http://localhost:3000
VITE_AUTH_URL=http://localhost:3000
```

### 4. Initialize the Database

Run migrations and seed the database with realistic test data:

```bash
# Run pending migrations
bun --filter backend run db:migrate

# Seed database with test data
bun --filter backend run db:seed
```

### 5. Start Development Servers

**Start both frontend and backend:**

```bash
bun run dev
```

**Or start them individually:**

Start backend only (runs on `http://localhost:3000`):

```bash
bun run dev:backend
```

Start frontend only (runs on `http://localhost:5173`):

```bash
bun run dev:frontend
```

## Available Commands

### Root Level (Monorepo)

```bash
bun install              # Install all dependencies
bun run dev              # Start both frontend and backend
bun run dev:backend      # Start backend server
bun run dev:frontend     # Start frontend development server
bun run db:setup         # Start Docker Postgres + run migrations
bun run lint             # Lint both apps (ESLint)
bun run format           # Format all code with Prettier
bun run format:check     # Check formatting without writing (used in CI)
bun run test             # Run backend + frontend test suites

# Force kill process
Get-NetTCPConnection -LocalPort 5173 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }                        # (Windows)
lsof -ti :5173 | xargs kill -9  # (UNIX)

```

### Backend Commands

```bash
cd apps/backend

bun run dev                  # Start backend with hot-reload
bun run db:up                # Start the Docker Postgres container
bun run db:setup             # db:up + wait + migrate (first-time setup)
bun run db:generate          # Generate a migration from schema changes
bun run db:migrate           # Run pending migrations
bun run db:push              # Push schema to database (dev only)
bun run db:seed              # Seed database with realistic test data
bun run db:clear             # Reset/clear all data
bun run db:studio            # Open Drizzle Studio DB GUI
bun run admin:promote        # Promote a user to admin (by email/id)
bun run sports:create        # Create a sport
bun test                     # Run backend tests (Vitest)
bun run lint                 # Run ESLint
```

### Frontend Commands

```bash
cd apps/frontend

bun run dev                  # Start Vite dev server
bun run build               # Build for production
bun run lint                # Run ESLint
bun run preview             # Preview production build locally
bun test                     # Run Vitest unit + component tests
bun run setup:e2e           # One-time: install Playwright Chromium browser (~150 MB)
bun run test:e2e            # Run Playwright E2E tests (headless)
bun run test:e2e:ui         # Run Playwright E2E tests (interactive UI mode)
```

### E2E Tests (Playwright)

E2E tests live in [apps/frontend/e2e/](apps/frontend/e2e/) and run against a Vite dev server that Playwright auto-starts (or reuses if already running on port 5173). Configuration: [apps/frontend/playwright.config.ts](apps/frontend/playwright.config.ts).

**One-time setup per machine:**

```bash
cd apps/frontend
bun run setup:e2e            # downloads Chromium browser
```

**Running tests:**

```bash
bun run test:e2e                          # all tests, headless
bun run test:e2e:ui                       # interactive UI mode
bun run test:e2e -- smoke.spec.ts         # only smoke tests (no backend needed)
bun run test:e2e -- auth.spec.ts          # only auth flow tests
```

**Test files in [apps/frontend/e2e/](apps/frontend/e2e/):**

| File                   | What it covers                                                                    | Backend required?                          |
| ---------------------- | --------------------------------------------------------------------------------- | ------------------------------------------ |
| `smoke.spec.ts`        | Public route rendering, navigation between login/register, form validation errors | No                                         |
| `auth.spec.ts`         | Register a fresh user, login, wrong password, redirect of authed user             | **Yes** — needs `bun run dev:backend` + DB |
| `navigation.spec.ts`   | Navigation between Home/Discover/My Events/Notifications/Profile after login      | **Yes**                                    |
| `create-event.spec.ts` | Create event page render, empty-form validation, cancel button                    | **Yes**                                    |
| `helpers/auth.ts`      | Shared helpers: `generateTestUser()`, `registerViaUI()`, `loginViaUI()`           | —                                          |

> **Note on backend dependency:** Tests that exercise authenticated flows register a fresh user via the UI on each run. To run those, start the backend first:
>
> ```bash
> bun run db:setup       # one-time: starts Docker Postgres + migrates + seeds
> bun run dev:backend    # in a separate terminal
> ```
>
> Then run the E2E tests in another terminal. `smoke.spec.ts` is the only file that runs without a backend.

> **Note on `npx` vs `bunx`:** The `test:e2e*` and `setup:e2e` scripts internally use `npx` (Node) instead of `bunx`. This is because Playwright on Windows has an IPC bug when launched via Bun (`--remote-debugging-pipe` doesn't work through Bun's child process spawn — Chromium starts but never responds). Everything else in the project still runs through Bun. From your perspective, you always type `bun run ...` — Bun delegates to `npx` only for these specific scripts.

## Project Structure

```
pb138-project/
├── apps/
│   ├── backend/                    # Elysia backend API
│   │   ├── drizzle/                # Generated SQL migrations + meta journal
│   │   ├── src/
│   │   │   ├── index.ts            # Server entry / composition root
│   │   │   ├── auth.ts             # better-auth config (email + Google OAuth)
│   │   │   ├── auth_middleware.ts  # `auth: true` macro (session injection)
│   │   │   ├── admin_middleware.ts # `admin: true` macro (role guard)
│   │   │   ├── openapi.config.ts   # OpenAPI/Swagger config
│   │   │   ├── db/                 # Drizzle client, schema, seed, reset
│   │   │   ├── lib/                # eventBus, geocoding helpers
│   │   │   ├── utils/              # errors, error-handler, pagination, time, …
│   │   │   ├── scripts/            # promote-user-to-admin, create-sport
│   │   │   └── modules/            # one folder per domain (layered):
│   │   │       ├── events/         #   <name>.{types,schema,model,service,
│   │   │       ├── participation/  #   routes,test}.ts
│   │   │       ├── comments/
│   │   │       ├── notifications/
│   │   │       ├── reports/
│   │   │       ├── admin/  users/  sports/  locations/
│   │   │       ├── email/          #   email service + subscribers
│   │   │       └── upload/         #   image upload (served from /uploads)
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── frontend/                   # React + Vite SPA
│       ├── e2e/                    # Playwright E2E specs + helpers
│       ├── src/
│       │   ├── main.tsx            # Entry point
│       │   ├── index.css           # Tailwind + design tokens
│       │   ├── routes/             # TanStack file-based routes
│       │   │   ├── __root.tsx      #   root layout
│       │   │   ├── auth/           #   login, register
│       │   │   ├── pages/          #   home, discover, my-events, create/edit
│       │   │   │                   #   event, event detail, notifications, profile
│       │   │   └── admin/          #   admin dashboard + discover
│       │   ├── features/           # feature modules (api / components /
│       │   │                       #   hooks / utils / validation / types):
│       │   │                       #   events, participation, comments,
│       │   │                       #   notifications, reports, admin, auth,
│       │   │                       #   users, sports, locations
│       │   ├── components/         # shared composites + ui/ (Shadcn primitives)
│       │   ├── hooks/  lib/        # shared hooks; api client (treaty), utils
│       │   └── routeTree.gen.ts    # generated by TanStack Router (git-ignored)
│       ├── Dockerfile  Caddyfile   # production image (Caddy-served SPA)
│       ├── vite.config.ts  playwright.config.ts
│       └── package.json
│
├── docs/                           # Requirements, ERD, Use Case diagram
├── scripts/deploy.sh               # Cron-friendly auto-deploy for the Docker stack
├── docker-compose.yml              # Production stack (db + backend + web/Caddy)
├── .env.production.example         # Template for the production stack
├── .gitlab-ci.yml                  # CI: lint, format-check, backend/frontend tests
├── eslint.config.js  .prettierrc   # Shared lint/format config
├── package.json  tsconfig.json     # Root workspace config
└── README.md                       # This file
```

## Database

### Schema

The database schema includes:

- **user** - Accounts with roles (user, admin), bio, image, preferred location/radius, ban + soft-delete fields
- **session / account / verification** - Managed by better-auth (sessions, OAuth/credential accounts, verification tokens)
- **sports** - Available sports with icons
- **locations** - Geocoded locations (address + lat/lng) used by events and profiles
- **user_preferred_sports** - Join table linking users to their preferred sports
- **events** - Sports events organized by users (sport, location, schedule, capacity, skill level, cancellation)
- **event_participants** - Users participating in events
- **event_interested** - Users interested in events
- **comments** - Threaded comments on events (self-referencing `parent_comment_id`)
- **notifications** - In-app notifications (event updates, cancellations, joins, comments, interest)
- **reports** - Reports against users, events, or comments, with moderation status

Most domain tables use soft deletes (`deleted_at`). Schema and relations live in [apps/backend/src/db/schema.ts](apps/backend/src/db/schema.ts); migrations are versioned under [apps/backend/drizzle/](apps/backend/drizzle/).

### Drizzle Studio

Explore your database with a GUI:

```bash
cd apps/backend
bun run db:studio
```

Opens at `http://local.drizzle.studio`

## API Development

The backend API uses **Elysia** and **@elysiajs/eden** for end-to-end type safety. Interactive OpenAPI docs are served at `http://localhost:3000/openapi` while the backend is running.

- Backend entry point / composition root: [apps/backend/src/index.ts](apps/backend/src/index.ts)
- The frontend imports the backend's exported `Backend` type to build a fully typed client ([apps/frontend/src/lib/api.ts](apps/frontend/src/lib/api.ts))

**Backend module pattern** — each domain in `src/modules/<name>/` is layered: `*.schema.ts` (Elysia `t` validation) → `*.model.ts` (Drizzle queries) → `*.service.ts` (business logic, factory DI) → `*.routes.ts` (Elysia plugin), with `*.types.ts` and `*.test.ts`. Routes stay thin and delegate to services:

```typescript
// modules/events/events.routes.ts
.post('/', ({ user, body }) => eventsService.create(db, user.id, body), {
    auth: true,
    body: createEventBody, // validated automatically (→ 422 on failure)
});
```

Frontend usage with full type safety (all calls go through React Query hooks):

```typescript
import { api } from '@/lib/api';
const { data } = await api.events.get({ query: { sportIds: [id] } });
```

## Frontend Development

- **Framework**: React 19 + TypeScript
- **Build tool**: Vite
- **Routing**: TanStack Router (file-based routes under `src/routes/`, SPA mode)
- **Server state**: TanStack Query — every backend call goes through a query/mutation hook (no `fetch`/`axios` in components); query keys follow `['resource', { filters }]`
- **UI / styling**: Shadcn/ui primitives (`src/components/ui/`) + Tailwind CSS v4 utilities and design tokens (no ad-hoc CSS)
- **Structure**: feature-based under `src/features/<name>/` (`api`, `components`, `hooks`, `utils`, `validation`, `types`); route files stay lean and delegate to feature hooks/components
- **Testing**: Vitest + Testing Library for unit/component tests; Playwright for E2E

## Deployment

The production stack is defined in [docker-compose.yml](docker-compose.yml) and builds three services:

- **db** — PostgreSQL 18 (data persisted in the `pgdata` volume)
- **backend** — the Bun/Elysia API ([apps/backend/Dockerfile](apps/backend/Dockerfile)); uploaded images persist in the `uploads` volume
- **web** — the built SPA served by [Caddy](https://caddyserver.com) ([apps/frontend/Dockerfile](apps/frontend/Dockerfile) + [apps/frontend/Caddyfile](apps/frontend/Caddyfile)), which reverse-proxies `/api` to the backend and provisions **automatic HTTPS**

```bash
cp .env.production.example .env.production   # fill in secrets + SITE_ADDRESS
docker compose up --build                    # served at $SITE_ADDRESS
```

`.env.production` must provide `SITE_ADDRESS`, the `POSTGRES_*` credentials, a matching `DATABASE_URL`, the public `BACKEND_URL` / `BETTER_AUTH_URL` / `FRONTEND_URL`, a generated `BETTER_AUTH_SECRET` (required in production), and the Google OAuth credentials. See [.env.production.example](.env.production.example) for the full annotated list.

For continuous deployment, [scripts/deploy.sh](scripts/deploy.sh) is a cron-friendly helper that pulls `origin/main` and rebuilds the stack only when something changed (logging to `deploy.log`).

## Troubleshooting

### Database Connection Issues

**Error: "connect ECONNREFUSED 127.0.0.1:5432"**

- Ensure Docker is running: `docker compose up -d`
- Check database container: `docker compose ps`
- View logs: `docker compose logs db`

### Port Already in Use

**Backend (3000) or Frontend (5173) port in use:**

```bash
# Kill process on port 3000
lsof -ti :3000 | xargs kill -9

# Kill process on port 5173
lsof -ti :5173 | xargs kill -9
```

### Module Resolution Issues

**TypeScript can't find modules:**

```bash
# Clear and reinstall dependencies
rm -rf node_modules bun.lock
bun install
```

### Database Migrations

**Pending migrations:**

```bash
cd apps/backend
bun run db:migrate
```

### E2E Tests

**Error: `npx : File ... cannot be loaded because running scripts is disabled`** (Windows)

Run once in PowerShell:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

**Error: `'npx' is not recognized`**

Node.js is not installed. Install it: `winget install OpenJS.NodeJS.LTS` (Windows), then open a new terminal.

**Test hangs at `page.goto`, Chromium never opens / shows blank window**

You're likely running Playwright through `bunx` instead of `npx`. Confirm `apps/frontend/package.json` `test:e2e` script uses `npx playwright test`, not `bunx playwright test` or `playwright test`.

**`Browser executable not found`**

Run the one-time browser install: `cd apps/frontend && bun run setup:e2e`

## Contributing

1. Follow the existing code style (enforced by ESLint and Prettier)
2. Keep changes focused and minimal
3. Test your changes before committing
4. Write meaningful commit messages

Run formatting before committing:

```bash
bun format
```

## Useful Resources

- [FitBond Requirements](docs/Requirements.md)
- [Database ERD](docs/ERD.mmd)
- [Use Cases](docs/UseCaseDiagram.mmd)
- [Bun Documentation](https://bun.sh/docs)
- [Elysia Documentation](https://elysiajs.com/guides)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
