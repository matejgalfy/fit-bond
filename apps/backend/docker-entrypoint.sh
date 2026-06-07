#!/bin/sh
set -e

# Ensure the uploads directory exists (it's backed by a volume in compose).
mkdir -p uploads

echo "Applying database migrations..."
bun run db:migrate

echo "Starting backend..."
exec bun src/index.ts
