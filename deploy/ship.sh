#!/usr/bin/env bash
set -euo pipefail

readonly CONFIG="deploy/.env"
readonly REMOTE_DIR="rb-game"
readonly PUBLIC_URL="https://rbgame.jerco.fr/"

fail() {
  echo "ship.sh: $1" >&2
  exit 1
}

load_config() {
  [[ -f "$CONFIG" ]] || fail "$CONFIG is missing: copy deploy/.env.example and fill it in"
  # shellcheck source=/dev/null
  source "$CONFIG"
  [[ -n "${DEPLOY_SSH_HOST:-}" && -n "${PROXY_NETWORK:-}" ]] ||
    fail "$CONFIG must set DEPLOY_SSH_HOST and PROXY_NETWORK"
}

require_clean_main() {
  [[ "$(git branch --show-current)" == "main" ]] || fail "not on main"
  [[ -z "$(git status --porcelain)" ]] || fail "working tree is not clean"
  git fetch --quiet origin main
  [[ "$(git rev-parse HEAD)" == "$(git rev-parse origin/main)" ]] || fail "main is not level with origin/main"
}

sync_files() {
  rsync -a --delete deploy/compose.yml deploy/.env deploy/nginx "$DEPLOY_SSH_HOST:$REMOTE_DIR/"
  rsync -a --delete public/ "$DEPLOY_SSH_HOST:$REMOTE_DIR/public/"
}

start_or_reload() {
  # shellcheck disable=SC2029
  ssh "$DEPLOY_SSH_HOST" "cd $REMOTE_DIR && docker compose up -d && docker compose exec -T rb-game nginx -s reload"
}

check_public_url() {
  curl --fail --silent --show-error --output /dev/null --max-time 10 "$PUBLIC_URL" ||
    fail "$PUBLIC_URL does not answer 200"
}

cd "$(dirname "$0")/.."
load_config
require_clean_main
sync_files
start_or_reload
check_public_url
echo "Shipped $(git rev-parse --short HEAD) to $PUBLIC_URL"
