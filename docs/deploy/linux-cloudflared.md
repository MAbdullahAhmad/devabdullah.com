# Dual-environment Linux deployment with Cloudflare Tunnel

## Current topology

Both environments run independently on `a1` and are exposed through the existing `a1-aby` Cloudflare Tunnel.

```text
https://dev.devabdullah.com
        |
        +-- Cloudflare Tunnel a1-aby
        |       |
        |       +--> 127.0.0.1:3001 --> devabdullah-dev.service
        |
https://devabdullah.com
        |
        +-- Cloudflare Tunnel a1-aby
                |
                +--> 127.0.0.1:3000 --> devabdullah-prod.service
```

There are exactly two website listeners for this project:

```text
127.0.0.1:3001  development
127.0.0.1:3000  production
```

The repository reverse-proxy source is still built/tested by CI and deployments, but it is not a running website service while the backend directory remains intentionally empty. This keeps the requested dual-site runtime to one loopback port per website.

## Server paths

```text
Development checkout: /devabdullah/apps/devabdullah.com-dev
Production checkout:  /devabdullah/apps/devabdullah.com-prod

Development data:     /devabdullah/deployment-data/devabdullah.com-dev
Production data:      /devabdullah/deployment-data/devabdullah.com-prod

Node.js 24:           /opt/node24
Executor:             /devabdullah/server-utils/process-executor
Cloudflare config:    /etc/cloudflared/aby/config.yml
```

Each checkout is a separate Git working tree/clone. Deploying one environment must never reset or clean the other environment's checkout.

## Runtime environment files

Development:

```text
/devabdullah/deployment-data/devabdullah.com-dev/frontend.env
```

Important values:

```dotenv
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://dev.devabdullah.com
SITE_INDEXABLE=false
```

Production:

```text
/devabdullah/deployment-data/devabdullah.com-prod/frontend.env
```

Important values:

```dotenv
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://devabdullah.com
SITE_INDEXABLE=true
```

Mail/provider secrets, when configured, remain in these server-side files and are never committed to Git or copied into GitHub Actions.

## systemd user services

Development service:

```ini
[Unit]
Description=dev.devabdullah.com Next.js
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
WorkingDirectory=/devabdullah/apps/devabdullah.com-dev/project/frontend
EnvironmentFile=/devabdullah/deployment-data/devabdullah.com-dev/frontend.env
ExecStart=/opt/node24/bin/node /devabdullah/apps/devabdullah.com-dev/project/frontend/node_modules/next/dist/bin/next start -H 127.0.0.1 -p 3001
Restart=on-failure
RestartSec=3

[Install]
WantedBy=default.target
```

Production service is the same pattern using the production checkout/data paths and port `3000`.

Operational checks:

```bash
systemctl --user status devabdullah-dev.service
systemctl --user status devabdullah-prod.service
ss -ltnp | grep -E ':(3000|3001)\b'
curl --fail --head http://127.0.0.1:3001/
curl --fail --head http://127.0.0.1:3000/
```

## Cloudflare ingress

The two hostname rules must appear before the final catch-all in `/etc/cloudflared/aby/config.yml`:

```yaml
  - hostname: dev.devabdullah.com
    service: http://127.0.0.1:3001
  - hostname: devabdullah.com
    service: http://127.0.0.1:3000
  - service: http_status:404
```

Validate before restart:

```bash
sudo cloudflared tunnel --config /etc/cloudflared/aby/config.yml ingress validate
```

DNS routes are attached to the existing tunnel:

```bash
cloudflared tunnel --origincert ~/.cloudflared/aby/cert.pem route dns a1-aby dev.devabdullah.com
cloudflared tunnel --origincert ~/.cloudflared/aby/cert.pem route dns a1-aby devabdullah.com
```

Normal application deployments do not change Cloudflare configuration.

## Deployment operation

The process executor accepts only exact 40-character commit SHAs. For the selected environment the operation:

1. validates `dev|prod` and the SHA;
2. fetches the public repository into the environment-specific checkout;
3. verifies the commit object exists;
4. performs `git reset --hard <sha>` and `git clean -ffdx` only in that checkout;
5. uses `/opt/node24`;
6. installs frontend dev dependencies and runs `npm run check` with that environment's runtime overlay;
7. installs/tests the reverse-proxy source;
8. restarts only `devabdullah-dev.service` or `devabdullah-prod.service`;
9. verifies the corresponding localhost port;
10. writes environment-specific deployment state.

The repository is public, so no server-side GitHub read token is required. If it becomes private later, a read-only repository token belongs only in the executor's server-side environment and must be injected through `GIT_ASKPASS`; it must not be placed in the repository URL or deployment request.

## Public verification

```bash
curl --fail --head https://dev.devabdullah.com/
curl --fail --head https://devabdullah.com/
```

Development should remain non-indexable. Production is indexable according to its server runtime environment.
