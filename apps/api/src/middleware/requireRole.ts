import type { Request, Response, NextFunction } from "express";
import type { Role } from "@campusoj/shared";
import { AppError } from "../lib/AppError.js";

/**
 * Usage: router.get('/admin', authenticate, requireRole(['ADMIN', 'SUPER_ADMIN']), handler)
 */
export function requireRole(allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError("Authentication required", 401));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access denied. Required role: ${allowedRoles.join(" | ")}`,
          403
        )
      );
    }
    next();
  };
}
