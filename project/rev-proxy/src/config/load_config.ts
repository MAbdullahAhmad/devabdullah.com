import dotenv from "dotenv";

import type {
  ConfigSource,
  NormalizedProxyConfig,
} from "../core/proxy_config.js";
import { load_env_config } from "./load_env_config.js";
import { load_src_config } from "./load_src_config.js";
import { normalize_config } from "./normalize_config.js";
import { validate_config } from "./validate_config.js";

dotenv.config();

export async function load_config(): Promise<NormalizedProxyConfig> {
  const config_source = (process.env.CONFIG_SOURCE || "src") as ConfigSource;
  const raw_config =
    config_source === "env" ? load_env_config() : await load_src_config();
  const normalized_config = normalize_config(raw_config);
  validate_config(normalized_config);
  return normalized_config;
}
