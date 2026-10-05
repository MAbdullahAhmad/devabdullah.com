import type {
  NormalizedProxyConfig,
  NormalizedServiceConfig,
} from "./proxy_config.js";

export type RouteMatch = {
  service: NormalizedServiceConfig;
  request_path: string;
  relative_path: string;
};

function strip_query(path: string): string {
  return path.split("?")[0] || "/";
}

function normalize_request_path(path: string): string {
  const clean_path = strip_query(path);
  return clean_path.startsWith("/") ? clean_path : `/${clean_path}`;
}

function is_under_mount(request_path: string, service_path: string): boolean {
  if (service_path === "/") {
    return true;
  }
  return (
    request_path === service_path || request_path.startsWith(`${service_path}/`)
  );
}

function get_relative_path(request_path: string, service_path: string): string {
  if (service_path === "/") {
    return request_path;
  }
  if (request_path === service_path) {
    return "/";
  }
  return request_path.slice(service_path.length) || "/";
}

function escape_regex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

function wildcard_to_regex(pattern: string): RegExp {
  const parts = pattern.split("/");
  const regex_parts = parts.map((part) => {
    if (part === "**") {
      return ".*";
    }
    if (part === "*") {
      return "[^/]*";
    }
    return escape_regex(part);
  });

  return new RegExp(`^${regex_parts.join("/")}$`, "u");
}

function looks_like_regex(pattern: string): boolean {
  return pattern.startsWith("^") || pattern.endsWith("$");
}

function match_pattern(
  pattern: string,
  request_path: string,
  relative_path: string,
): boolean {
  if (pattern === "**") {
    return true;
  }

  if (looks_like_regex(pattern)) {
    return (
      new RegExp(pattern, "u").test(request_path) ||
      new RegExp(pattern, "u").test(relative_path)
    );
  }

  if (pattern.includes("*")) {
    const regex = wildcard_to_regex(pattern);
    return regex.test(request_path) || regex.test(relative_path);
  }

  return request_path === pattern || relative_path === pattern;
}

export function find_route_match(
  config: NormalizedProxyConfig,
  raw_path: string,
): RouteMatch | null {
  const request_path = normalize_request_path(raw_path);

  for (const service of config.services) {
    if (!is_under_mount(request_path, service.path)) {
      continue;
    }

    const relative_path = get_relative_path(request_path, service.path);
    if (match_pattern(service.match, request_path, relative_path)) {
      return { service, request_path, relative_path };
    }
  }

  return null;
}
