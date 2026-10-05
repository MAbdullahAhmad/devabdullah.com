import { readFile } from "node:fs/promises";
import { join } from "node:path";

import type { ProxyConfig } from "../core/proxy_config.js";

export async function load_src_config(): Promise<ProxyConfig> {
  const config_path = join(process.cwd(), "src", "head.json");
  const raw_config = await readFile(config_path, "utf8");
  return JSON.parse(raw_config) as ProxyConfig;
}
