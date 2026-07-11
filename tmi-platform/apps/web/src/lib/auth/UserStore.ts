/**
 * UserStore — dual-mode user registry.
 *
 * Without DATABASE_URL: in-memory Map (soft-launch mode, data lost on restart).
 * With DATABASE_URL:    Prisma write-through + Map read cache (production-safe).
 *
 * All public functions remain synchronous — callers don't need to change.
 * DB writes are async fire-and-forget; the Map is always the sync read source.
 * On module load, DB users are pre-loaded into the Map so reads are warm.
 */

import { createHash, randomUUID } from 'node:crypto';

export type UserTier = 'FREE' | 'PRO' | 'RUBY' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND' | 'ADMIN';
export type UserRole = 'user' | 'admin' | 'staff' | 'fan' | 'artist' | 'performer' | 'sponsor' | 'advertiser' | 'venue' | 'writer' | 'promoter';

export interface StoredUser {
  id: string;
  email: string;
  passwordHash: string;
  displayName: string;
  tier: UserTier;
  role: UserRole;
  createdAt: number;
  ref?: string;
}

// ── In-memory cache (always authoritative for sync reads) ─────────────────────
const STORE = new Map<string, StoredUser>(); // keyed by email (lowercase)

// ── Prisma (only when DATABASE_URL is set) ────────────────────────────────────
type PrismaLike = {
  user: {
    create: (args: object) => Promise<{ id: string; email: string | null; passwordHash: string | null; displayName: string | null; tier: string; role: string; userRef: string | null; userCreatedAt: Date }>;
    upsert: (args: object) => Promise<unknown>;
    findUnique: (args: object) => Promise<{ id: string; email: string | null; passwordHash: string | null; displayName: string | null; tier: string; role: string; userRef: string | null; userCreatedAt: Date } | null>;
    findMany: (args?: object) => Promise<Array<{ id: string; email: string | null; passwordHash: string | null; displayName: string | null; tier: string; role: string; userRef: string | null; userCreatedAt: Date }>>;
    count: () => Promise<number>;
  };
};

let db: PrismaLike | null = null;
let dbLoaded = false;

function getDb(): PrismaLike | null {
  if (!process.env.DATABASE_URL) return null;
  if (db) return db;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaClient } = require('@prisma/client') as { PrismaClient: new (opts: object) => PrismaLike };
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaPg } = require('@prisma/adapter-pg') as { PrismaPg: new (pool: unknown) => unknown };
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Pool } = require('pg') as { Pool: new (opts: object) => unknown };
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    db = new PrismaClient({ adapter });
    return db;
  } catch {
    return null;
  }
}

const DB_TO_ROLE: Record<string, UserRole> = {
  ADMIN: 'admin', STAFF: 'staff', FAN: 'fan', ARTIST: 'artist',
  PERFORMER: 'performer', SPONSOR: 'sponsor', ADVERTISER: 'advertiser',
  VENUE: 'venue', WRITER: 'writer', PROMOTER: 'promoter', USER: 'user',
};

function mapDbRow(row: { id: string; email: string | null; passwordHash: string | null; displayName: string | null; tier: string; role: string; userRef: string | null; userCreatedAt: Date }): StoredUser {
  return {
    id: row.id,
    email: row.email ?? '',
    passwordHash: row.passwordHash ?? '',
    displayName: row.displayName ?? (row.email ?? '').split('@')[0] ?? 'User',
    tier: (row.tier as UserTier) ?? 'FREE',
    role: DB_TO_ROLE[row.role.toUpperCase()] ?? 'user',
    createdAt: row.userCreatedAt.getTime(),
    ref: row.userRef ?? undefined,
  };
}

async function loadFromDb(): Promise<void> {
  const client = getDb();
  if (!client || dbLoaded) return;
  try {
    const rows = await client.user.findMany();
    rows.forEach((row) => {
      if (row.email) STORE.set(row.email.toLowerCase(), mapDbRow(row));
    });
    dbLoaded = true;
  } catch {
    // DB not reachable — stay in Map-only mode
  }
}

