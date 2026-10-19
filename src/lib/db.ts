import { PrismaClient } from "@prisma/client";
export * from "./types";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  let dbUrl = process.env.DATABASE_URL || "file:./dev.db";

  // When deployed on Vercel serverless functions, copy dev.db to writable /tmp
  if (process.env.VERCEL && typeof window === "undefined") {
    try {
      const fs = require("fs");
      const path = require("path");
      const tmpDbPath = path.join("/tmp", "dev.db");
      const localDbPath = path.join(process.cwd(), "dev.db");

      if (!fs.existsSync(tmpDbPath)) {
        if (fs.existsSync(localDbPath)) {
          fs.copyFileSync(localDbPath, tmpDbPath);
        }
      }
      dbUrl = `file:${tmpDbPath}`;
    } catch (e) {
      console.warn("SQLite /tmp preparation warning:", e);
    }
  }

  return new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
