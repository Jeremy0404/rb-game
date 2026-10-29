#!/usr/bin/env bash
set -euo pipefail

readonly SERVER="mediaserver"
readonly REMOTE_DIR="rb-game"
readonly PUBLIC_URL="https://rbgame.jerco.fr/"

fail() {
  echo "ship.sh: $1" >&2
  exit 1
}

require_clean_main() {
  [[ "$(git branch --show-current)" == "main" ]] || fail "not on main"
  [[ -z "$(git status --porcelain)" ]] || fail "working tree is not clean"
  git fetch --quiet origin main
  [[ "$(git rev-parse HEAD)" == "$(git rev-parse origin/main)" ]] || fail "main is not level with origin/main"
}

sync_files() {
  rsync -a --delete deploy/compose.yml deploy/nginx "$SERVER:$REMOTE_DIR/"
  rsync -a --delete public/ "$SERVER:$REMOTE_DIR/public/"
}

start_or_reload() {
  # shellcheck disable=SC2029
  ssh "$SERVER" "cd $REMOTE_DIR && docker compose up -d && docker compose exec -T rb-game nginx -s reload"
}

check_public_url() {
  curl --fail --silent --show-error --output /dev/null --max-time 10 "$PUBLIC_URL" ||
    fail "$PUBLIC_URL does not answer 200"
}

cd "$(dirname "$0")/.."
require_clean_main
sync_files
start_or_reload
check_public_url
echo "Shipped $(git rev-parse --short HEAD) to $PUBLIC_URL"
