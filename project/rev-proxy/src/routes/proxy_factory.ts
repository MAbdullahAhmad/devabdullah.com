import type { NextFunction, Request, Response } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

import type { NormalizedServiceConfig } from "../core/proxy_config.js";

function send_upstream_error(res: Response): void {
  if (res.headersSent) {
    return;
  }

  res.status(502).json({
    error: {
      code: "upstream_unavailable",
      message: "Upstream service unavailable",
    },
  });
}

export function build_proxy(service: NormalizedServiceConfig) {
  return createProxyMiddleware<Request, Response>({
    target: service.url,
    changeOrigin: true,
    ws: true,
    xfwd: true,
    proxyTimeout: 15_000,
    timeout: 15_000,
    on: {
      proxyReq: (proxy_req, req) => {
        const request_id = req.headers["x-request-id"];
        if (typeof request_id === "string") {
          proxy_req.setHeader("x-request-id", request_id);
        }
      },
      error: (_error, _req, res) => {
        send_upstream_error(res as Response);
      },
    },
  });
}

export type ProxyMiddleware = ReturnType<typeof build_proxy>;

export function run_proxy(
  proxy: ProxyMiddleware,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  proxy(req, res, next);
}
