import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

let dbUrl = process.env.DATABASE_URL || "";
if (dbUrl && !dbUrl.includes("pool_timeout")) {
  dbUrl += (dbUrl.includes("?") ? "&" : "?") + "connect_timeout=30&pool_timeout=30";
}

// Reuse the client in development to avoid exhausting DB connections on HMR
const prisma: PrismaClient =
  globalThis.__prisma ??
  new PrismaClient({
    datasources: dbUrl ? { db: { url: dbUrl } } : undefined,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "warn", "error"]
        : ["warn", "error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma;
}

export { prisma };
export { PrismaClient } from "@prisma/client";
export * from "@prisma/client";
