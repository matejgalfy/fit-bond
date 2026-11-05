#!/usr/bin/env bash
#
# Auto-deploy FitBond to the k3s cluster on this server (runbook: docs/DEPLOY.md).
#
# When origin/<BRANCH> has a commit that isn't deployed yet AND CI has already
# pushed its images to GHCR, this fast-forwards the checkout and applies
# infra/k8s with those images. A commit whose images never appear (failed CI)
# is skipped as soon as a newer one has images. Every run that does something
# appends to deploy.log; idle runs stay quiet.
#
# Install (on the server):
#   chmod +x scripts/deploy.sh
#   crontab -e
#   */5 * * * * /absolute/path/to/fit-bond/scripts/deploy.sh >/dev/null 2>&1
#
# Deploy right now, even if nothing changed (e.g. after editing .env.production):
#   scripts/deploy.sh --force
#
# Watch the log:   tail -f /absolute/path/to/fit-bond/deploy.log

set -uo pipefail

# cron runs with a minimal PATH; k3s puts kubectl in /usr/local/bin.
export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:$PATH"
export KUBECONFIG="${KUBECONFIG:-$HOME/.kube/config}"

# --- Config -----------------------------------------------------------------
BRANCH="main"
ENV_FILE=".env.production"
NAMESPACE="fitbond"
# GHCR repositories are <prefix>-backend and <prefix>-web (see .github/workflows/ci.yml).
IMAGE_PREFIX="${IMAGE_PREFIX:-ghcr.io/matejgalfy/fitbond}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
LOG_FILE="$REPO_DIR/deploy.log"
LOCK_FILE="$REPO_DIR/.deploy.lock"
DEPLOYED_FILE="$REPO_DIR/.deployed-sha"
WAITING_FILE="$REPO_DIR/.deploy-waiting"

FORCE=0
[ "${1:-}" = "--force" ] && FORCE=1

# Log to the file, and to the terminal when run by hand.
log() {
    local line
    line="[$(date '+%Y-%m-%d %H:%M:%S')] $*"
    echo "$line" >>"$LOG_FILE"
    [ -t 1 ] && echo "$line"
    return 0
}

cd "$REPO_DIR" || { echo "deploy.sh: repo dir not found: $REPO_DIR" >&2; exit 1; }

# --- Single-runner lock -----------------------------------------------------
exec 9>"$LOCK_FILE"
if ! flock -n 9; then
    [ -t 1 ] && echo "Another deploy is already running."
    exit 0
fi

# --- Anything new on origin/$BRANCH? ----------------------------------------
if ! git fetch --quiet origin "$BRANCH" 2>>"$LOG_FILE"; then
    log "ERROR: git fetch failed."
    exit 1
fi

SHA="$(git rev-parse "origin/$BRANCH")"
SHORT="${SHA:0:7}"
DEPLOYED="$(cat "$DEPLOYED_FILE" 2>/dev/null || echo none)"

if [ "$SHA" = "$DEPLOYED" ] && [ "$FORCE" = 0 ]; then
    [ -t 1 ] && echo "Already deployed: $SHORT (use --force to redeploy)."
    exit 0
fi

# --- Are the images for this commit on GHCR yet? ----------------------------
# Asks the registry's HTTP API directly (anonymous pull token, public packages).
image_exists() {
    local repo="${1#ghcr.io/}" tag="$2" token
    token="$(curl -fsS "https://ghcr.io/token?scope=repository:${repo}:pull" |
        sed -E 's/.*"token":"([^"]+)".*/\1/')" || return 1
    curl -fsS -o /dev/null \
        -H "Authorization: Bearer $token" \
        -H 'Accept: application/vnd.oci.image.index.v1+json, application/vnd.oci.image.manifest.v1+json, application/vnd.docker.distribution.manifest.list.v2+json, application/vnd.docker.distribution.manifest.v2+json' \
        "https://ghcr.io/v2/${repo}/manifests/${tag}"
}

