import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function buildClient(): PrismaClient {
  // Prisma v7 + the schema's `driverAdapters` preview feature require an
  // explicit adapter — bare `new PrismaClient()` throws at construction
  // ("needs to be constructed with a non-empty, valid PrismaClientOptions").
  const connectionString = process.env["DATABASE_URL"];
  if (!connectionString) {
    throw new Error("[lib/prisma] DATABASE_URL environment variable is not set");
  }
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma: PrismaClient = globalForPrisma.prisma ?? buildClient();

if (process.env["NODE_ENV"] !== "production") {
  globalForPrisma.prisma = prisma;
}
