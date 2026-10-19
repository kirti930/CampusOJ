import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

let dbUrl = process.env.DATABASE_URL_POOLED || process.env.DATABASE_URL || "";
if (dbUrl && !dbUrl.includes("pool_timeout")) {
  dbUrl += (dbUrl.includes("?") ? "&" : "?") + "connect_timeout=15&pool_timeout=15";
}
if (dbUrl && dbUrl.includes("-pooler.") && !dbUrl.includes("pgbouncer=true")) {
  dbUrl += "&pgbouncer=true";
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