for image in backend web; do
    if ! image_exists "${IMAGE_PREFIX}-${image}" "$SHA"; then
        # Log once per commit, not on every cron tick.
        if [ "$(cat "$WAITING_FILE" 2>/dev/null)" != "$SHA" ]; then
            log "New commit $SHORT, but ${IMAGE_PREFIX}-${image}:${SHA} isn't on GHCR yet (CI running, failed, or package private). Retrying on the next run."
            echo "$SHA" >"$WAITING_FILE"
        fi
        [ -t 1 ] && echo "Images for $SHORT not on GHCR yet."
        exit 0
    fi
done
rm -f "$WAITING_FILE"

log "=== Deploying $SHORT (previously: ${DEPLOYED:0:7}) ==="

# --- Fast-forward the checkout (manifests come from the same commit) ---------
if ! git checkout --quiet "$BRANCH" >>"$LOG_FILE" 2>&1 ||
    ! git merge --quiet --ff-only "origin/$BRANCH" >>"$LOG_FILE" 2>&1; then
    log "ERROR: could not fast-forward $BRANCH to origin/$BRANCH (local changes on the server?)."
    git status --short >>"$LOG_FILE" 2>&1
    exit 1
fi

# --- Configuration from .env.production -------------------------------------
if [ ! -f "$ENV_FILE" ]; then
    log "ERROR: $ENV_FILE not found in $REPO_DIR."
    exit 1
fi
# The public host for the Ingress = host part of FRONTEND_URL.
HOST="$(sed -n -E 's#^FRONTEND_URL=https?://([^/:]+).*#\1#p' "$ENV_FILE" | tail -n 1)"
if [ -z "$HOST" ]; then
    log "ERROR: FRONTEND_URL in $ENV_FILE must look like https://your.host"
    exit 1
fi
ENV_CHECKSUM="$(sha256sum "$ENV_FILE" | cut -c1-16)"

# --- Apply ------------------------------------------------------------------
manifest="$(mktemp)"
trap 'rm -f "$manifest"' EXIT
if ! kubectl kustomize infra/k8s >"$manifest" 2>>"$LOG_FILE"; then
    log "ERROR: kubectl kustomize infra/k8s failed."
    exit 1
fi
sed -i -E \
    -e "s#FITBOND_HOST#${HOST}#g" \
    -e "s#ENV_CHECKSUM#${ENV_CHECKSUM}#g" \
    -e "s#(image: ${IMAGE_PREFIX}-(backend|web)):latest#\1:${SHA}#" \
    "$manifest"

# The namespace must exist before the Secret, the Secret before the pods.
if ! kubectl apply -f infra/k8s/namespace.yaml >>"$LOG_FILE" 2>&1 ||
    ! kubectl -n "$NAMESPACE" create secret generic fitbond-env \
        --from-env-file="$ENV_FILE" --dry-run=client -o yaml |
    kubectl apply -f - >>"$LOG_FILE" 2>&1 ||
    ! kubectl apply -f "$manifest" >>"$LOG_FILE" 2>&1; then
    log "ERROR: kubectl apply failed (see above)."
    exit 1
fi

for deployment in backend web; do
    if ! kubectl -n "$NAMESPACE" rollout status "deployment/$deployment" --timeout=10m >>"$LOG_FILE" 2>&1; then
        log "ERROR: deployment/$deployment did not become ready. Check: kubectl -n $NAMESPACE get pods; kubectl -n $NAMESPACE logs deploy/$deployment"
        kubectl -n "$NAMESPACE" get pods >>"$LOG_FILE" 2>&1
        kubectl -n "$NAMESPACE" logs "deploy/$deployment" --tail=50 >>"$LOG_FILE" 2>&1
        exit 1
    fi
done

echo "$SHA" >"$DEPLOYED_FILE"
log "=== Deployed $SHORT to https://$HOST ==="
