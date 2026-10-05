# CI/CD for devabdullah.com with process-executor

This document describes the intended CI/CD design for `devabdullah.com` on server `a1`.

It follows the server's existing deployment model:

1. GitHub Actions validates the repository.
2. CI sends an authenticated request containing an exact 40-character Git commit SHA.
3. The existing server-side `process-executor` performs the deployment.
4. The deployment targets that exact SHA, builds on the server, restarts systemd user services, verifies health, and writes deployment state.

GitHub Actions does not receive SSH credentials, Cloudflare credentials, server filesystem credentials, application secrets, or a server-side repository token.

## 1. Existing deployment control plane

On `a1`:

```text
Checkout:      /devabdullah/server-utils/process-executor
Listener:      127.0.0.1:8787
Public URL:    https://process-executor.devabdullah.com
Auth header:   X-Process-Token
Config:        /devabdullah/server-utils/process-executor/config.json
Environment:   /devabdullah/server-utils/process-executor/.env
State:         /devabdullah/server-utils/process-executor/state/
Service:       process-executor.service
```

The service is already running as a systemd user service and is already exposed through the `a1-aby` Cloudflare tunnel.

Use this existing executor. Do not deploy another `process-executor` instance for this site.

## 2. Production target

This repository currently has one deployment target:

```text
Environment:       prod
Public hostname:   https://devabdullah.com
Checkout:          /devabdullah/apps/devabdullah.com
Runtime data:      /devabdullah/deployment-data/devabdullah.com
Frontend service:  devabdullah-frontend.service
Proxy service:     devabdullah-rev-proxy.service
Frontend:          127.0.0.1:3000
Reverse proxy:     127.0.0.1:4000
Backend future:    127.0.0.1:4100
```

No development hostname is defined in this runbook. Add a separate environment only when a real dev/staging hostname and isolation requirements are decided.

## 3. CI/CD request flow

```text
push to main / manual workflow
          |
          | verify frontend + reverse proxy
          v
GitHub Actions
          |
          | exact GITHUB_SHA
          | HTTPS + X-Process-Token
          v
https://process-executor.devabdullah.com
          |
          v
127.0.0.1:8787 process-executor
          |
          | fixed configured operation
          v
/devabdullah/server-utils/process-executor/scripts/devabdullah-operation.sh
          |
          +-- fetch exact SHA
          +-- reset checkout to SHA
          +-- build/test frontend
          +-- build/test reverse proxy
          +-- restart systemd user services
          +-- localhost health checks
          +-- write deployment state
```

CI sends data, not shell commands.

## 4. Exact-SHA rule

Every deployment request must contain a full Git commit SHA matching:

```text
^[0-9a-fA-F]{40}$
```

The server must deploy that exact object rather than a moving branch tip.

The deployment operation must use the equivalent of:

```bash
git fetch --force --prune origin '+refs/heads/*:refs/remotes/origin/*'
git cat-file -e "${requested_sha}^{commit}"
git reset --hard "$requested_sha"
git clean -ffdx
```

This prevents `main` from changing between CI verification and server deployment.

## 5. process-executor endpoints

Merge project-specific entries into the existing:

```text
/devabdullah/server-utils/process-executor/config.json
```

Do not replace the existing Seamoro or LLM Server entries.

Recommended deployment endpoint:

```json
{
  "id": "devabdullah-deploy-prod",
  "method": "POST",
  "path": "/api/devabdullah/prod/deploy",
  "auth": true,
  "type": "process",
  "async": true,
  "lock": "devabdullah-prod",
  "params": {
    "sha": {
      "source": "body",
      "required": true,
      "pattern": "^[0-9a-fA-F]{40}$",
      "maxLength": 40
    }
  },
  "command": {
    "file": "/devabdullah/server-utils/process-executor/scripts/devabdullah-operation.sh",
    "args": ["deploy", "prod", "${params.sha}"],
    "env": {}
  }
}
```

Use asynchronous execution because install/build work can outlive a normal Cloudflare request window.

Do not expose a generic shell/command endpoint.

## 6. Deployment state endpoint

The operation should maintain:

```text
/devabdullah/server-utils/process-executor/state/devabdullah-prod.json
```

