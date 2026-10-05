#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$ROOT/.server-control.env"

if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  . "$ENV_FILE"
  set +a
fi

: "${PROCESS_EXECUTOR_URL:?Set PROCESS_EXECUTOR_URL in .server-control.env or the environment}"
: "${PROCESS_EXECUTOR_TOKEN:?Set PROCESS_EXECUTOR_TOKEN in .server-control.env or the environment}"
: "${PROCESS_EXECUTOR_PROJECT:?Set PROCESS_EXECUTOR_PROJECT in .server-control.env or the environment}"
: "${PROCESS_EXECUTOR_WAIT_SECONDS:?Set PROCESS_EXECUTOR_WAIT_SECONDS in .server-control.env or the environment}"

[[ "$PROCESS_EXECUTOR_WAIT_SECONDS" =~ ^[0-9]+$ ]] || { echo 'PROCESS_EXECUTOR_WAIT_SECONDS must be an integer' >&2; exit 64; }
(( PROCESS_EXECUTOR_WAIT_SECONDS >= 1 && PROCESS_EXECUTOR_WAIT_SECONDS <= 300 )) || { echo 'PROCESS_EXECUTOR_WAIT_SECONDS must be between 1 and 300' >&2; exit 64; }

resolve_sha() {
  local ref="$1"
  git -C "$ROOT" fetch --quiet origin || true
  git -C "$ROOT" rev-parse --verify "${ref}^{commit}"
}

json_value() {
  local key="$1"
  python3 -c 'import json,sys; d=json.load(sys.stdin); print(d.get(sys.argv[1], ""))' "$key"
}

deploy() {
  local environment="$1" ref="$2" sha response state requested commit status
  [[ "$environment" =~ ^(dev|prod)$ ]] || { echo "invalid environment: $environment" >&2; exit 64; }
  sha="$(resolve_sha "$ref")"
  [[ "$sha" =~ ^[0-9a-fA-F]{40}$ ]] || { echo 'commit must resolve to a full 40-character SHA' >&2; exit 64; }

  printf 'Deploying %s to %s (%s)\n' "$sha" "$environment" "$PROCESS_EXECUTOR_PROJECT"
  response="$(curl --fail-with-body --silent --show-error \
    --request POST \
    --header 'Content-Type: application/json' \
    --header "X-Process-Token: ${PROCESS_EXECUTOR_TOKEN}" \
    --data "{\"sha\":\"${sha}\"}" \
    "${PROCESS_EXECUTOR_URL}/api/${PROCESS_EXECUTOR_PROJECT}/${environment}/deploy")"
  printf '%s\n' "$response"

  while true; do
    sleep "$PROCESS_EXECUTOR_WAIT_SECONDS"
    state="$(curl --fail-with-body --silent --show-error \
      --header "X-Process-Token: ${PROCESS_EXECUTOR_TOKEN}" \
      "${PROCESS_EXECUTOR_URL}/api/${PROCESS_EXECUTOR_PROJECT}/${environment}/state")"
    requested="$(printf '%s' "$state" | json_value requestedCommit)"
    commit="$(printf '%s' "$state" | json_value commit)"
    status="$(printf '%s' "$state" | json_value status)"
    printf 'status=%s requested=%s commit=%s\n' "$status" "$requested" "$commit"

    if [[ "$requested" == "$sha" && "$commit" == "$sha" && "$status" == ok ]]; then
      printf 'Deployment succeeded: %s -> %s\n' "$sha" "$environment"
      return 0
    fi
    if [[ "$requested" == "$sha" && "$status" == failed ]]; then
      printf 'Deployment failed: %s -> %s\n%s\n' "$sha" "$environment" "$state" >&2
      return 1
    fi
  done
}

if [[ "${1:-}" == deploy ]]; then
  environment="${2:-}"
  ref="${3:-HEAD}"
  deploy "$environment" "$ref"
  exit
fi

if [[ $# -gt 0 ]]; then
  echo 'usage: ./server-control.bash [deploy <dev|prod> <commit-ref>]' >&2
  exit 64
fi

printf '%s\n' 'Deployment target:'
printf '%s\n' '  1) dev  -> https://dev.devabdullah.com'
printf '%s\n' '  2) prod -> https://devabdullah.com'
read -r -p 'Choose 1 or 2: ' choice
case "$choice" in
  1) environment=dev ;;
  2) environment=prod ;;
  *) echo 'invalid selection' >&2; exit 64 ;;
esac
read -r -p 'Commit SHA/ref: ' ref
[[ -n "$ref" ]] || { echo 'commit SHA/ref is required' >&2; exit 64; }
deploy "$environment" "$ref"
