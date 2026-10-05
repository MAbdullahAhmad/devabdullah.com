# CI/CD for devabdullah.com

## Deployment policy

The repository has two independent deployment targets on server `a1`.

| Environment | Public URL | Server checkout | Service | Port |
| --- | --- | --- | --- | ---: |
| Development | `https://dev.devabdullah.com` | `/devabdullah/apps/devabdullah.com-dev` | `devabdullah-dev.service` | `127.0.0.1:3001` |
| Production | `https://devabdullah.com` | `/devabdullah/apps/devabdullah.com-prod` | `devabdullah-prod.service` | `127.0.0.1:3000` |

Every push to `main` is verified and, if verification succeeds, the exact pushed SHA is deployed to development.

Production is intentionally opt-in. A push updates production only when the **head commit message is exactly**:

```text
deploy
```

No prefix, suffix, extra line, or different case is accepted by the workflow condition.

Production can also be deployed manually with `./server-control.bash`; this is the normal operator path for deploying an arbitrary known commit to production without creating a `deploy` commit.

## GitHub Actions flow

`.github/workflows/ci-cd.yml` runs on pushes to `main`:

1. Check out the exact pushed commit.
2. Use Node.js 24.
3. Run frontend lint, typecheck, formatting check, and production build.
4. Run reverse-proxy typecheck/tests. The reverse-proxy source remains validated even though the current two-site runtime binds the Next.js servers directly because the repository backend is still empty.
5. Deploy the exact SHA to `dev` through `process-executor`.
6. If and only if the head commit message equals `deploy`, deploy that same SHA to `prod` after the development deployment succeeds.

Workflow deployments call the same `server-control.bash` client used by an operator, with credentials supplied by GitHub Actions variables/secrets.

Repository Actions configuration:

```text
PROCESS_EXECUTOR_URL=https://process-executor.devabdullah.com
PROCESS_EXECUTOR_TOKEN=<repository secret>
```

The workflow supplies:

```text
PROCESS_EXECUTOR_PROJECT=devabdullah
PROCESS_EXECUTOR_WAIT_SECONDS=5
```

## Manual deployment client

The repository root contains:

```text
server-control.bash
.server-control.env.example
```

Create the untracked local file `.server-control.env`:

```dotenv
PROCESS_EXECUTOR_URL=https://process-executor.devabdullah.com
PROCESS_EXECUTOR_TOKEN=<token>
PROCESS_EXECUTOR_PROJECT=devabdullah
PROCESS_EXECUTOR_WAIT_SECONDS=5
```

The real file is ignored by Git and must not be committed.

Interactive usage:

```bash
./server-control.bash
```

It displays a menu for development or production, asks for a commit SHA/ref, resolves it to a full 40-character commit SHA, submits the deployment, and polls until the requested commit succeeds or fails.

Non-interactive usage is also supported:

```bash
./server-control.bash deploy dev HEAD
./server-control.bash deploy prod af880eee57275bfd555e20a8f0413edb03e12c85
```

## process-executor API

The existing executor at `https://process-executor.devabdullah.com` remains the only deployment control plane. It is bound locally to `127.0.0.1:8787` and requires `X-Process-Token` authentication.

Endpoints:

```text
POST /api/devabdullah/:environment/deploy
GET  /api/devabdullah/:environment/state
GET  /api/devabdullah/:environment/hash
```

`environment` is restricted to `dev|prod`. Deploy requests require a full SHA matching:

```regex
^[0-9a-fA-F]{40}$
```

Each environment has an independent executor lock and state file:

```text
dev  -> lock devabdullah-dev  -> state/devabdullah-dev.json
prod -> lock devabdullah-prod -> state/devabdullah-prod.json
```

The executor invokes only the fixed server script:

```text
/devabdullah/server-utils/process-executor/scripts/devabdullah-operation.sh deploy <dev|prod> <sha>
```

The script validates its inputs again, fetches the repository, resets the selected environment checkout to the exact commit object, runs verification/build commands, restarts only that environment's service, verifies localhost health, then writes `ok` or `failed` state.

## Exact-SHA and isolation rules

Development and production never share a checkout. A development deployment therefore cannot mutate the files from which production is currently running, and vice versa.

The deployment script uses Node 24 from `/opt/node24` without replacing `/usr/bin/node`; the existing process executor continues to use the server's system Node runtime.

Frontend builds use:

```bash
npm ci --include=dev --ignore-scripts
npm run check
```

The reverse-proxy source is verified with:

```bash
npm ci --include=dev --ignore-scripts
npm run typecheck
npm test
```

## Rollback

Rollback is simply another exact-SHA deployment. Use the manual client, choose the target environment, and enter the previous known-good commit:

```bash
./server-control.bash
```

This does not rewrite Git history.
