import { strict as assert } from "node:assert";
import { test } from "node:test";

import type { NormalizedProxyConfig } from "../src/core/proxy_config.js";
import { find_route_match } from "../src/core/route_matcher.js";

const config: NormalizedProxyConfig = {
  head: { host: "127.0.0.1", port: 4000 },
  services: [
    {
      label: "exact",
      path: "/api",
      url: "http://127.0.0.1:4100",
      match: "/api/health",
    },
    {
      label: "one-level",
      path: "/files",
      url: "http://127.0.0.1:4101",
      match: "/files/*",
    },
    {
      label: "deep",
      path: "/assets",
      url: "http://127.0.0.1:4102",
      match: "/assets/**",
    },
    {
      label: "regex",
      path: "/",
      url: "http://127.0.0.1:4103",
      match: "^/v[0-9]+/(.*)$",
    },
    {
      label: "catch-all",
      path: "/",
      url: "http://127.0.0.1:4104",
      match: "**",
    },
  ],
};

test("exact match works", () => {
  assert.equal(find_route_match(config, "/api/health")?.service.label, "exact");
});

test("one-level wildcard works", () => {
  assert.equal(
    find_route_match(config, "/files/a")?.service.label,
    "one-level",
  );
  assert.notEqual(
    find_route_match(config, "/files/a/b")?.service.label,
    "one-level",
  );
});

test("deep wildcard works", () => {
  assert.equal(
    find_route_match(config, "/assets/a/b/c")?.service.label,
    "deep",
  );
});

test("regex match works", () => {
  assert.equal(find_route_match(config, "/v1/users")?.service.label, "regex");
});

test("catch-all works", () => {
  assert.equal(
    find_route_match(config, "/anything")?.service.label,
    "catch-all",
  );
});

test("earlier service wins on overlap", () => {
  assert.equal(find_route_match(config, "/api/health")?.service.label, "exact");
});

test("returns null when no route matches", () => {
  const no_match_config: NormalizedProxyConfig = {
    head: { host: "127.0.0.1", port: 4000 },
    services: [
      {
        label: "api",
        path: "/api",
        url: "http://127.0.0.1:4100",
        match: "/api/health",
      },
    ],
  };

  assert.equal(find_route_match(no_match_config, "/missing"), null);
});

test("project config sends api before frontend catch-all", () => {
  const project_config: NormalizedProxyConfig = {
    head: { host: "127.0.0.1", port: 4000 },
    services: [
      {
        label: "backend-api",
        path: "/api",
        url: "http://127.0.0.1:4100",
        match: "**",
        rewrite: { from: "^/api(?:/(.*))?$", to: "/$1" },
      },
      {
        label: "frontend",
        path: "/",
        url: "http://127.0.0.1:3000",
        match: "**",
      },
    ],
  };

  assert.equal(
    find_route_match(project_config, "/api/users")?.service.label,
    "backend-api",
  );
  assert.equal(
    find_route_match(project_config, "/about")?.service.label,
    "frontend",
  );
});