Recommended authenticated state endpoint:

```json
{
  "id": "devabdullah-state-prod",
  "method": "GET",
  "path": "/api/devabdullah/prod/state",
  "auth": true,
  "type": "json-file",
  "file": "./state/devabdullah-prod.json"
}
```

Optional compact hash/status endpoint:

```json
{
  "id": "devabdullah-hash-prod",
  "method": "GET",
  "path": "/api/devabdullah/prod/hash",
  "auth": true,
  "type": "json-file",
  "file": "./state/devabdullah-prod.json",
  "pick": ["environment", "commit", "status", "lastUpdated"]
}
```

A state record should contain at least:

```json
{
  "environment": "prod",
  "commit": "0123456789abcdef0123456789abcdef01234567",
  "status": "running",
  "lastOperation": "deploy",
  "lastUpdated": "2026-01-01T00:00:00Z"
}
```

Final `status` is either `ok` or `failed`.

The state should be written atomically so readers never observe partially written JSON.

## 7. Server deployment operation

Create on `a1`:

```text
/devabdullah/server-utils/process-executor/scripts/devabdullah-operation.sh
```

The script must expose only fixed operations and validate all arguments itself even though `process-executor` already validates request parameters.

Accepted invocation:

```text
deploy prod <40-character-sha>
```

Everything else is rejected.

### Required deployment sequence

The `deploy` operation should perform these steps in order.

### 7.1 Validate input

Require:

```bash
[[ "$environment" == "prod" ]]
[[ "$sha" =~ ^[0-9a-fA-F]{40}$ ]]
```

### 7.2 Select fixed paths

```text
checkout:     /devabdullah/apps/devabdullah.com
frontend env: /devabdullah/deployment-data/devabdullah.com/frontend.env
proxy env:    /devabdullah/deployment-data/devabdullah.com/rev-proxy.env
frontend svc: devabdullah-frontend.service
proxy svc:    devabdullah-rev-proxy.service
state:        /devabdullah/server-utils/process-executor/state/devabdullah-prod.json
```

No request parameter may select a filesystem path, executable, service name, repository URL, or working directory.

### 7.3 Mark state running

Before modifying the checkout, atomically write the requested SHA with:

```text
status=running
lastOperation=deploy
```

This lets CI distinguish a new deployment from the previous successful state.

### 7.4 Ensure checkout

If the checkout is absent, clone only the fixed repository:

```text
https://github.com/MAbdullahAhmad/devabdullah.com.git
```

The repository is currently public, so no repository credential is required.

If the repository later becomes private, store a least-privilege read token only in:

```text
/devabdullah/server-utils/process-executor/.env
```

Use a project-specific variable such as:

```text
DEVABDULLAH_GITHUB_TOKEN=<secret>
```

Map it only into the deployment child process and use `GIT_ASKPASS`; never put the token in the Git URL or request body.

### 7.5 Fetch and reset to the exact SHA

```bash
cd /devabdullah/apps/devabdullah.com

git fetch --force --prune origin '+refs/heads/*:refs/remotes/origin/*'
git cat-file -e "${sha}^{commit}"
git reset --hard "$sha"
git clean -ffdx
```

### 7.6 Require Node.js 24

The frontend requires Node `>=24 <27` while the server's existing `/usr/bin/node` is Node 22.

The deployment script should use the side-by-side project runtime described in `linux-cloudflared.md`:

```bash
export PATH=/opt/node24/bin:$PATH
node --version
```

Fail before changing services if Node.js does not satisfy the repository engine requirement.

Do not silently replace `/usr/bin/node`; `process-executor.service` currently relies on it.

### 7.7 Build and verify the frontend

Require the external runtime file:

```bash
test -f /devabdullah/deployment-data/devabdullah.com/frontend.env
```

Then:

```bash
cd /devabdullah/apps/devabdullah.com/project/frontend

set -a
. /devabdullah/deployment-data/devabdullah.com/frontend.env
set +a

npm ci --ignore-scripts
npm run check
```

`npm run check` must succeed before any application service is restarted.

### 7.8 Build and verify the reverse proxy

Require:

