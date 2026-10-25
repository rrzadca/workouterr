#!/usr/bin/env bash
# Fails when the committed projects/api-client differs from what orval generates from contracts/openapi/workouterr.json.
set -euo pipefail
cd "$(dirname "$0")/.."

npm run --silent generate:api-client > /dev/null

client=projects/api-client
# git diff only sees tracked files, so a newly generated file would slip through.
untracked=$(git ls-files --others --exclude-standard -- "$client")
if [ -n "$untracked" ]; then
  echo "$untracked" >&2
  echo "$client has files that are not tracked: stage or commit them." >&2
  exit 1
fi
# The working copy holds what orval just generated; the index holds what is committed or staged.
if ! git --no-pager diff --exit-code -- "$client" >&2; then
  echo "$client is out of date: run \`npm run generate:api-client\` and commit the result." >&2
  exit 1
fi
echo "API client is up to date."
