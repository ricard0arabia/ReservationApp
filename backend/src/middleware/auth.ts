import type { Request, Response, NextFunction } from "express";
import type { UserRole } from "../models/types.js";

export interface AuthedRequest extends Request {
  user?: { id: string; role: UserRole };
}

export const requireAuth = (req: AuthedRequest, res: Response, next: NextFunction) => {
  const userId = req.header("x-user-id");
  const role = (req.header("x-user-role") as UserRole | undefined) ?? "client";
  if (!userId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  req.user = { id: userId, role };
  next();
};

export const requireAdmin = (req: AuthedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  if (req.user.role !== "admin" && req.user.role !== "superadmin") {
    res.status(403).json({ error: "Admin privileges required" });
    return;
  }
  next();
};
