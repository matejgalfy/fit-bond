# Frontend image — build context is the repo root.
#   docker build -f apps/frontend/Dockerfile .
# Stage 1: build the SPA with Bun. The backend source is needed because the
# frontend imports `type { Backend }` from it and `tsc -b` type-checks the import.
FROM oven/bun:1.3.12 AS build
WORKDIR /app

COPY package.json bun.lock ./
COPY apps/backend/package.json ./apps/backend/package.json
COPY apps/frontend/package.json ./apps/frontend/package.json
RUN bun install --frozen-lockfile

COPY apps/backend ./apps/backend
COPY apps/frontend ./apps/frontend

# Same-origin deploy: the API lives under `/api` behind the Caddy proxy.
ENV VITE_API_URL=/api
WORKDIR /app/apps/frontend
# Build with Vite directly (transpile + bundle). The `bun run build` script also
# runs `tsc -b` as a type-check gate, which is a CI/dev concern, not needed to
# produce the deployable bundle.
RUN bunx --bun vite build

# Stage 2: serve the static build with Caddy, which also reverse-proxies the API
# and provisions/renews TLS certificates automatically (Let's Encrypt).
FROM caddy:2-alpine AS runtime
COPY apps/frontend/Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/apps/frontend/dist /srv
EXPOSE 80 443
