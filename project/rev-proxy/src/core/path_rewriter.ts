import type { NormalizedServiceConfig } from "./proxy_config.js";

function split_path_and_query(raw_path: string): {
  path: string;
  query: string;
} {
  const query_index = raw_path.indexOf("?");
  if (query_index === -1) {
    return { path: raw_path, query: "" };
  }

  return {
    path: raw_path.slice(0, query_index) || "/",
    query: raw_path.slice(query_index),
  };
}

export function rewrite_path(
  service: NormalizedServiceConfig,
  raw_path: string,
): string {
  const { path, query } = split_path_and_query(raw_path);

  if (!service.rewrite) {
    return `${path}${query}`;
  }

  const rewritten_path = path.replace(
    new RegExp(service.rewrite.from, "u"),
    service.rewrite.to,
  );
  return `${rewritten_path}${query}`;
}
