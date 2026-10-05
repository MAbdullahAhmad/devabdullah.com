# Deploy devabdullah.com on Linux with Cloudflare Tunnel

This runbook documents the intended production deployment of this repository on server `a1` using systemd user services and the server's existing Cloudflare Tunnel infrastructure.

It is specific to the current repository layout and to the existing `a1` conventions documented in `/home/ubuntu/cf.md` and `/home/ubuntu/serve.md`.

## 1. Deployment architecture

The public hostname is:

```text
https://devabdullah.com
```

The request path is:

```text
Internet
   |
   v
Cloudflare HTTPS
   |
   v
a1-aby Cloudflare Tunnel
   |
   v
127.0.0.1:4000  devabdullah reverse proxy
   |
   +-- /api/* ---> 127.0.0.1:4100  backend placeholder
   |                 /api prefix is stripped
   |
   +-- everything else ---> 127.0.0.1:3000  Next.js frontend
```

Cloudflare should point the hostname only at the repository reverse proxy on port `4000`.

Do not duplicate `/api/*` routing in the Cloudflare config. `project/rev-proxy` owns application routing.

The backend is intentionally empty today. Until a backend service is implemented on `127.0.0.1:4100`, requests under `/api/*` are expected to fail at the reverse proxy. This is not a frontend deployment failure.

## 2. Existing a1 infrastructure

The server currently follows this layout:

```text
/devabdullah/
├── apps/
├── deployment-data/
└── server-utils/
```

Relevant existing infrastructure:

```text
Cloudflare zone:       devabdullah.com
Tunnel:                a1-aby
Tunnel config:         /etc/cloudflared/aby/config.yml
Tunnel service:        cloudflared-aby.service
Origin certificate:    ~/.cloudflared/aby/cert.pem
process-executor:      127.0.0.1:8787
process-executor URL:  https://process-executor.devabdullah.com
```

Applications exposed through Cloudflare remain bound to `127.0.0.1`; application ports do not need to be opened publicly.

## 3. Runtime requirement: Node.js 24

The frontend declares:

```text
node >=24 <27
```

At the time this runbook was written, `a1` has system Node.js 22 at `/usr/bin/node`. The existing `process-executor.service` also uses `/usr/bin/node`.

Do not replace the server's Node.js 22 installation just to deploy this site. Install Node.js 24 side-by-side for this project and use an explicit path such as:

```text
/opt/node24/bin/node
/opt/node24/bin/npm
```

After installation, verify:

```bash
/opt/node24/bin/node --version
PATH=/opt/node24/bin:$PATH npm --version
```

The Node version must satisfy `>=24 <27` before building or starting the frontend.

If the server runtime is upgraded globally later, update the unit files accordingly only after checking the other services that use `/usr/bin/node`.

## 4. Server directory layout

Use one production checkout and keep runtime configuration outside Git:

```text
/devabdullah/
├── apps/
│   └── devabdullah.com/
│       ├── project/frontend/
│       ├── project/backend/
│       └── project/rev-proxy/
│
└── deployment-data/
    └── devabdullah.com/
        ├── frontend.env
        └── rev-proxy.env
```

Create the directories:

```bash
mkdir -p /devabdullah/apps
mkdir -p /devabdullah/deployment-data/devabdullah.com
chmod 700 /devabdullah/deployment-data/devabdullah.com
```

## 5. Clone the repository

The repository is:

```text
https://github.com/MAbdullahAhmad/devabdullah.com
```

Clone it:

```bash
cd /devabdullah/apps
git clone https://github.com/MAbdullahAhmad/devabdullah.com.git devabdullah.com
cd /devabdullah/apps/devabdullah.com
```

The repository is currently public, so the initial deployment does not require a GitHub read token. If it becomes private, use the server-side credential pattern described in `docs/deploy/ci-cd.md`; do not embed a token in the Git remote URL.

## 6. Frontend production environment

