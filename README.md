# FitBond - Developer Guide

FitBond is a social sports application that helps people find others to exercise with, create sport events, and build a local activity community.

## Tech Stack

- **Runtime**: [Bun](https://bun.sh)
- **Backend**: [Elysia](https://elysiajs.com) on Bun
- **Frontend**: React + TypeScript with Vite
- **Database**: PostgreSQL with Drizzle ORM
- **Monorepo**: Bun workspaces

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

Create a `.env` file in the backend root (or use the existing one). The default values are already configured for local development:

```env
# Local Docker PostgreSQL
# Connection string for Drizzle ORM
DATABASE_URL=postgres://dev_user:password@localhost:5432/fitbound
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
bun install               # Install all dependencies
bun run dev              # Start both frontend and backend
bun run dev:backend      # Start backend server
bun run dev:frontend     # Start frontend development server
bun format               # Format code with Prettier
```

### Backend Commands

```bash
cd apps/backend

bun run dev                    # Start backend with hot-reload
bun run db:seed              # Seed database with test data
bun run db:migrate           # Run pending migrations
bun run db:push              # Push schema to database
bun run db:studio            # Open Drizzle Studio DB GUI
bun test                     # Run backend tests
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
│   ├── backend/                # Elysia backend API
│   │   ├── src/
│   │   │   ├── index.ts        # Main server entry point
│   │   │   ├── index.test.ts   # Backend tests
│   │   │   └── db/
│   │   │       ├── index.ts    # Database client
│   │   │       ├── schema.ts   # Drizzle ORM schema
│   │   │       └── seed.ts     # Database seeder
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── frontend/               # React frontend app
│       ├── src/
│       │   ├── main.tsx        # Entry point
│       │   ├── App.tsx         # Main component
│       │   ├── App.css
│       │   ├── index.css
│       │   ├── app.test.tsx
│       │   └── assets/
│       ├── index.html
│       ├── vite.config.ts
│       ├── package.json
│       └── tsconfig*.json
│
├── docs/
│   ├── Requirements.md         # Product requirements
│   ├── ERD.mmd                # Database Entity Relationship Diagram
│   └── UseCaseDiagram.mmd     # Use cases diagram
│
├── .env                        # Environment variables (dev defaults)
├── package.json                # Root workspace package.json
├── tsconfig.json               # Root TypeScript config
├── eslint.config.js            # ESLint configuration
└── README.md                   # This file
```

## Database

### Schema

The database schema includes:

- **users** - User accounts with roles (user, admin)
- **sports** - Available sports with icons
- **locations** - Geographic locations for events
- **events** - Sports events organized by users
- **event_participants** - Users participating in events
- **event_interested** - Users interested in events
- **comments** - Comments on events
- **notifications** - User notifications
- **reports** - User and content reports for moderation

View the schema at [apps/backend/src/db/schema.ts](apps/backend/src/db/schema.ts)

### Drizzle Studio

Explore your database with a GUI:

```bash
cd apps/backend
bun run db:studio
```

Opens at `http://local.drizzle.studio`

## API Development

The backend API uses **Elysia** and **@elysiajs/eden** for end-to-end type safety.

- Backend entry point: [apps/backend/src/index.ts](apps/backend/src/index.ts)
- The frontend imports type-safe API client from the backend's `App` type

Example Elysia endpoint in backend:

```typescript
app.post('/events', ({ body }) => {
    // Handle event creation
    return event;
});
```

Frontend usage with full type safety:

```typescript
const response = await api.events.post({
    /* validated types */
});
```

## Frontend Development

- **Framework**: React with TypeScript
- **Build tool**: Vite
- **Styling**: Tailwind CSS + shadcn
- **Testing**: included test setup

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
