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
