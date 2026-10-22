#!/usr/bin/env bash
# Fails when the committed contracts/openapi/workouterr.json differs from what the API generates.
set -euo pipefail
cd "$(dirname "$0")/.."

# The document is only rewritten when the build recompiles, so force a full build.
dotnet build src/Workouterr.Api --no-incremental --nologo --verbosity quiet

document=../contracts/openapi/workouterr.json
# git diff compares the working copy with the index, so an untracked document would always pass.
if ! git ls-files --error-unmatch -- "$document" > /dev/null 2>&1; then
  echo "contracts/openapi/workouterr.json is not tracked: stage or commit it." >&2
  exit 1
fi
# The working copy holds what the build just generated; the index holds what is committed or staged.
if ! git --no-pager diff --exit-code -- "$document" >&2; then
  echo "contracts/openapi/workouterr.json is out of date: build the API and commit the regenerated file." >&2
  exit 1
fi
echo "OpenAPI document is up to date."