```bash
test -f /devabdullah/deployment-data/devabdullah.com/rev-proxy.env
```

Then:

```bash
cd /devabdullah/apps/devabdullah.com/project/rev-proxy
npm ci --ignore-scripts
npm run typecheck
npm test
```

### 7.9 Restart services

Only after all builds/tests succeed:

```bash
systemctl --user enable --now devabdullah-frontend.service
systemctl --user enable --now devabdullah-rev-proxy.service

systemctl --user restart devabdullah-frontend.service
systemctl --user restart devabdullah-rev-proxy.service
```

The frontend should restart before the proxy.

### 7.10 Verify localhost

```bash
curl --fail --head http://127.0.0.1:3000/
curl --fail http://127.0.0.1:4000/health
curl --fail --head http://127.0.0.1:4000/
```

Do not health-check `/api/*` yet. The backend is intentionally empty and port `4100` is not expected to be listening.

### 7.11 Mark deployment successful

After local checks pass, atomically update state to:

```text
status=ok
commit=<requested SHA>
lastOperation=deploy
lastUpdated=<UTC timestamp>
```

### 7.12 Failure behavior

On failure:

- exit non-zero;
- do not report the SHA as successfully deployed;
- write `status=failed` for the requested SHA;
- preserve enough stdout/stderr in the executor operation log for diagnosis;
- never print secrets;
- leave the previous service processes running when failure occurs before restart.

If restart occurred but a health check failed, the operation should report failure rather than pretending the deployment succeeded.

## 8. Executor locking

Use one lock for all production mutations:

```text
devabdullah-prod
```

This prevents two deploy operations from modifying the same checkout and services concurrently.

`process-executor` locks are process-local. Keep a single executor instance on this server, matching the existing server design.

## 9. Validate process-executor changes

After editing the executor config or project script:

```bash
cd /devabdullah/server-utils/process-executor

./scripts/validate-config.sh ./config.json
npm test
systemctl --user restart process-executor.service
systemctl --user status process-executor.service --no-pager
```

Health checks:

```bash
curl --fail http://127.0.0.1:8787/health
curl --fail https://process-executor.devabdullah.com/health
```

Also verify that:

- missing token is rejected;
- bad token is rejected;
- malformed SHA is rejected;
- concurrent production deploys cannot overlap;
- state endpoints require authentication;
- executor/audit logs do not contain credentials.

## 10. GitHub repository configuration

The GitHub repository needs one Actions secret:

```text
PROCESS_EXECUTOR_TOKEN
```

Its value must match the request credential configured by the existing executor:

```text
X-Process-Token
```

Recommended repository variable:

```text
PROCESS_EXECUTOR_URL=https://process-executor.devabdullah.com
```

GitHub Actions does not need:

- an SSH private key;
- Cloudflare credentials;
- application SMTP/Resend secrets;
- `/devabdullah/deployment-data` contents;
- systemd credentials;
- a server repository token while this repository is public.

If a private-repository read token is introduced later, it remains server-side in the executor `.env`; it is not a GitHub Actions deployment secret.

## 11. CI/CD workflow

Create when deployment automation is enabled:

```text
.github/workflows/ci-cd.yml
```

Recommended workflow:

