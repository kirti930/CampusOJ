import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/jwt.js";
import { AppError } from "../lib/AppError.js";

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  // 1. HTTP-only cookie (preferred — not accessible to JS)
  const cookieToken: string | undefined = req.cookies?.token;

  // 2. Authorization: Bearer <token> fallback
  const authHeader = req.headers.authorization;
  const bearerToken =
    authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;

  const token = cookieToken ?? bearerToken;

  if (!token) {
    return next(new AppError("Authentication required", 401));
  }

  const payload = verifyToken(token); // throws AppError(401) on bad token
  req.user = { id: payload.sub, email: payload.email, role: payload.role };
  next();
}

/**
 * Attaches req.user if a valid token is present, but allows unauthenticated
 * requests to proceed (with req.user undefined).
 */
export function optionalAuthenticate(req: Request, _res: Response, next: NextFunction): void {
  const cookieToken: string | undefined = req.cookies?.token;
  const authHeader = req.headers.authorization;
  const bearerToken =
    authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;

  const token = cookieToken ?? bearerToken;
  if (token) {
    try {
      const payload = verifyToken(token);
      req.user = { id: payload.sub, email: payload.email, role: payload.role };
    } catch {
      // Ignore token verification errors for optional auth
    }
  }
  next();
}
