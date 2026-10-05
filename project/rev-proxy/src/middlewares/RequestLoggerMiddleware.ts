import type { NextFunction, Request, Response } from "express";

export function request_logger_middleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const started_at = Date.now();

  res.on("finish", () => {
    const request_id = req.headers["x-request-id"];
    const duration_ms = Date.now() - started_at;
    console.info(
      `${req.method} ${req.originalUrl} ${res.statusCode} ${duration_ms}ms request_id=${request_id ?? "unknown"}`,
    );
  });

  next();
}
