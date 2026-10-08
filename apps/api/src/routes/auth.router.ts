import { Router, type Request, type Response, type CookieOptions } from "express";
import rateLimit from "express-rate-limit";
import { validateRequest } from "../middleware/validateRequest.js";
import { authenticate } from "../middleware/authenticate.js";
import { registerUser, loginUser, getCurrentUser } from "../services/auth.service.js";
import { RegisterSchema, LoginSchema } from "@campusoj/shared";
import { z } from "zod";

const router = Router();

// ─── Shared cookie options ────────────────────────────────────────────────────
const COOKIE_OPTS: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  path: "/",
};

/** Max age in ms derived from JWT_EXPIRES_IN env (default 7 days) */
const cookieMaxAge = (): number => {
  const raw = process.env.JWT_EXPIRES_IN ?? "7d";
  const unit = raw.slice(-1);
  const val = parseInt(raw.slice(0, -1), 10);
  const map: Record<string, number> = { s: 1e3, m: 6e4, h: 36e5, d: 864e5 };
  return (map[unit] ?? 864e5) * val;
};

// ─── Per-route rate limiters ──────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.AUTH_RATE_LIMIT ? parseInt(process.env.AUTH_RATE_LIMIT, 10) : 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many attempts. Try again in 15 minutes." },
  keyGenerator: (req) =>
    (req.body?.email as string) ??
    (req.headers["x-forwarded-for"] as string) ??
    req.ip ??
    "unknown",
});

// Extended register schema — includes optional role field not in shared
const RegisterWithRoleSchema = RegisterSchema.extend({
  role: z
    .enum(["STUDENT", "FACULTY"])
    .optional()
    .default("STUDENT"),
});

// ─── POST /register ───────────────────────────────────────────────────────────
router.post(
  "/register",
  authLimiter,
  validateRequest(RegisterWithRoleSchema),
  async (req: Request, res: Response) => {
    const result = await registerUser(req.body as z.infer<typeof RegisterWithRoleSchema>);

    res.cookie("token", result.token, {
      ...COOKIE_OPTS,
      maxAge: cookieMaxAge(),
    });

    res.status(201).json({
      success: true,
      data: result.user,
      token: result.token,
      message: "Account created successfully",
    });
  }
);

// ─── POST /login ──────────────────────────────────────────────────────────────
router.post(
  "/login",
  authLimiter,
  validateRequest(LoginSchema),
  async (req: Request, res: Response) => {
    const result = await loginUser(req.body);

    res.cookie("token", result.token, {
      ...COOKIE_OPTS,
      maxAge: cookieMaxAge(),
    });

    res.status(200).json({
      success: true,
      data: result.user,
      token: result.token,
      message: "Logged in successfully",
    });
  }
);

// ─── POST /logout ─────────────────────────────────────────────────────────────
router.post("/logout", (_req: Request, res: Response) => {
  res.clearCookie("token", { ...COOKIE_OPTS, maxAge: 0 });
  res.status(200).json({ success: true, message: "Logged out successfully" });
});

// ─── GET /me ──────────────────────────────────────────────────────────────────
router.get("/me", authenticate, async (req: Request, res: Response) => {
  const user = await getCurrentUser(req.user!.id);
  res.status(200).json({ success: true, data: user });
});

export default router;
