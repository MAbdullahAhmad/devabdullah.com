import type { Express, NextFunction, Request, Response } from "express";

import { rewrite_path } from "../core/path_rewriter.js";
import type { NormalizedProxyConfig } from "../core/proxy_config.js";
import { find_route_match } from "../core/route_matcher.js";
import { build_proxy, run_proxy } from "./proxy_factory.js";

export function register_proxy_routes(
  app: Express,
  config: NormalizedProxyConfig,
): void {
  const proxies = new Map(
    config.services.map((service) => [service.label, build_proxy(service)]),
  );

  app.use((req: Request, res: Response, next: NextFunction) => {
    const route_match = find_route_match(config, req.originalUrl);

    if (!route_match) {
      res.status(404).json({
        error: {
          code: "route_not_found",
          message: "No proxy route matched the request.",
        },
      });
      return;
    }

    const proxy = proxies.get(route_match.service.label);
    if (!proxy) {
      res.status(500).json({
        error: {
          code: "proxy_not_registered",
          message: "Matched route has no registered proxy.",
        },
      });
      return;
    }

    req.url = rewrite_path(route_match.service, req.originalUrl);
    run_proxy(proxy, req, res, next);
  });
}
