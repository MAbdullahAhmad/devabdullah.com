import type {
  NormalizedProxyConfig,
  NormalizedServiceConfig,
  ProxyConfig,
  ServiceConfig,
} from "../core/proxy_config.js";

function normalize_service_path(path: string): string {
  const trimmed_path = path.trim();
  const with_leading_slash = trimmed_path.startsWith("/")
    ? trimmed_path
    : `/${trimmed_path}`;
  const without_trailing_slash =
    with_leading_slash.length > 1
      ? with_leading_slash.replace(/\/+$/u, "")
      : with_leading_slash;
  return without_trailing_slash || "/";
}

function normalize_service(service: ServiceConfig): NormalizedServiceConfig {
  return {
    label: service.label.trim(),
    path: normalize_service_path(service.path),
    url: service.url.trim().replace(/\/+$/u, ""),
    match: service.match?.trim() || "**",
    rewrite: service.rewrite,
  };
}

export function normalize_config(config: ProxyConfig): NormalizedProxyConfig {
  return {
    head: {
      host: config.head.host.trim(),
      port: config.head.port,
    },
    services: config.services.map(normalize_service),
  };
}