Create:

```text
/devabdullah/deployment-data/devabdullah.com/frontend.env
```

Start with:

```dotenv
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://devabdullah.com
SITE_INDEXABLE=true

# Leave delivery disabled until the actual mailbox/provider is configured.
SMTP_HOST=
SMTP_PORT=465
SMTP_USER=
SMTP_PASS=
RESEND_API_KEY=
CONTACT_TO=
CONTACT_FROM=
```

Protect it:

```bash
chmod 600 /devabdullah/deployment-data/devabdullah.com/frontend.env
```

`NEXT_PUBLIC_*` values are consumed during the Next.js build, so the deployment process must load this file before `npm run check` / `next build`, not only when the service starts.

Do not add real SMTP, Resend, or mailbox credentials to Git.

## 7. Reverse-proxy production environment

Create:

```text
/devabdullah/deployment-data/devabdullah.com/rev-proxy.env
```

Use:

```dotenv
NODE_ENV=production
CONFIG_SOURCE=env
HEAD_HOST=127.0.0.1
HEAD_PORT=4000

SERVICE_1_LABEL=backend-api
SERVICE_1_PATH=/api
SERVICE_1_URL=http://127.0.0.1:4100
SERVICE_1_MATCH=**
SERVICE_1_REWRITE_FROM=^/api(?:/(.*))?$
SERVICE_1_REWRITE_TO=/$1

SERVICE_2_LABEL=frontend
SERVICE_2_PATH=/
SERVICE_2_URL=http://127.0.0.1:3000
SERVICE_2_MATCH=**
```

Protect it:

```bash
chmod 600 /devabdullah/deployment-data/devabdullah.com/rev-proxy.env
```

Using `CONFIG_SOURCE=env` keeps the production bind/route settings explicit in the server runtime overlay while preserving the checked-in development defaults.

## 8. Install and build the frontend

Use Node.js 24 explicitly:

```bash
export PATH=/opt/node24/bin:$PATH
cd /devabdullah/apps/devabdullah.com/project/frontend

set -a
. /devabdullah/deployment-data/devabdullah.com/frontend.env
set +a

npm ci --include=dev --ignore-scripts
npm run check
```

`npm run check` currently performs:

1. ESLint;
2. Next.js type generation and TypeScript checking;
3. Prettier validation;
4. `next build`.

A deployment must not restart the running frontend if this command fails.

## 9. Install, test, and build the reverse proxy

```bash
export PATH=/opt/node24/bin:$PATH
cd /devabdullah/apps/devabdullah.com/project/rev-proxy

npm ci --include=dev --ignore-scripts
npm run typecheck
npm test
```

`npm test` builds the TypeScript project and runs the proxy routing tests.

The production entrypoint is:

```text
project/rev-proxy/dist/src/main.js
```

## 10. Frontend systemd user service

Create:

```text
/home/ubuntu/.config/systemd/user/devabdullah-frontend.service
```

Contents:

```ini
[Unit]
Description=devabdullah.com Next.js frontend
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
WorkingDirectory=/devabdullah/apps/devabdullah.com/project/frontend
EnvironmentFile=/devabdullah/deployment-data/devabdullah.com/frontend.env
ExecStart=/opt/node24/bin/node /devabdullah/apps/devabdullah.com/project/frontend/node_modules/next/dist/bin/next start -H 127.0.0.1 -p 3000
Restart=on-failure
RestartSec=3

[Install]
WantedBy=default.target
```

The explicit `-H 127.0.0.1` is important because `next start` otherwise defaults to listening on all interfaces.

## 11. Reverse-proxy systemd user service

Create:

```text
/home/ubuntu/.config/systemd/user/devabdullah-rev-proxy.service
```

Contents:

