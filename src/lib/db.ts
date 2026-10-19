import { PrismaClient } from "@prisma/client";
export * from "./types";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  let dbUrl = process.env.DATABASE_URL || "file:./prisma/dev.db";

  // When deployed on Vercel serverless functions, copy dev.db to writable /tmp
  if (process.env.VERCEL && typeof window === "undefined") {
    try {
      const fs = require("fs");
      const path = require("path");
      const tmpDbPath = path.join("/tmp", "dev.db");

      // Check all possible locations where Next.js/Vercel bundles dev.db
      const candidatePaths = [
        path.join(process.cwd(), "prisma", "dev.db"),
        path.join(process.cwd(), "dev.db"),
        path.join(__dirname, "..", "prisma", "dev.db"),
        path.join(__dirname, "dev.db"),
      ];

      if (!fs.existsSync(tmpDbPath)) {
        for (const candidate of candidatePaths) {
          if (fs.existsSync(candidate)) {
            try {
              fs.copyFileSync(candidate, tmpDbPath);
              console.log(`Copied SQLite database from ${candidate} to ${tmpDbPath}`);
              break;
            } catch (copyErr) {
              console.warn(`Failed copying from ${candidate}:`, copyErr);
            }
          }
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