```yaml
name: CI/CD

on:
  push:
    branches: [main]
  workflow_dispatch:

concurrency:
  group: devabdullah-production
  cancel-in-progress: false

permissions:
  contents: read

jobs:
  verify:
    runs-on: ubuntu-latest

    steps:
      - name: Check out repository
        uses: actions/checkout@v4

      - name: Set up Node.js 24
        uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: npm
          cache-dependency-path: |
            project/frontend/package-lock.json
            project/rev-proxy/package-lock.json

      - name: Verify frontend
        working-directory: project/frontend
        env:
          NEXT_PUBLIC_SITE_URL: https://devabdullah.com
          SITE_INDEXABLE: "false"
        run: |
          set -Eeuo pipefail
          npm ci --ignore-scripts
          npm run check

      - name: Verify reverse proxy
        working-directory: project/rev-proxy
        run: |
          set -Eeuo pipefail
          npm ci --ignore-scripts
          npm run typecheck
          npm test

  deploy:
    needs: verify
    runs-on: ubuntu-latest
    environment: production

    steps:
      - name: Signal exact commit to production
        env:
          PROCESS_EXECUTOR_URL: ${{ vars.PROCESS_EXECUTOR_URL }}
          PROCESS_EXECUTOR_TOKEN: ${{ secrets.PROCESS_EXECUTOR_TOKEN }}
        run: |
          set -Eeuo pipefail

          [[ "${GITHUB_SHA}" =~ ^[0-9a-fA-F]{40}$ ]]

          curl --fail-with-body --silent --show-error \
            --request POST \
            --header 'Content-Type: application/json' \
            --header "X-Process-Token: ${PROCESS_EXECUTOR_TOKEN}" \
            --data "{\"sha\":\"${GITHUB_SHA}\"}" \
            "${PROCESS_EXECUTOR_URL}/api/devabdullah/prod/deploy"

      - name: Wait for deployment result
        env:
          PROCESS_EXECUTOR_URL: ${{ vars.PROCESS_EXECUTOR_URL }}
          PROCESS_EXECUTOR_TOKEN: ${{ secrets.PROCESS_EXECUTOR_TOKEN }}
        run: |
          set -Eeuo pipefail

          for attempt in $(seq 1 90); do
            state="$({
              curl --fail-with-body --silent --show-error \
                --header "X-Process-Token: ${PROCESS_EXECUTOR_TOKEN}" \
                "${PROCESS_EXECUTOR_URL}/api/devabdullah/prod/state"
            })"

            commit="$(jq -r '.commit // ""' <<<"$state")"
            status="$(jq -r '.status // ""' <<<"$state")"

            if [[ "$commit" == "$GITHUB_SHA" && "$status" == "ok" ]]; then
              echo "Deployment succeeded: $GITHUB_SHA"
              exit 0
            fi

            if [[ "$commit" == "$GITHUB_SHA" && "$status" == "failed" ]]; then
              echo "Deployment failed: $GITHUB_SHA" >&2
              echo "$state" >&2
              exit 1
            fi

            sleep 10
          done

          echo "Timed out waiting for deployment state for $GITHUB_SHA" >&2
          exit 1
```

The verification build uses `SITE_INDEXABLE=false` because the GitHub runner is not the production deployment. The server build uses the production `frontend.env`, where indexing can be enabled.

`cancel-in-progress: false` intentionally prevents a newer workflow from interrupting an in-flight production signal. The executor lock provides a second protection against overlapping server mutations.

## 12. Production environment approval

The workflow uses:

```yaml
environment: production
```

A GitHub `production` environment may optionally enforce required reviewers.

If required reviewers are enabled, CI still runs automatically, but the deployment job waits for approval. If true automatic continuous deployment from `main` is desired, leave the production environment without a manual approval requirement.

## 13. Why CI builds and the server builds again

CI verification and server build serve different purposes.

CI verifies that the commit is suitable for deployment before sending a signal.

The server then builds the exact SHA itself because:

- the server owns its runtime environment;
- no compiled artifact trust/distribution mechanism is currently configured;
- the server must not assume CI's workspace is identical to production;
- deployment remains reproducible from Git plus the protected runtime overlay.

If artifact-based deployments are introduced later, document integrity/signing and rollback semantics before removing the server build.

## 14. Manual deployment request

An operator can signal the same exact endpoint without SSH deployment commands.

Example:

```bash
SHA=0123456789abcdef0123456789abcdef01234567

curl --fail-with-body --silent --show-error \
  --request POST \
  --header 'Content-Type: application/json' \
  --header "X-Process-Token: ${PROCESS_EXECUTOR_TOKEN}" \
  --data "{\"sha\":\"${SHA}\"}" \
  "${PROCESS_EXECUTOR_URL}/api/devabdullah/prod/deploy"
```

Read state:

```bash
curl --fail-with-body --silent --show-error \
  --header "X-Process-Token: ${PROCESS_EXECUTOR_TOKEN}" \
  "${PROCESS_EXECUTOR_URL}/api/devabdullah/prod/state"
```

The request credential should be loaded from an environment file or secret store, not pasted into shell history.

