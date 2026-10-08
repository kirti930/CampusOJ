import jwt from "jsonwebtoken";
import type { JwtPayload } from "@campusoj/shared";
import { AppError } from "./AppError.js";

const JWT_SECRET = () => {
  const s = process.env.JWT_SECRET;
  if (!s) throw new AppError("JWT_SECRET is not configured", 500);
  return s;
};

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "7d";

export function signToken(payload: Omit<JwtPayload, "iat" | "exp">): string {
  return jwt.sign(payload, JWT_SECRET(), {
    expiresIn: JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
}

export function verifyToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, JWT_SECRET()) as JwtPayload;
  } catch {
    throw new AppError("Invalid or expired token", 401);
  }
}

/** Returns the token's expiry as a JS Date for setting cookie maxAge. */
export function tokenExpiresAt(): Date {
  const ms = parseDuration(JWT_EXPIRES_IN);
  return new Date(Date.now() + ms);
}

function parseDuration(d: string): number {
  const unit = d.slice(-1);
  const val = parseInt(d.slice(0, -1), 10);
  const map: Record<string, number> = {
    s: 1_000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
  };
  return (map[unit] ?? 86_400_000) * val;
}
