import cors from "cors";
import express from "express";

import { SystemController } from "./controllers/SystemController.js";
import type { NormalizedProxyConfig } from "./core/proxy_config.js";
import { request_id_middleware } from "./middlewares/RequestIdMiddleware.js";
import { request_logger_middleware } from "./middlewares/RequestLoggerMiddleware.js";
import { register_proxy_routes } from "./routes/register_proxy_routes.js";
import { register_system_routes } from "./routes/register_system_routes.js";

export function create_app(config: NormalizedProxyConfig): express.Express {
  const app = express();

  app.use(cors({ origin: true, credentials: true }));
  app.use(request_id_middleware);
  app.use(request_logger_middleware);

  register_system_routes(app, new SystemController());
  register_proxy_routes(app, config);

  return app;
}
