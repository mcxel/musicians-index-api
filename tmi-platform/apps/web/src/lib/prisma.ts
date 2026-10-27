import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// pg emits a recurring "SSL modes 'prefer'/'require'/'verify-ca' are treated
// as aliases for 'verify-full'" deprecation warning on every connection when
// DATABASE_URL's sslmode is one of those three. Rather than requiring the
// secret env var itself to be hand-edited on the hosting provider, opt into
// the compatibility flag pg's own warning recommends, in code, so it applies
// no matter what sslmode the connection string already has.
function withLibpqSslCompat(connectionString: string): string {
  try {
    const url = new URL(connectionString);
    if (!url.searchParams.has('uselibpqcompat')) {
      url.searchParams.set('uselibpqcompat', 'true');
    }
    const sslMode = url.searchParams.get('sslmode');
    if (sslMode === 'require' || sslMode === 'prefer' || sslMode === 'verify-ca') {
      url.searchParams.set('sslmode', 'verify-full');
    }
    return url.toString();
  } catch {
    // Malformed URL — let Pool surface the real connection error instead of
    // masking it here.
    return connectionString;
  }
}

function createPrismaClient(): PrismaClient {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      'FATAL: DATABASE_URL is missing from the environment. ' +
      "Check your hosting provider's Environment Variables (must be set for Production, not just Preview/Development)."
    );
  }
  const pool = new Pool({ connectionString: withLibpqSslCompat(process.env.DATABASE_URL) });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter, log: ['error'] });
}

let cachedClient: PrismaClient | undefined;

function getPrismaClient(): PrismaClient {
  if (process.env.NODE_ENV !== 'production') {
    // Survive HMR in dev by caching on globalThis instead of the module scope.
    if (!globalThis.prisma) globalThis.prisma = createPrismaClient();
    return globalThis.prisma;
  }
  if (!cachedClient) cachedClient = createPrismaClient();
  return cachedClient;
}

let schemaHealed = false;

export async function ensureUserDatabaseSchema(): Promise<void> {
  if (process.env.TMI_FORBID_SCHEMA_HEAL === "1") return;
  if (schemaHealed) return;
  try {
    const client = getPrismaClient();
    await client.$executeRawUnsafe(`
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "is_qa" BOOLEAN NOT NULL DEFAULT false;
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "account_status" TEXT NOT NULL DEFAULT 'active';
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "account_status_reason" TEXT;
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "account_status_expires_at" TIMESTAMP(3);
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "is_live" BOOLEAN NOT NULL DEFAULT false;
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "live_room_id" TEXT;
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "live_genre" TEXT;
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "live_started_at" TIMESTAMP(3);
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "billing_status" TEXT NOT NULL DEFAULT 'active';
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "billing_grace_ends_at" TIMESTAMP(3);
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "last_canceled_stripe_subscription_id" TEXT;
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "last_canceled_at" TIMESTAMP(3);
      UPDATE "User" SET "tier" = 'DIAMOND' WHERE "tier" = 'ADMIN' OR "email" = 'berntmusic33@gmail.com';
    `);
    schemaHealed = true;
  } catch (err) {
    console.warn('[prisma] Schema self-healing notice (non-fatal):', err);
  }
}

// Lazy proxy: defers createPrismaClient() (and its DATABASE_URL check) until
// the first actual property access, so importing this module during
// `next build`'s page-data collection can never throw.
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    return Reflect.get(getPrismaClient() as object, prop, receiver);
  },
});

export default prisma;


/**
 * Detects whether an error thrown by Prisma is specifically a P2021 TableDoesNotExist error.
 * Allows graceful degraded-mode fallbacks for known unmigrated tables without masking
 * unexpected database outages, connection errors, or authentication bugs.
 */
export function isPrismaTableMissingError(err: unknown, tableName?: string): boolean {
  if (!err || typeof err !== 'object') return false;
  const e = err as { code?: string; message?: string; meta?: { modelName?: string; table?: string } };
  const isTableCode = e.code === 'P2021' || e.code === '42P01' || (typeof e.message === 'string' && e.message.includes('P2021'));
  const mentionsMissingTable = typeof e.message === 'string' && (
    e.message.includes('does not exist in the current database') ||
    e.message.includes('does not exist') ||
    e.message.includes('TableDoesNotExist')
  );
  if (isTableCode || mentionsMissingTable) {
    if (tableName) {
      const lower = tableName.toLowerCase();
      const inMsg = typeof e.message === 'string' && e.message.toLowerCase().includes(lower);
      const inModel = typeof e.meta?.modelName === 'string' && e.meta.modelName.toLowerCase().includes(lower);
      return inMsg || inModel;
    }
    return true;
  }
  return false;
}
