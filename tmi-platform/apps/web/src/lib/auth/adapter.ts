// src/lib/auth/adapter.ts
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-require-imports */
import type { Adapter } from "next-auth/adapters";

/**
 * Lazy-load PrismaAdapter in a sync-friendly way.
 * Synchronous require is used to satisfy NextAuth's expectation of a sync Adapter.
 */
export function getAdapter(): Adapter {
  // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
  const { PrismaAdapter } = require("@next-auth/prisma-adapter");
  // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
  const { prisma } = require("../prismaClient");
  return PrismaAdapter(prisma);
}
