import { strict as assert } from "node:assert";
import { test } from "node:test";

import type { NormalizedServiceConfig } from "../src/core/proxy_config.js";
import { rewrite_path } from "../src/core/path_rewriter.js";

const service: NormalizedServiceConfig = {
  label: "api",
  path: "/api",
  url: "http://127.0.0.1:4100",
  match: "**",
  rewrite: {
    from: "^/api/v([0-9]+)/(.*)$",
    to: "/v$1/$2",
  },
};

test("regex rewrite supports capture groups", () => {
  assert.equal(rewrite_path(service, "/api/v1/users"), "/v1/users");
});

test("regex rewrite preserves query string", () => {
  assert.equal(
    rewrite_path(service, "/api/v2/users?active=true"),
    "/v2/users?active=true",
  );
});

test("no rewrite preserves original path", () => {
  assert.equal(
    rewrite_path({ ...service, rewrite: undefined }, "/api/v1/users?x=1"),
    "/api/v1/users?x=1",
  );
});

test("project api rewrite strips the api prefix", () => {
  const project_service: NormalizedServiceConfig = {
    label: "backend-api",
    path: "/api",
    url: "http://127.0.0.1:4100",
    match: "**",
    rewrite: { from: "^/api(?:/(.*))?$", to: "/$1" },
  };

  assert.equal(
    rewrite_path(project_service, "/api/users?active=true"),
    "/users?active=true",
  );
  assert.equal(rewrite_path(project_service, "/api"), "/");
});
