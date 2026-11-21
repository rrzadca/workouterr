#!/usr/bin/env bash
# Checks, builds and deploys Workouterr to the server. Nothing leaves the Mac until every check has passed.
#   deploy/deploy.sh [--skip-e2e]
# Needs: Docker running (the API tests and the image builds), GITHUB_PACKAGES_TOKEN in the environment, and the
# `workouterr` SSH alias (docs/server-setup.md). WORKOUTERR_SSH_HOST overrides the alias.
set -euo pipefail

repo=$(cd "$(dirname "$0")/.." && pwd)
server=${WORKOUTERR_SSH_HOST:-workouterr}
server_folder=workouterr # in deploy's home on the server
images=(workouterr-api workouterr-caddy)
platform=linux/amd64 # the server's; the Mac is arm64

run_e2e=true
for argument in "$@"; do
  case $argument in
    --skip-e2e) run_e2e=false ;;
    *) echo "Unknown option: $argument (usage: deploy/deploy.sh [--skip-e2e])" >&2; exit 2 ;;
  esac
done

step() { printf '\n\033[1m==> %s\033[0m\n' "$*"; }

step "Preconditions"
# The checks compare generated files with git's index and the images are built from the working copy, so what is
# deployed must be exactly a commit.
if [ -n "$(git -C "$repo" status --porcelain)" ]; then
  git -C "$repo" status --short >&2
  echo "The working tree has changes: commit or stash them first." >&2
  exit 1
fi
: "${GITHUB_PACKAGES_TOKEN:?set GITHUB_PACKAGES_TOKEN (a GitHub token with read:packages) for the web build}"
docker info > /dev/null
ssh "$server" true # fail now, not after ten minutes of checks
commit=$(git -C "$repo" rev-parse --short HEAD)
echo "Deploying $commit to $server."

step "API: format, build, OpenAPI document, tests"
cd "$repo/api"
dotnet format --verify-no-changes
dotnet build --nologo
scripts/check-openapi.sh
dotnet test

step "Web: install, lint, format, API client, build, tests"
cd "$repo/web"
npm ci
npm run lint
npm run format:check
scripts/check-api-client.sh
npm run build
npm test -- --watch=false

# Task 35 adds the Playwright tests as `npm run e2e`; until then there is nothing to run.
if npm run | grep -q '^  e2e$'; then
  if $run_e2e; then
    step "Web: end-to-end tests"
    npm run e2e
  else
    step "Web: end-to-end tests SKIPPED (--skip-e2e)"
  fi
fi

step "Build images for $platform"
cd "$repo/deploy"
# Compose builds for DOCKER_DEFAULT_PLATFORM. The tags are the local ones too: a local `docker compose build`
# afterwards builds them for the Mac again.
DOCKER_DEFAULT_PLATFORM=$platform docker compose build

step "Send images and compose.yaml to $server"
# gzip on the wire: the images shrink to about a third, and docker load reads the stream as it arrives.
docker save --platform "$platform" "${images[@]}" | gzip | ssh "$server" 'gunzip | docker load'
scp -q compose.yaml "$server:$server_folder/compose.yaml"

step "Migrate the database and start the new containers"
# The server has no source, only the loaded images: `up --no-build` never tries to build, and `run` (which has no
# such flag) builds only when an image is missing. The migrations run before the new API starts.
ssh "$server" "cd $server_folder \
  && docker compose run --rm migrations \
  && docker compose up -d --wait --no-build \
  && docker image prune -f > /dev/null"

step "Health check"
domain=$(ssh "$server" "sed -n 's/^WORKOUTERR_DOMAIN=//p' $server_folder/.env")
# Asked at the server's own address (from the SSH config), with the domain kept for TLS: a stale DNS cache on the
# way (the router's, after a DNS change) would otherwise send the check to whatever the old record points at.
server_address=$(ssh -G "$server" 2> /dev/null | awk '/^hostname /{print $2}')
health=$(curl --fail --silent --show-error --retry 5 --retry-delay 2 --retry-all-errors \
  --resolve "$domain:443:$server_address" "https://$domain/api/health")
echo "$health"
if [ "$health" != '{"status":"Healthy"}' ]; then
  echo "Unexpected health response from $server_address." >&2
  exit 1
fi
echo "Deployed $commit to https://$domain."
