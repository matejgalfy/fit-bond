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
#   */5 * * * * /absolute/path/to/pb138-project/scripts/deploy.sh
#
# Watch the log:   tail -f /absolute/path/to/pb138-project/deploy.log

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

# --- Single-runner lock -----------------------------------------------------
# A rebuild can take minutes; skip this tick if a previous one is still going.
exec 9>"$LOCK_FILE"
if ! flock -n 9; then
    log "Another deploy is already running; skipping this run."
    exit 0
fi

# --- Is there anything new on origin/$BRANCH? -------------------------------
if ! git fetch --quiet origin "$BRANCH" 2>>"$LOG_FILE"; then
    log "ERROR: git fetch failed."
    exit 1
fi

LOCAL="$(git rev-parse HEAD)"
REMOTE="$(git rev-parse "origin/$BRANCH")"

if [ "$LOCAL" = "$REMOTE" ]; then
    # Up to date — exit quietly so the log isn't spammed on every cron tick.
    exit 0
fi

log "New commits on origin/$BRANCH ($(git rev-parse --short HEAD) -> $(git rev-parse --short "origin/$BRANCH")). Deploying..."

# --- Pull (fast-forward only; never rewrite local history) ------------------
if ! git checkout "$BRANCH" >>"$LOG_FILE" 2>&1; then
    log "ERROR: could not checkout $BRANCH."
    exit 1
fi
if ! git merge --ff-only "origin/$BRANCH" >>"$LOG_FILE" 2>&1; then
    log "ERROR: fast-forward merge failed (local history diverged?). Aborting."
    exit 1
fi

# --- Rebuild + restart ------------------------------------------------------
if docker compose --env-file "$ENV_FILE" up -d --build >>"$LOG_FILE" 2>&1; then
    log "Deploy succeeded — now at $(git rev-parse --short HEAD)."
    # Drop dangling images left behind by the rebuild to save disk.
    docker image prune -f >>"$LOG_FILE" 2>&1
else
    log "ERROR: 'docker compose up -d --build' failed. Stack may be unchanged."
    exit 1
fi
