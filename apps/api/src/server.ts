import "express-async-errors";
import http from "http";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

import authRouter from "./routes/auth.router.js";
import contestRouter from "./modules/contests/contest.router.js";
import problemRouter from "./modules/problems/problem.router.js";
import submissionRouter from "./modules/submissions/submission.router.js";
import { AppError } from "./lib/AppError.js";
import { initSocketServer, emitSubmissionStatus } from "./sockets/socketServer.js";
import IORedis from "ioredis";

dotenv.config();

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT ?? 5000;
const CLIENT_URL = process.env.CLIENT_URL ?? "http://localhost:5173";

// Initialize Socket.IO server
initSocketServer(httpServer, CLIENT_URL);

// Subscribe to worker events via Redis for realtime Socket.IO broadcast
if (process.env.REDIS_URL) {
  const redisSub = new IORedis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
  });

  redisSub.subscribe("campusoj:events", (err) => {
    if (err) console.error("[RedisSub] Error subscribing to campusoj:events:", err.message);
    else console.log("[RedisSub] Subscribed to campusoj:events for realtime Socket.IO dispatch");
  });

  redisSub.on("message", async (channel, message) => {
    if (channel === "campusoj:events") {
      try {
        const event = JSON.parse(message);
        if (event.type === "submission:status") {
          emitSubmissionStatus(event.userId, event.contestId, event.payload);
          if (event.contestId && event.payload?.status === "ACCEPTED") {
            try {
              const { recalculateAndPersistLeaderboard } = await import(
                "./modules/leaderboard/leaderboard.service.js"
              );
              await recalculateAndPersistLeaderboard(event.contestId);
            } catch (lbErr) {
              console.error("[RedisSub:Leaderboard] Recalculate error:", lbErr);
            }
          }
        }
      } catch (parseErr) {
        console.error("[RedisSub] Parse error:", parseErr);
      }
    }
  });
}

// ─── Security & Middleware ────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true, // required for cookies
  })
);
app.use(compression());
app.use(cookieParser()); // must be before routes that read cookies
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// ─── Global Rate Limit (wide envelope) ───────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.GLOBAL_RATE_LIMIT ? parseInt(process.env.GLOBAL_RATE_LIMIT, 10) : 10000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many requests, please try again later." },
});
app.use("/api", globalLimiter);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({
    success: true,
    status: "ok",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? "1.0.0",
  });
});

// ─── API v1 Routes ────────────────────────────────────────────────────────────
app.get("/api/v1", (_req, res) => {
  res.json({ success: true, message: "CampusOJ API v1" });
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/contests", contestRouter);
app.use("/api/v1/problems", problemRouter);
app.use("/api/v1/submissions", submissionRouter);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("[ERROR]", err.message, err.stack);

    const isOperational =
      (err instanceof AppError && err.isOperational) ||
      (err as any).isOperational === true;
    const statusCode =
      (err as any).statusCode ??
      (err as { status?: number }).status ??
      (isOperational ? 400 : 500);

    if (isOperational) {
      res.status(statusCode).json({
        success: false,
        error: err.message,
      });
      return;
    }

    // Special handling for Prisma DB connection errors
    if (err.name === "PrismaClientInitializationError") {
      res.status(503).json({
        success: false,
        error: "Database is temporarily unavailable or warming up. Please try again in a few seconds.",
      });
      return;
    }

    // Unhandled / programmer errors — hide details in production
    res.status(statusCode).json({
      success: false,
      error:
        process.env.NODE_ENV === "production"
          ? "Internal server error"
          : err.message,
    });
  }
);

// ─── Start ────────────────────────────────────────────────────────────────────
httpServer.listen(PORT, () => {
  console.log(`🚀 CampusOJ API listening on http://localhost:${PORT}`);
  console.log(`   NODE_ENV : ${process.env.NODE_ENV ?? "development"}`);
  console.log(`   CLIENT   : ${CLIENT_URL}`);
});

export default app;
