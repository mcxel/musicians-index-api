/**
 * packages/db/src/index.ts
 * PrismaClient singleton + Prisma type re-exports for the TMI monorepo.
 *
 * Prisma v7 requires a driver adapter — connection URL is NOT in schema.prisma.
 * Uses @prisma/adapter-pg with pg Pool for PostgreSQL.
 *
 * Import from "db" in any workspace package (api, web) to get the shared client.
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// ---------------------------------------------------------------------------
// Global singleton — prevents multiple PrismaClient instances in dev (Next.js
// hot-reload) and in NestJS module re-initialisation.
// ---------------------------------------------------------------------------

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env["DATABASE_URL"];
  if (!connectionString) {
    throw new Error("[db] DATABASE_URL environment variable is not set");
  }
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log:
      process.env["NODE_ENV"] === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env["NODE_ENV"] !== "production") {
  globalForPrisma.prisma = prisma;
}

// ---------------------------------------------------------------------------
// Re-export the Prisma namespace so consumers can use Prisma types without
// importing directly from @prisma/client.
//
// Usage:
//   import { prisma, Prisma } from "db";
//   const user: Prisma.UserGetPayload<...> = ...
// ---------------------------------------------------------------------------

export { Prisma } from "@prisma/client";

// Re-export all generated model types for convenience.
export type {
  User,
  ArtistProfile,
  FanProfile,
  Article,
  Station,
  Room,
  Show,
  Contest,
  ContestEntry,
  Sponsor,
  SponsorCampaign,
  Advertiser,
  AdCampaign,
  AdPlacement,
  Clip,
  Replay,
  Notification,
  Message,
  Wallet,
  Transaction,
  Payout,
  Tip,
  Credit,
  Achievement,
  Badge,
  LeaderboardEntry,
  Tag,
  Genre,
  Report,
  AuditLog,
  FeatureFlag,
} from "@prisma/client";

// Default export for convenience (NestJS injection pattern).
export default prisma;
