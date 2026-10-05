import type { Request, Response } from "express";

export class SystemController {
  health(_req: Request, res: Response): void {
    res.status(200).json({ ok: true, service: "rev-proxy" });
  }
}
