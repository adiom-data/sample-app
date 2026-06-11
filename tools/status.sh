#!/usr/bin/env bash
set -euo pipefail

git_commit="unknown"
if git rev-parse --short HEAD >/dev/null 2>&1; then
  git_commit="$(git rev-parse --short HEAD)"
fi

echo "STABLE_GIT_COMMIT ${git_commit}"
echo "STABLE_REFERENCE_PREFIX ${REFERENCE_PREFIX:-ghcr.io/adiom-data}"

