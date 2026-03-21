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

Verify installations:
```bash
bun --version
docker --version
docker compose --version
git --version
```

## Getting Started

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd pb138-project
bun install
```

### 2. Start the Development Database

```bash
docker compose up -d
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

Create a `.env` file in the project root (or use the existing one). The default values are already configured for local development:

```env
# Local Docker PostgreSQL
# Connection string for Drizzle ORM
DATABASE_URL=postgres://dev_user:password@localhost:5432/fitbound
```

### 4. Initialize the Database

Run migrations and seed the database with realistic test data:

```bash
# Run pending migrations
bun --filter backend run drizzle:migrate

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
bun run drizzle:migrate      # Run pending migrations
bun run drizzle:push         # Push schema to database
bun run drizzle:studio       # Open Drizzle Studio DB GUI
bun test                     # Run backend tests
```

### Frontend Commands

```bash
cd apps/frontend

bun run dev                  # Start Vite dev server
bun run build               # Build for production
bun run lint                # Run ESLint
bun run preview             # Preview production build locally
```

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
├── docker-compose.yml          # PostgreSQL setup
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
bun run drizzle:studio
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
const response = await api.events.post({ /* validated types */ });
```

## Frontend Development

- **Framework**: React with TypeScript
- **Build tool**: Vite
- **Styling**: CSS (see [App.css](apps/frontend/src/App.css))
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
bun run drizzle:migrate
```

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

## Questions?

Check the project guidelines in [copilot-instructions.md](.github/copilot-instructions.md) for additional context on architecture boundaries and coding conventions.
