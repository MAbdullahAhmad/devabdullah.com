import type { ProxyConfig, ServiceConfig } from "../core/proxy_config.js";

function read_number(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }
  const parsed_value = Number(value);
  return Number.isFinite(parsed_value) ? parsed_value : fallback;
}

function read_service(
  index: number,
  env: NodeJS.ProcessEnv,
): ServiceConfig | null {
  const prefix = `SERVICE_${index}_`;
  const label = env[`${prefix}LABEL`];
  const path = env[`${prefix}PATH`];
  const url = env[`${prefix}URL`];

  if (!label && !path && !url) {
    return null;
  }

  const rewrite_from = env[`${prefix}REWRITE_FROM`];
  const rewrite_to = env[`${prefix}REWRITE_TO`];
  const rewrite =
    rewrite_from || rewrite_to
      ? { from: rewrite_from || "", to: rewrite_to || "" }
      : undefined;

  return {
    label: label || "",
    path: path || "",
    url: url || "",
    match: env[`${prefix}MATCH`] || "**",
    rewrite,
  };
}

export function load_env_config(
  env: NodeJS.ProcessEnv = process.env,
): ProxyConfig {
  const services: ServiceConfig[] = [];

  for (let index = 1; ; index += 1) {
    const service = read_service(index, env);
    if (!service) {
      break;
    }
    services.push(service);
  }

  return {
    head: {
      host: env.HEAD_HOST || "127.0.0.1",
      port: read_number(env.HEAD_PORT, 4000),
    },
    services,
  };
}
