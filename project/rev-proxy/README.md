# Generic rev-proxy

A generic configurable reverse proxy for Node.js projects.

It serves one public head and forwards requests to many configured upstream services. Services are configured through either `src/head.json` or `.env` numbered service entries. No service routes are hardcoded in source code, because that is how tiny local hacks become haunted infrastructure.

---

## Requirements

- Node.js 20+
- npm

---

## Install

```bash
npm install
```

---

## Run

Development:

```bash
npm run dev
```

Production build:

```bash
npm run build
npm start
```

Verification:

```bash
npm run typecheck
npm run build
npm run test
```

---

## Config Sources

The proxy supports two config sources:

```env
CONFIG_SOURCE=src
```

or:

```env
CONFIG_SOURCE=env
```

Default behavior is `CONFIG_SOURCE=src`.

---

## Source Config Mode

When `CONFIG_SOURCE=src`, the proxy loads:

```txt
src/head.json
```

Example:

```json
{
  "head": {
    "host": "127.0.0.1",
    "port": 4000
  },
  "services": [
    {
      "label": "example-api",
      "path": "/api",
      "url": "http://127.0.0.1:4100",
      "match": "**",
      "rewrite": {
        "from": "^/api/(.*)$",
        "to": "/$1"
      }
    }
  ]
}
```

---

## Env Config Mode

When `CONFIG_SOURCE=env`, the proxy reads numbered service keys.

Example:

```env
CONFIG_SOURCE=env

HEAD_HOST=127.0.0.1
HEAD_PORT=4000

SERVICE_1_LABEL=example-api
SERVICE_1_PATH=/api
SERVICE_1_URL=http://127.0.0.1:4100
SERVICE_1_MATCH=**
SERVICE_1_REWRITE_FROM=^/api/(.*)$
SERVICE_1_REWRITE_TO=/$1

SERVICE_2_LABEL=example-site
SERVICE_2_PATH=/site
SERVICE_2_URL=http://127.0.0.1:4200
SERVICE_2_MATCH=**
```

The loader reads `SERVICE_1_*`, `SERVICE_2_*`, and continues until the next numbered service has no label, path, or url.

---

## Service Fields

| Field          | Required | Description                                       |
| -------------- | -------- | ------------------------------------------------- |
| `label`        | yes      | Unique service name.                              |
| `path`         | yes      | Mounted public path. Must start with `/`.         |
| `url`          | yes      | Upstream service URL. Must use `http` or `https`. |
| `match`        | no       | Match rule. Defaults to `**`.                     |
| `rewrite.from` | no       | Regex source pattern.                             |
| `rewrite.to`   | no       | Regex replacement target.                         |

---

## Matching Rules

A request matches a service when:

1. The request path is under the service `path`.
2. The service `match` matches the request path or relative path.
3. If multiple services match, the first service in config wins.

Supported match styles:

```txt
/api/health          exact
/api/*               one path segment
/api/**              deep wildcard
^/api/v[0-9]+/(.*)$  regex
**                   catch-all
```

---

## Rewrite Rules

If no rewrite is provided, the original request path is preserved.

If rewrite is provided, `rewrite.from` is compiled as a regex and replaced with `rewrite.to`.

Example:

```json
{
  "rewrite": {
    "from": "^/api/(.*)$",
    "to": "/$1"
  }
}
```

Request:

```txt
/api/users?active=true
```

Upstream path:

```txt
/users?active=true
```

Regex captures such as `$1` and `$2` are supported.

---

## Local Routes

The proxy reserves this local route:

```txt
GET /health
```

It returns:

```json
{
  "ok": true,
  "service": "rev-proxy"
}
```

System routes are registered before proxy routes, so `/health` is not sent to a catch-all upstream.

---

## Error Responses

Unmatched route:

```json
{
  "error": {
    "code": "route_not_found",
    "message": "No proxy route matched the request."
  }
}
```

Upstream unavailable:

```json
{
  "error": {
    "code": "upstream_unavailable",
    "message": "Upstream service unavailable"
  }
}
```

---

## Runtime Behavior

The proxy enables:

- `changeOrigin`
- websocket proxying
- forwarded headers
- request timeout
- proxy timeout
- `x-request-id` forwarding

---

## Architecture

```txt
src/head.json      source config mode file
src/config/        loads, normalizes, and validates config
src/core/          pure matching, rewriting, config types, and errors
src/routes/        Express and proxy integration
src/middlewares/   request id and logging middleware
src/controllers/   local system controllers
```

`core/` must stay pure. It must not import Express, dotenv, process.env, or `http-proxy-middleware`.

---

## Tests

```bash
npm run typecheck
npm run build
npm run test
```

Current tests cover:

- source config loading
- env config loading
- config normalization
- config validation
- exact/wildcard/regex/catch-all matching
- first-match priority
- regex path rewriting
- query preservation
- request id forwarding
- unmatched route error
- dead upstream error
- health route isolation

## Abdullah portfolio mapping

The checked-in `src/head.json` routes `/api/*` to `http://127.0.0.1:4100` with the `/api` prefix stripped, then routes all remaining requests to the frontend at `http://127.0.0.1:3000`. The proxy listens on `127.0.0.1:4000`.
