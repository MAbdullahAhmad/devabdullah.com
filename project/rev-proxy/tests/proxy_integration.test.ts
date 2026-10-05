import { strict as assert } from "node:assert";
import { once } from "node:events";
import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";
import type { AddressInfo } from "node:net";
import { test } from "node:test";

import { create_app } from "../src/create_app.js";
import type { NormalizedProxyConfig } from "../src/core/proxy_config.js";

type CapturedRequest = {
  url: string;
  request_id?: string;
};

async function start_server(
  handler: (req: IncomingMessage, res: ServerResponse) => void,
) {
  const server = createServer(handler);
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address() as AddressInfo;
  return {
    server,
    url: `http://127.0.0.1:${address.port}`,
    port: address.port,
  };
}

async function close_server(
  server: ReturnType<typeof createServer>,
): Promise<void> {
  server.close();
  await once(server, "close");
}

test("request reaches mock upstream with rewritten path and query string", async () => {
  let captured_request: CapturedRequest | null = null;
  const upstream = await start_server((req, res) => {
    captured_request = {
      url: req.url || "",
      request_id: Array.isArray(req.headers["x-request-id"])
        ? req.headers["x-request-id"][0]
        : req.headers["x-request-id"],
    };
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true }));
  });

  const config: NormalizedProxyConfig = {
    head: { host: "127.0.0.1", port: 4000 },
    services: [
      {
        label: "api",
        path: "/api",
        url: upstream.url,
        match: "**",
        rewrite: { from: "^/api/(.*)$", to: "/$1" },
      },
    ],
  };

  const proxy = await start_server(create_app(config));

  try {
    const response = await fetch(`${proxy.url}/api/users?active=true`, {
      headers: { "x-request-id": "test-request-id" },
    });
    const body = (await response.json()) as { ok: boolean };

    assert.equal(response.status, 200);
    assert.equal(body.ok, true);
    assert.deepEqual(captured_request, {
      url: "/users?active=true",
      request_id: "test-request-id",
    });
  } finally {
    await close_server(proxy.server);
    await close_server(upstream.server);
  }
});

test("unmatched route returns 404 envelope", async () => {
  const config: NormalizedProxyConfig = {
    head: { host: "127.0.0.1", port: 4000 },
    services: [
      { label: "api", path: "/api", url: "http://127.0.0.1:4100", match: "**" },
    ],
  };
  const proxy = await start_server(create_app(config));

  try {
    const response = await fetch(`${proxy.url}/missing`);
    const body = (await response.json()) as { error: { code: string } };

    assert.equal(response.status, 404);
    assert.equal(body.error.code, "route_not_found");
  } finally {
    await close_server(proxy.server);
  }
});

test("dead upstream returns 502 envelope", async () => {
  const config: NormalizedProxyConfig = {
    head: { host: "127.0.0.1", port: 4000 },
    services: [
      { label: "api", path: "/api", url: "http://127.0.0.1:9", match: "**" },
    ],
  };
  const proxy = await start_server(create_app(config));

  try {
    const response = await fetch(`${proxy.url}/api/users`);
    const body = (await response.json()) as { error: { code: string } };

    assert.equal(response.status, 502);
    assert.equal(body.error.code, "upstream_unavailable");
  } finally {
    await close_server(proxy.server);
  }
});

test("health endpoint remains local and is not proxied", async () => {
  const config: NormalizedProxyConfig = {
    head: { host: "127.0.0.1", port: 4000 },
    services: [
      { label: "catch-all", path: "/", url: "http://127.0.0.1:9", match: "**" },
    ],
  };
  const proxy = await start_server(create_app(config));

  try {
    const response = await fetch(`${proxy.url}/health`);
    const body = (await response.json()) as { ok: boolean; service: string };

    assert.equal(response.status, 200);
    assert.equal(body.ok, true);
    assert.equal(body.service, "rev-proxy");
  } finally {
    await close_server(proxy.server);
  }
});
