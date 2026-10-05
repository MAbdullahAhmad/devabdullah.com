import { ProxyConfigError } from "../core/proxy_error.js";
import type {
  NormalizedProxyConfig,
  NormalizedServiceConfig,
} from "../core/proxy_config.js";

function assert_regex(pattern: string, field_name: string): void {
  try {
    new RegExp(pattern);
  } catch {
    throw new ProxyConfigError(
      `${field_name} must be a valid regular expression`,
    );
  }
}

function is_regex_match(match: string): boolean {
  return match.startsWith("^") || match.endsWith("$");
}

function validate_url(url: string, label: string): void {
  try {
    const parsed_url = new URL(url);
    if (!["http:", "https:"].includes(parsed_url.protocol)) {
      throw new ProxyConfigError(`service ${label} url must use http or https`);
    }
  } catch (error) {
    if (error instanceof ProxyConfigError) {
      throw error;
    }
    throw new ProxyConfigError(`service ${label} url must be a valid URL`);
  }
}

function validate_service(service: NormalizedServiceConfig): void {
  if (!service.label) {
    throw new ProxyConfigError("service label is required");
  }
  if (!service.path) {
    throw new ProxyConfigError(`service ${service.label} path is required`);
  }
  if (!service.path.startsWith("/")) {
    throw new ProxyConfigError(
      `service ${service.label} path must start with /`,
    );
  }
  if (!service.url) {
    throw new ProxyConfigError(`service ${service.label} url is required`);
  }

  validate_url(service.url, service.label);

  if (is_regex_match(service.match)) {
    assert_regex(service.match, `service ${service.label} match`);
  }

  if (service.rewrite) {
    if (!service.rewrite.from || !service.rewrite.to) {
      throw new ProxyConfigError(
        `service ${service.label} rewrite requires both from and to`,
      );
    }
    assert_regex(service.rewrite.from, `service ${service.label} rewrite.from`);
  }
}

export function validate_config(config: NormalizedProxyConfig): void {
  if (!config.head.host) {
    throw new ProxyConfigError("head.host is required");
  }
  if (
    !Number.isInteger(config.head.port) ||
    config.head.port < 1 ||
    config.head.port > 65_535
  ) {
    throw new ProxyConfigError("head.port must be a valid TCP port");
  }

  const labels = new Set<string>();

  for (const service of config.services) {
    validate_service(service);
    if (labels.has(service.label)) {
      throw new ProxyConfigError(`duplicate service label: ${service.label}`);
    }
    labels.add(service.label);
  }
}
