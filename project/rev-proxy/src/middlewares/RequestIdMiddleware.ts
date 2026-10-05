import { randomUUID } from "node:crypto";

import type { NextFunction, Request, Response } from "express";

export function request_id_middleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const existing_request_id = req.headers["x-request-id"];
  const request_id =
    typeof existing_request_id === "string" && existing_request_id.length > 0
      ? existing_request_id
      : randomUUID();

  req.headers["x-request-id"] = request_id;
  res.setHeader("x-request-id", request_id);
  next();
}
