# AGENTS.md

## Purpose

This package is a generic reverse proxy. Keep it reusable across projects.

Do not hardcode project-specific services, domains, ports, route names, or deployment assumptions in source code. Put service routing in `src/head.json` or `.env` instead. Apparently config files exist for a reason, shocking though that may be.

---

## Commands

Run these before considering work complete:

```bash
npm run typecheck
npm run build
npm run test
```

---

## Architecture Boundaries

### `src/core/`

Pure logic only.

Allowed:

- config types
- route matching
- path rewriting
- pure errors

Forbidden:

- Express imports
- `dotenv` imports
- `process.env` reads
- `http-proxy-middleware` imports
- filesystem reads
- network calls

### `src/config/`

Owns config loading, normalization, and validation.

Allowed:

- reading `process.env`
- loading `src/head.json`
- validating URLs, ports, labels, paths, match rules, and rewrite rules

### `src/routes/`

Owns Express route registration and proxy wiring.

Allowed:

- Express types
- `http-proxy-middleware`
- mapping normalized config into runtime proxy behavior

### `src/middlewares/`

Owns request middleware only.

### `src/controllers/`

Owns local system endpoints only, such as `/health`.

---

## Naming Rules

Use project conventions:

- functions and variables use `snake_case`
- classes use `CapitalCase`
- files are named by responsibility
- middleware files end in `Middleware`
- controller files end in `Controller`
- avoid vague names like `utils`, `helpers`, `manager`, or `common`

---

## Config Rules

The internal config shape must stay shared by both config sources.

Both of these must normalize to the same runtime shape:

- `src/head.json`
- `.env` with numbered `SERVICE_N_*` keys

Required service rules:

- `label` must exist and be unique
- `path` must start with `/`
- `url` must use `http` or `https`
- `match` defaults to `**`
- rewrite requires both `from` and `to`
- regex patterns must validate before runtime

---

## Matching and Rewriting Rules

Supported match styles:

- exact: `/api/health`
- one-level wildcard: `/api/*`
- deep wildcard: `/api/**`
- regex: `^/api/v[0-9]+/(.*)$`
- catch-all: `**`

If multiple services match, declaration order wins.

Rewrite uses regex replacement and supports captures like `$1` and `$2`.

---

## Testing Requirements

Tests must cover any change to:

- config loading
- env parsing
- normalization
- validation
- matching
- rewriting
- proxy forwarding
- error envelopes
- health route behavior

Do not remove integration tests unless replacing them with stronger coverage.

---

## Error Response Rules

Use stable JSON envelopes.

Unmatched route:

```json
{
  "error": {
    "code": "route_not_found",
    "message": "No proxy route matched the request."
  }
}
```

Upstream failure:

```json
{
  "error": {
    "code": "upstream_unavailable",
    "message": "Upstream service unavailable"
  }
}
```

Do not leak stack traces, env values, or internal errors to clients.