```ini
[Unit]
Description=devabdullah.com reverse proxy
After=network-online.target devabdullah-frontend.service
Wants=network-online.target
Requires=devabdullah-frontend.service

[Service]
Type=simple
WorkingDirectory=/devabdullah/apps/devabdullah.com/project/rev-proxy
EnvironmentFile=/devabdullah/deployment-data/devabdullah.com/rev-proxy.env
ExecStart=/opt/node24/bin/node /devabdullah/apps/devabdullah.com/project/rev-proxy/dist/src/main.js
Restart=on-failure
RestartSec=3

[Install]
WantedBy=default.target
```

There is no backend unit yet because `project/backend` is intentionally empty.

When a backend is implemented, add its own service on `127.0.0.1:4100`. The reverse-proxy and Cloudflare design do not need to change unless the backend port or route contract changes.

## 12. Enable the application services

`ubuntu` already has user lingering enabled on `a1`, so enabled user units continue without an interactive SSH session and start after reboot.

Reload and start:

```bash
systemctl --user daemon-reload
systemctl --user enable --now devabdullah-frontend.service
systemctl --user enable --now devabdullah-rev-proxy.service
```

Check status:

```bash
systemctl --user status devabdullah-frontend.service --no-pager
systemctl --user status devabdullah-rev-proxy.service --no-pager
```

Follow logs:

```bash
journalctl --user -u devabdullah-frontend.service -f
journalctl --user -u devabdullah-rev-proxy.service -f
```

## 13. Verify localhost before Cloudflare

Frontend directly:

```bash
curl --fail --head http://127.0.0.1:3000/
```

Reverse-proxy health endpoint:

```bash
curl --fail http://127.0.0.1:4000/health
```

Expected health response shape:

```json
{"ok":true,"service":"rev-proxy"}
```

Frontend through the reverse proxy:

```bash
curl --fail --head http://127.0.0.1:4000/
```

Check listeners:

```bash
ss -ltnp | grep -E ':(3000|4000|4100)\b' || true
```

At this stage ports `3000` and `4000` should be listening on loopback. Port `4100` is not expected until a backend is added.

Do not use `/api/*` as a deployment health check while the backend is still absent.

## 14. Add devabdullah.com to the existing Cloudflare tunnel

The `devabdullah.com` zone belongs to tunnel `a1-aby`.

Edit:

```text
/etc/cloudflared/aby/config.yml
```

Preserve every existing ingress rule. Add this rule before the final `http_status:404` catch-all:

```yaml
  - hostname: devabdullah.com
    service: http://127.0.0.1:4000
```

The resulting relevant shape is:

```yaml
ingress:
  # existing application rules remain unchanged

  - hostname: devabdullah.com
    service: http://127.0.0.1:4000

  - service: http_status:404
```

Only one Cloudflare rule is required for this application because `project/rev-proxy` performs the `/api/*` versus frontend split.

## 15. Validate the tunnel config

Before restarting anything:

```bash
sudo cloudflared tunnel \
  --config /etc/cloudflared/aby/config.yml \
  ingress validate
```

Do not restart `cloudflared-aby.service` until validation succeeds.

## 16. Create the Cloudflare DNS route

Use the origin certificate belonging to the same `aby` account:

```bash
cloudflared tunnel \
  --origincert ~/.cloudflared/aby/cert.pem \
  route dns a1-aby devabdullah.com
```

If an apex DNS record for `devabdullah.com` already exists, inspect it before replacing anything. Use `-f` / `--overwrite-dns` only when intentionally replacing the existing record with the tunnel route.

Do not use the `es` tunnel or the `eigensol.com` Cloudflare account for this hostname.

## 17. Restart the correct Cloudflare service

Restart only the tunnel whose configuration changed:

```bash
sudo systemctl restart cloudflared-aby.service
sudo systemctl status cloudflared-aby.service --no-pager
```

Logs:

```bash
sudo journalctl -u cloudflared-aby.service -f
```

## 18. Verify the public deployment

Check the site:

```bash
curl --fail --head https://devabdullah.com/
```

Check a normal application route:

