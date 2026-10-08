import { Server as SocketIOServer, Socket } from "socket.io";
import type { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "@campusoj/shared";

let io: SocketIOServer | null = null;

export function initSocketServer(httpServer: HttpServer, clientUrl: string): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: clientUrl,
      credentials: true,
    },
    pingTimeout: 30000,
    pingInterval: 10000,
  });

  io.use((socket: Socket, next) => {
    // Optional auth from handshake
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace("Bearer ", "");

    if (token && process.env.JWT_SECRET) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
        socket.data.user = decoded;
      } catch {
        // Allow unauthenticated connection for public contest leaderboards
      }
    }
    next();
  });

  io.on("connection", (socket: Socket) => {
    const userId = socket.data.user?.sub;
    if (userId) {
      socket.join(`user:${userId}`);
      console.log(`[Socket] Authenticated user ${userId} connected (${socket.id})`);
    }

    // Join / leave contest rooms
    socket.on("join:contest", (contestId: string) => {
      if (contestId && typeof contestId === "string") {
        socket.join(`contest:${contestId}`);
        console.log(`[Socket] ${socket.id} joined contest:${contestId}`);
      }
    });

    socket.on("leave:contest", (contestId: string) => {
      if (contestId && typeof contestId === "string") {
        socket.leave(`contest:${contestId}`);
        console.log(`[Socket] ${socket.id} left contest:${contestId}`);
      }
    });

    socket.on("join:user", (uid: string) => {
      if (uid && typeof uid === "string") {
        socket.join(`user:${uid}`);
      }
    });

    socket.on("disconnect", (reason) => {
      console.log(`[Socket] Disconnected: ${socket.id} (${reason})`);
    });
  });

  console.log("⚡ Socket.IO initialized");
  return io;
}

export function getSocketServer(): SocketIOServer | null {
  return io;
}

export function emitSubmissionStatus(
  userId: string,
  contestId: string | null,
  data: {
    submissionId: string;
    problemId: string;
    contestId: string | null;
    status: string;
    verdict?: string;
    executionTime?: number | null;
    memoryUsage?: number | null;
  }
) {
  if (!io) return;
  // Notify the user directly
  io.to(`user:${userId}`).emit("submission:status", data);

  // If part of contest, also broadcast to contest room (for live monitor & leaderboard sync)
  if (contestId) {
    io.to(`contest:${contestId}`).emit("contest:submission", data);
  }
}

export function emitLeaderboardUpdate(contestId: string, leaderboardData: unknown) {
  if (!io) return;
  io.to(`contest:${contestId}`).emit("leaderboard:update", leaderboardData);
}
