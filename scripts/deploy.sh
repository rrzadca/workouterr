#!/usr/bin/env bash
# Deploys the committed code to MyDevil. Steps run in order and the first failure stops the deploy (docs/deploy.md).
set -euo pipefail

cd "$(dirname "$0")/.."

# 15432, not 5432, so the tunnel can't be mistaken for local Docker PostgreSQL
readonly tunnel_port=15432
tunnel_socket=''
staging_directory=''

step() {
  printf '\n\033[1m==> %s\033[0m\n' "$1"
}

fail() {
  printf '\033[31mDeploy failed: %s\033[0m\n' "$1" >&2
  exit 1
}

cleanup() {
  if [[ -n "$tunnel_socket" && -S "$tunnel_socket" ]]; then
    ssh -S "$tunnel_socket" -O exit "$DEPLOY_SSH_TARGET" 2>/dev/null || true
  fi
  if [[ -n "$staging_directory" ]]; then
    rm -rf "$staging_directory"
  fi
}
trap cleanup EXIT

step 'Settings'
[[ -f .env.deploy ]] || fail '.env.deploy is missing; copy .env.deploy.example and fill it in'
# shellcheck source=/dev/null
source .env.deploy
: "${DEPLOY_SSH_TARGET:?is not set in .env.deploy}"
: "${DEPLOY_DOMAIN:?is not set in .env.deploy}"
[[ "$(node --version)" == v24.* ]] || fail "Node 24 is required, found $(node --version); run nvm use"
[[ -z "$(git status --porcelain)" ]] || fail 'the working tree has uncommitted changes; deploy only committed code'
echo "Deploying $(git rev-parse --short HEAD) to $DEPLOY_DOMAIN"

step 'Lint, type check and tests'
npm run lint
npm run typecheck
npm test

step 'SSH tunnel to the production database'
# The password lives only on the server (~/.bash_profile); the Mac reads it for the migration and keeps no copy
production_database_url="$(ssh "$DEPLOY_SSH_TARGET" 'source ~/.bash_profile >/dev/null 2>&1; printf %s "$DATABASE_URL"')"
[[ -n "$production_database_url" ]] || fail 'DATABASE_URL is not set in ~/.bash_profile on the server'
database_host="$(node -e 'const url = new URL(process.argv[1]); console.log(`${url.hostname}:${url.port || 5432}`)' "$production_database_url")"
tunnel_database_url="$(node -e 'const url = new URL(process.argv[1]); url.hostname = "localhost"; url.port = process.argv[2]; console.log(url.href)' "$production_database_url" "$tunnel_port")"
# Short path: macOS limits socket paths to 104 characters, and $TMPDIR is long
tunnel_socket="/tmp/workouterr-tunnel-$$"
ssh -f -N -M -S "$tunnel_socket" -o ExitOnForwardFailure=yes \
  -L "$tunnel_port:$database_host" "$DEPLOY_SSH_TARGET"
echo "localhost:$tunnel_port -> $database_host"

step 'Migrate the production database (ADR-0001)'
(cd api && DATABASE_URL="$tunnel_database_url" npx prisma migrate deploy)
ssh -S "$tunnel_socket" -O exit "$DEPLOY_SSH_TARGET" 2>/dev/null
tunnel_socket=''

step 'Build'
npm run db:generate -w api
rm -rf web/dist
npm run build -w web

step 'Upload'
# Assemble exactly what the server runs (layout in docs/deploy.md), then mirror it
staging_directory="$(mktemp -d -t workouterr-deploy)"
staging_app="$staging_directory/app"
mkdir -p "$staging_app"
cp package.json package-lock.json .npmrc "$staging_app/"
rsync -a --exclude '*.test.ts' --exclude 'test-support/' api/package.json api/public_nodejs api/src "$staging_app/api/"
rsync -a --exclude '*.test.ts' shared/package.json shared/src "$staging_app/shared/"
web_build=web/dist/web/browser
cp "$web_build/index.html" "$staging_app/api/public_nodejs/index.html"
rsync -a --exclude index.html "$web_build/" "$staging_app/api/public_nodejs/public/"
# --delete removes files dropped since the last deploy; the excluded node_modules is left alone
rsync -az --delete --exclude node_modules "$staging_app/" "$DEPLOY_SSH_TARGET:domains/$DEPLOY_DOMAIN/app/"

step 'Install production dependencies and restart'
ssh "$DEPLOY_SSH_TARGET" bash -s -- "$DEPLOY_DOMAIN" <<'REMOTE'
# Loaded before set -e: a profile line like `[ -f ~/.profile ] && …` returns non-zero without being an error
source ~/.bash_profile
set -euo pipefail
domain="$1"
cd ~/domains/"$domain"
if [[ ! -L public_nodejs ]]; then
  # First deploy: MyDevil's default public_nodejs/ makes way for the link into the app
  [[ ! -e public_nodejs.original ]] || { echo 'public_nodejs is not a link and public_nodejs.original exists' >&2; exit 1; }
  mv public_nodejs public_nodejs.original
  ln -s app/api/public_nodejs public_nodejs
fi
cd app
npm ci --omit=dev --omit=optional --workspace=api --ignore-scripts
devil www restart "$domain"
REMOTE

step 'Smoke check'
expected_version="$(node -p "require('./api/package.json').version")"
health=''
# The first request after a restart starts the app, so give it a few tries
for attempt in 1 2 3 4 5; do
  if health="$(curl -fsS --max-time 20 "https://$DEPLOY_DOMAIN/api/health")"; then
    break
  fi
  echo "Attempt $attempt failed, retrying"
  sleep 3
done
echo "$health"
[[ "$health" == *'"status":"ok"'* ]] || fail 'GET /api/health is not ok'
[[ "$health" == *"\"version\":\"$expected_version\""* ]] || fail "the server does not report version $expected_version"
curl -fsS --max-time 20 "https://$DEPLOY_DOMAIN/" | grep -q '<app-root' || fail 'the home page is not the Angular app'

printf '\n\033[32mDeployed %s to https://%s\033[0m\n' "$(git rev-parse --short HEAD)" "$DEPLOY_DOMAIN"
