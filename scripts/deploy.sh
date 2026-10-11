#!/usr/bin/env bash
#
# Auto-deploy for the FitBond Docker stack.
#
# Pulls the latest commits from origin/<BRANCH> and, only when something
# changed, rebuilds and restarts the compose stack. Designed to be run from
# cron; every run appends a timestamped entry to deploy.log.
#
# Install (on the server, as a user in the `docker` group):
#   chmod +x scripts/deploy.sh
#   crontab -e
#   # check for new commits every 5 minutes:
#   */5 * * * * /absolute/path/to/fit-bond/scripts/deploy.sh
#
# Watch the log:   tail -f /absolute/path/to/fit-bond/deploy.log

set -uo pipefail

# cron runs with a minimal PATH; make sure git/docker/flock are findable.
export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:$PATH"

# --- Config -----------------------------------------------------------------
BRANCH="main"
ENV_FILE=".env.production"

# Repo root = parent of this script's directory, so there's no hardcoded path.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
LOG_FILE="$REPO_DIR/deploy.log"
LOCK_FILE="$REPO_DIR/.deploy.lock"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" >>"$LOG_FILE"; }

cd "$REPO_DIR" || { echo "deploy.sh: repo dir not found: $REPO_DIR" >&2; exit 1; }

log "=== Deploy started ==="
log "Repo: $REPO_DIR | Branch: $BRANCH | ENV: $ENV_FILE"
log "Current HEAD: $(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')"

# --- Single-runner lock -----------------------------------------------------
# A rebuild can take minutes; skip this tick if a previous one is still going.
exec 9>"$LOCK_FILE"
if ! flock -n 9; then
    log "Another deploy is already running; skipping this run."
    exit 0
fi
log "Lock acquired; proceeding with deploy."

# --- Is there anything new on origin/$BRANCH? -------------------------------
log "Fetching from origin/$BRANCH..."
if ! git fetch --quiet origin "$BRANCH" 2>>"$LOG_FILE"; then
    log "ERROR: git fetch failed. Checking git status..."
    git status >>"$LOG_FILE" 2>&1
    git remote -v >>"$LOG_FILE" 2>&1
    exit 1
fi
log "git fetch completed successfully."

LOCAL="$(git rev-parse HEAD)"
REMOTE="$(git rev-parse "origin/$BRANCH")"

log "Local HEAD: $LOCAL | Remote origin/$BRANCH: $REMOTE"

if [ "$LOCAL" = "$REMOTE" ]; then
    # Up to date — exit quietly so the log isn't spammed on every cron tick.
    log "Already up-to-date with origin/$BRANCH. No deploy needed."
    exit 0
fi

log "New commits detected. Local: $(git rev-parse --short HEAD) → Remote: $(git rev-parse --short "origin/$BRANCH")"

# --- Pull (fast-forward only; never rewrite local history) ------------------
log "Checking out branch $BRANCH..."
if ! git checkout "$BRANCH" >>"$LOG_FILE" 2>&1; then
    log "ERROR: could not checkout $BRANCH."
    git branch -v >>"$LOG_FILE" 2>&1
    exit 1
fi
log "Checkout completed. Attempting fast-forward merge..."

if ! git merge --ff-only "origin/$BRANCH" >>"$LOG_FILE" 2>&1; then
    log "ERROR: fast-forward merge failed (local history diverged?)."
    log "Git log diff:"
    git log --oneline -5 >>"$LOG_FILE" 2>&1
    git log --oneline -5 "origin/$BRANCH" >>"$LOG_FILE" 2>&1
    log "Git status:"
    git status >>"$LOG_FILE" 2>&1
    exit 1
fi
log "Merge completed. Now at $(git rev-parse --short HEAD)."

# --- Rebuild + restart ------------------------------------------------------
log "Checking prerequisites for docker compose..."
if [ ! -f "$ENV_FILE" ]; then
    log "ERROR: ENV_FILE not found: $ENV_FILE"
    ls -la .env* >>"$LOG_FILE" 2>&1
    exit 1
fi
log "ENV_FILE exists: $ENV_FILE"

log "Starting docker compose up -d --build..."
if docker compose --env-file "$ENV_FILE" up -d --build >>"$LOG_FILE" 2>&1; then
    log "Deploy succeeded — now at $(git rev-parse --short HEAD)."
    log "Running docker image prune to clean up dangling images..."
    docker image prune -f >>"$LOG_FILE" 2>&1
    log "Prune completed."
    log "=== Deploy finished successfully ==="
else
    log "ERROR: 'docker compose up -d --build' failed."
    log "Docker status:"
    docker compose --env-file "$ENV_FILE" ps >>"$LOG_FILE" 2>&1
    docker compose --env-file "$ENV_FILE" logs --tail=50 >>"$LOG_FILE" 2>&1
    log "Stack may be unchanged or in a broken state."
    exit 1
fi