const ROLE_TO_DB: Record<UserRole, string> = {
  admin:      'ADMIN',
  staff:      'STAFF',
  fan:        'FAN',
  artist:     'ARTIST',
  performer:  'PERFORMER',
  sponsor:    'SPONSOR',
  advertiser: 'ADVERTISER',
  venue:      'VENUE',
  writer:     'WRITER',
  promoter:   'PROMOTER',
  user:       'USER',
};

async function persistUser(user: StoredUser): Promise<void> {
  const client = getDb();
  if (!client) return;
  try {
    const dbRole = ROLE_TO_DB[user.role] ?? 'USER';
    await client.user.upsert({
      where: { email: user.email },
      create: {
        id: user.id,
        email: user.email,
        passwordHash: user.passwordHash,
        displayName: user.displayName,
        tier: user.tier,
        role: dbRole,
        userRef: user.ref ?? null,
        userCreatedAt: new Date(user.createdAt),
        termsAccepted: true,
      },
      update: {
        passwordHash: user.passwordHash,
        displayName: user.displayName,
        tier: user.tier,
        role: dbRole,
      },
    });
  } catch {
    // Silently swallow DB errors — Map is the source of truth
  }
}

// Pre-load DB users into Map on module init (non-blocking)
// Exported so routes can await it before first read on cold start.
export const dbReady: Promise<void> = loadFromDb();

// ── Auth helpers ──────────────────────────────────────────────────────────────

function getAuthSalt(): string {
  return process.env.NEXTAUTH_SECRET ?? 'tmi-launch-salt-2026';
}

function hashPassword(password: string): string {
  return createHash('sha256').update(`${getAuthSalt()}:${password}`).digest('hex');
}

// Hardcoded admin emails — always valid with any password
// Micah intentionally NOT here: Diamond-for-life membership, but role=fan,
// no administration access — see HARDCODED_DIAMOND below.
const HARDCODED_ADMINS = new Set([
  'berntmusic33@gmail.com',
  'rjking42@icloud.com',
  'jay@themusiciansindex.com',
  'justin@themusiciansindex.com',
]);

// Diamond lifetime accounts
const HARDCODED_DIAMOND = new Set([
  't.muse82@icloud.com',
  'facethebully916@gmail.com',
  'suedejs2000@gmail.com',
  'kevenfobbsgrip@gmail.com',
  'parisdcooper91@gmail.com',
  'mystictrinity@yahoo.com',
  'sharingmyblessing1978@gmail.com',
  'blackstargoldpr@gmail.com',
  'losdamost222@gmail.com',
  'griffithscott1962@gmail.com',
  'jasjen63@gmail.com',
  'pat.jones2022@gmail.com',
  'bjmbeat@berntoutglobal.com',
  'micah@themusiciansindex.com',
  'dylanbartell15@gmail.com',
]);

const HARDCODED_PERFORMER = new Set([
  'suedejs2000@gmail.com',
  'terry@themusiciansindex.com',
  'jerome@themusiciansindex.com',
  'wennidoodo@outlook.com',
]);

export function resolveHardcodedTierRole(email: string): { tier: UserTier; role: UserRole } | null {
  const e = email.toLowerCase();
  const envAdmins = (process.env.ADMIN_EMAILS ?? '').split(',').map((x) => x.trim().toLowerCase()).filter(Boolean);
  const envDiamond = (process.env.DIAMOND_EMAILS ?? '').split(',').map((x) => x.trim().toLowerCase()).filter(Boolean);
  if (HARDCODED_ADMINS.has(e) || envAdmins.includes(e)) return { tier: 'ADMIN', role: 'admin' };
  if (HARDCODED_PERFORMER.has(e)) return { tier: 'DIAMOND', role: 'performer' };
  if (HARDCODED_DIAMOND.has(e) || envDiamond.includes(e)) return { tier: 'DIAMOND', role: 'fan' };
  return null;
}

export type RegisterResult = {
  ok: true;
  user: StoredUser;
} | {
  ok: false;
  error: string;
}

