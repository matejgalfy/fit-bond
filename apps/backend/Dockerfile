# Backend image — build context is the repo root (Bun workspace lockfile lives there).
#   docker build -f apps/backend/Dockerfile .
FROM oven/bun:1.3.12 AS base
WORKDIR /app

# Install dependencies first for better layer caching. All workspace manifests
# must be present for `--frozen-lockfile` to resolve against bun.lock.
COPY package.json bun.lock ./
COPY apps/backend/package.json ./apps/backend/package.json
COPY apps/frontend/package.json ./apps/frontend/package.json
RUN bun install --frozen-lockfile

# Backend source (includes drizzle/ migrations + drizzle.config.ts).
COPY apps/backend ./apps/backend

WORKDIR /app/apps/backend
ENV NODE_ENV=production
EXPOSE 3000

# Migrate-on-start, then launch the server.
COPY apps/backend/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
