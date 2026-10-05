export type ConfigSource = "src" | "env";

export type HeadConfig = {
  host: string;
  port: number;
};

export type RewriteConfig = {
  from: string;
  to: string;
};

export type ServiceConfig = {
  label: string;
  path: string;
  url: string;
  match?: string;
  rewrite?: RewriteConfig;
};

export type ProxyConfig = {
  head: HeadConfig;
  services: ServiceConfig[];
};

export type NormalizedServiceConfig = {
  label: string;
  path: string;
  url: string;
  match: string;
  rewrite?: RewriteConfig;
};

export type NormalizedProxyConfig = {
  head: HeadConfig;
  services: NormalizedServiceConfig[];
};