## 15. Rollback through CI/CD

Rollback is another exact-SHA deployment.

1. identify the previous known-good commit;
2. run the production workflow for that Git ref/SHA, or send the exact SHA to the deployment endpoint;
3. let the same build, restart, health, and state checks run;
4. verify `https://devabdullah.com` after state reports `ok`.

Do not implement a generic `git checkout` or arbitrary shell endpoint for rollback.

## 16. Cloudflare is not part of normal CD

Normal application deployment does not edit or restart Cloudflare.

Cloudflare is a one-time/rare infrastructure concern documented in `linux-cloudflared.md`.

CI/CD changes Cloudflare only if the deployment architecture itself changes, such as:

- public hostname;
- tunnel/account;
- reverse-proxy listener port;
- ingress ownership.

This separation reduces the blast radius of ordinary application releases.

## 17. Backend integration later

The current deployment intentionally manages only:

```text
devabdullah-frontend.service
devabdullah-rev-proxy.service
```

`project/backend` is empty today.

When a backend is implemented:

1. give it its own runtime env outside Git;
2. bind it to `127.0.0.1:4100` unless the proxy contract is deliberately changed;
3. add a dedicated systemd user service;
4. add its install/test/build/migration steps to `devabdullah-operation.sh`;
5. start/restart it before the reverse proxy health verification;
6. add a backend-local health check;
7. keep Cloudflare pointed at `127.0.0.1:4000`.

The public route contract remains:

```text
/api/* -> reverse proxy -> backend, with /api stripped
all other requests -> reverse proxy -> frontend
```

## 18. Failure and recovery rules

The deployment must fail closed:

- malformed request: reject before spawning;
- wrong auth token: reject;
- concurrent deployment: reject/lock rather than overlap;
- Git fetch/SHA verification failure: do not restart services;
- dependency/build/test failure: do not restart services;
- restart failure: mark deployment failed;
- local health failure: mark deployment failed;
- state-write failure: treat as an operational error requiring investigation;
- never label an unverified commit as successfully deployed.

The previous running processes should remain available whenever failure happens before the restart step.

## 19. Security rules

Keep these boundaries:

- `process-executor` remains bound to `127.0.0.1:8787`;
- the executor is exposed publicly only through Cloudflare Tunnel;
- every deployment/state endpoint requires authentication;
- the request credential is separate from any repository credential;
- request values cannot choose commands or filesystem paths;
- deployment accepts only full commit SHAs;
- no `bash -c`, `sh -c`, `eval`, or arbitrary command request is introduced;
- server/application secrets remain under `/devabdullah/deployment-data` or the executor `.env`;
- GitHub Actions receives only the executor request credential;
- application listeners remain on loopback;
- executor logs must not print tokens or application secrets.

## 20. Implementation checklist

Before enabling production CI/CD, confirm:

### Server deployment

- `linux-cloudflared.md` deployment has been completed successfully;
- Node.js 24 is available at the documented project path;
- frontend and reverse-proxy systemd services are healthy;
- `https://devabdullah.com` resolves through `a1-aby` and serves the proxy.

### Executor

- `devabdullah-operation.sh` exists and is executable;
- deploy endpoint is merged into the existing executor config;
- state/hash endpoint is merged into the existing config;
- SHA regex is exactly 40 hex characters;
- production lock is configured;
- config validation passes;
- executor tests pass;
- executor service restarts cleanly;
- invalid token/SHA tests fail as expected.

### GitHub

- code is pushed to `MAbdullahAhmad/devabdullah.com`;
- default branch is `main`;
- `PROCESS_EXECUTOR_TOKEN` secret is configured;
- `PROCESS_EXECUTOR_URL` variable is configured;
- `production` environment exists if the workflow uses it;
- CI passes on Node.js 24;
- deployment job sends `GITHUB_SHA`, not a branch name.

### End-to-end

- a known commit can be deployed through the executor;
- state changes `running -> ok` for the requested SHA;
- failed deployments report `failed`;
- `curl http://127.0.0.1:4000/health` succeeds after deployment;
- `curl -I https://devabdullah.com/` succeeds;
- server and executor logs contain no credentials.
