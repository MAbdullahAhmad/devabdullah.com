import type { Express } from "express";

import type { SystemController } from "../controllers/SystemController.js";

export function register_system_routes(
  app: Express,
  system_controller: SystemController,
): void {
  app.get("/health", system_controller.health.bind(system_controller));
}
