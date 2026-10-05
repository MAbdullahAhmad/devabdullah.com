import { strict as assert } from "node:assert";
import { test } from "node:test";

import { load_env_config } from "../src/config/load_env_config.js";
import { load_src_config } from "../src/config/load_src_config.js";
import { normalize_config } from "../src/config/normalize_config.js";
import { validate_config } from "../src/config/validate_config.js";
import { ProxyConfigError } from "../src/core/proxy_error.js";

test("loads default src head config", async () => {
  const config = normalize_config(await load_src_config());
  validate_config(config);

  assert.equal(config.head.host, "127.0.0.1");
  assert.equal(config.head.port, 4000);
  assert.equal(config.services[0].label, "backend-api");
  assert.equal(config.services[1].label, "frontend");
});

test("loads numbered env services", () => {
  const config = normalize_config(
    load_env_config({
      HEAD_HOST: "0.0.0.0",
      HEAD_PORT: "8080",
      SERVICE_1_LABEL: "api",
      SERVICE_1_PATH: "/api",
      SERVICE_1_URL: "http://127.0.0.1:4100",
      SERVICE_1_MATCH: "**",
      SERVICE_1_REWRITE_FROM: "^/api/(.*)$",
      SERVICE_1_REWRITE_TO: "/$1",
    }),
  );

  validate_config(config);

  assert.equal(config.head.host, "0.0.0.0");
  assert.equal(config.head.port, 8080);
  assert.equal(config.services.length, 1);
  assert.equal(config.services[0].rewrite?.to, "/$1");
});

test("rejects duplicate labels", () => {
  const config = normalize_config({
    head: { host: "127.0.0.1", port: 4000 },
    services: [
      { label: "api", path: "/api", url: "http://127.0.0.1:4100" },
      { label: "api", path: "/api2", url: "http://127.0.0.1:4101" },
    ],
  });

  assert.throws(() => validate_config(config), ProxyConfigError);
});

test("rejects invalid config with clear error", () => {
  const config = normalize_config({
    head: { host: "", port: 0 },
    services: [],
  });

  assert.throws(() => validate_config(config), /head\.host is required/u);
});

test("rejects invalid rewrite regex", () => {
  const config = normalize_config({
    head: { host: "127.0.0.1", port: 4000 },
    services: [
      {
        label: "api",
        path: "/api",
        url: "http://127.0.0.1:4100",
        rewrite: { from: "[", to: "/$1" },
      },
    ],
  });

  assert.throws(() => validate_config(config), /rewrite\.from/u);
});