```bash
curl --fail --head https://devabdullah.com/about
```

The public request should traverse:

```text
Cloudflare -> a1-aby -> 127.0.0.1:4000 -> 127.0.0.1:3000
```

Also verify in a browser:

- home page renders;
- navigation works;
- CSS/fonts/assets load;
- direct navigation to a Next.js route works;
- HTTPS is valid;
- no server port is publicly exposed.

## 19. Normal manual update procedure

Before CI/CD is enabled, update an existing checkout with an exact known commit:

```bash
cd /devabdullah/apps/devabdullah.com

git fetch --force --prune origin '+refs/heads/*:refs/remotes/origin/*'
git reset --hard <40-character-commit-sha>
git clean -ffdx
```

Build frontend:

```bash
export PATH=/opt/node24/bin:$PATH
cd project/frontend
set -a
. /devabdullah/deployment-data/devabdullah.com/frontend.env
set +a
npm ci --include=dev --ignore-scripts
npm run check
```

Build/test proxy:

```bash
cd ../rev-proxy
npm ci --include=dev --ignore-scripts
npm run typecheck
npm test
```

Restart only after both components pass:

```bash
systemctl --user restart devabdullah-frontend.service
systemctl --user restart devabdullah-rev-proxy.service
```

Then verify localhost first and `https://devabdullah.com` second.

Ordinary application releases do not require changes to Cloudflare unless the hostname, tunnel, or reverse-proxy port changes.

## 20. Rollback

Application rollback is commit-based:

1. identify the previous known-good 40-character commit SHA;
2. fetch it and verify it exists;
3. reset the server checkout to that exact SHA;
4. reinstall locked dependencies;
5. rebuild and rerun checks;
6. restart the frontend and reverse proxy;
7. verify localhost and then the public hostname.

Example Git verification:

```bash
git fetch --force --prune origin '+refs/heads/*:refs/remotes/origin/*'
git cat-file -e '<sha>^{commit}'
git reset --hard '<sha>'
git clean -ffdx
```

Do not roll back by changing Cloudflare configuration unless the incident is specifically an ingress problem.

## 21. Operational commands

Application services:

```bash
systemctl --user status devabdullah-frontend.service
systemctl --user status devabdullah-rev-proxy.service

journalctl --user -u devabdullah-frontend.service -f
journalctl --user -u devabdullah-rev-proxy.service -f
```

Listening sockets:

```bash
ss -ltnp | grep -E ':(3000|4000|4100)\b' || true
```

Cloudflare:

```bash
sudo cloudflared tunnel --config /etc/cloudflared/aby/config.yml ingress validate
sudo systemctl status cloudflared-aby.service
sudo journalctl -u cloudflared-aby.service -f
```

## 22. Security checklist

Before considering the deployment complete, confirm:

- frontend binds to `127.0.0.1:3000`;
- reverse proxy binds to `127.0.0.1:4000`;
- future backend binds to `127.0.0.1:4100`;
- Cloudflare Tunnel is the only public ingress;
- the `devabdullah.com` hostname is on `a1-aby`;
- `/etc/cloudflared/aby/config.yml` still ends with `http_status:404`;
- unrelated Cloudflare ingress rules were preserved;
- runtime environment files are outside Git and mode `600`;
- no Git token is embedded in a remote URL;
- no SMTP/API credential is committed;
- Node.js 24 is used for this project without unexpectedly replacing the Node.js runtime used by existing server utilities;
- frontend checks pass before restart;
- reverse-proxy typecheck/tests pass before restart;
- production dependency audits are reviewed before release.

Useful audit commands:

```bash
cd /devabdullah/apps/devabdullah.com/project/frontend
PATH=/opt/node24/bin:$PATH npm audit --omit=dev

cd /devabdullah/apps/devabdullah.com/project/rev-proxy
PATH=/opt/node24/bin:$PATH npm audit --omit=dev
```
