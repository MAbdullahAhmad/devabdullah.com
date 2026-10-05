import { strict as assert } from "node:assert";
import { test } from "node:test";

import { normalize_config } from "../src/config/normalize_config.js";

test("normalizes service paths and defaults match", () => {
  const config = normalize_config({
    head: { host: " 127.0.0.1 ", port: 4000 },
    services: [
      {
        label: " api ",
        path: "api/",
        url: "http://127.0.0.1:4100/",
        match: undefined,
      },
    ],
  });

  assert.equal(config.head.host, "127.0.0.1");
  assert.equal(config.services[0].label, "api");
  assert.equal(config.services[0].path, "/api");
  assert.equal(config.services[0].url, "http://127.0.0.1:4100");
  assert.equal(config.services[0].match, "**");
});
