import { strict as assert } from "node:assert";
import { once } from "node:events";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { test } from "node:test";

import { create_app } from "../src/create_app.js";
import type { NormalizedProxyConfig } from "../src/core/proxy_config.js";

const empty_config: NormalizedProxyConfig = {
  head: { host: "127.0.0.1", port: 4000 },
  services: [],
};

test("health endpoint returns ok response", async () => {
  const server = createServer(create_app(empty_config));
  server.listen(0, "127.0.0.1");
  await once(server, "listening");

  const address = server.address() as AddressInfo;

  try {
    const response = await fetch(`http://127.0.0.1:${address.port}/health`);
    const body = (await response.json()) as { ok: boolean; service: string };

    assert.equal(response.status, 200);
    assert.equal(body.ok, true);
    assert.equal(body.service, "rev-proxy");
    assert.ok(response.headers.get("x-request-id"));
  } finally {
    server.close();
    await once(server, "close");
  }
});