export function registerUser(params: {
  email: string;
  password: string;
  displayName?: string;
  tier?: UserTier;
  role?: UserRole;
  ref?: string;
}): { ok: boolean; user?: StoredUser; error?: string } {
  const email = params.email.trim().toLowerCase();
  if (!email || !params.password) return { ok: false, error: 'Email and password required' };
  if (STORE.has(email)) return { ok: false, error: 'An account with that email already exists' };

  const hardcoded = resolveHardcodedTierRole(email);
  const tier = hardcoded?.tier ?? params.tier ?? 'FREE';
  const role = hardcoded?.role ?? params.role ?? 'user';

  const user: StoredUser = {
    id: randomUUID(),
    email,
    passwordHash: hashPassword(params.password),
    displayName: params.displayName ?? email.split('@')[0] ?? 'User',
    tier,
    role,
    createdAt: Date.now(),
    ref: params.ref,
  };

  STORE.set(email, user);
  void persistUser(user); // async fire-and-forget
  return { ok: true, user };
}

export function loginUser(email: string, password: string): StoredUser | null {
  const e = email.trim().toLowerCase();

  // Hardcoded admins/diamond can always log in (any password during launch)
  const hardcoded = resolveHardcodedTierRole(e);
  if (hardcoded) {
    const existing = STORE.get(e);
    if (existing) {
      if (existing.tier !== hardcoded.tier || existing.role !== hardcoded.role) {
        existing.tier = hardcoded.tier;
        existing.role = hardcoded.role;
        STORE.set(e, existing);
        void persistUser(existing);
      }
      return existing;
    }
    // Auto-create record for hardcoded accounts on first login
    const user: StoredUser = {
      id: randomUUID(),
      email: e,
      passwordHash: hashPassword(password),
      displayName: e.split('@')[0] ?? 'Admin',
      tier: hardcoded.tier,
      role: hardcoded.role,
      createdAt: Date.now(),
    };
    STORE.set(e, user);
    void persistUser(user);
    return user;
  }

  const user = STORE.get(e);
  if (!user) return null;
  if (user.passwordHash !== hashPassword(password)) return null;
  return user;
}

export function getUserByEmail(email: string): StoredUser | null {
  return STORE.get(email.trim().toLowerCase()) ?? null;
}

export function getUserById(id: string): StoredUser | null {
  for (const u of STORE.values()) {
    if (u.id === id) return u;
  }
  return null;
}

export function getUserCount(): number {
  return STORE.size;
}

export type PublicUserProfile = {
  id: string;
  email: string;
  displayName: string;
  tier: UserTier;
  role: UserRole;
  createdAt: number;
};

export function getAllUsers(limit = 50): PublicUserProfile[] {
  const users: PublicUserProfile[] = [];
  for (const u of STORE.values()) {
    users.push({ id: u.id, email: u.email, displayName: u.displayName, tier: u.tier, role: u.role, createdAt: u.createdAt });
  }
  return users.sort((a, b) => b.createdAt - a.createdAt).slice(0, limit);
}

export function updateUserRole(email: string, role: UserRole): boolean {
  const e = email.trim().toLowerCase();
  const user = STORE.get(e);
  if (!user) return false;
  user.role = role;
  STORE.set(e, user);
  void persistUser(user);
  return true;
}

export function updateUserTier(email: string, tier: UserTier): boolean {
  const e = email.trim().toLowerCase();
  const user = STORE.get(e);
  if (!user) return false;
  // Never downgrade ADMIN or DIAMOND hardcoded accounts
  if (user.tier === 'ADMIN') return false;
  user.tier = tier;
  STORE.set(e, user);
  void persistUser(user);
  return true;
}

export function updateUserPassword(email: string, newPassword: string): boolean {
  const e = email.trim().toLowerCase();
  const user = STORE.get(e);
  if (!user) return false;
  user.passwordHash = hashPassword(newPassword);
  STORE.set(e, user);
  void persistUser(user);
  return true;
}
