/**
 * UserStore — shared in-memory user registry for standalone auth (no backend required).
 * Persists for the lifetime of the Next.js process.
 * Production: swap Map for Prisma/Redis — interface stays the same.
 */

import { createHash, randomUUID } from 'node:crypto';

export type UserTier = 'FREE' | 'PRO' | 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND' | 'ADMIN';
export type UserRole = 'user' | 'admin';

export interface StoredUser {
  id: string;
  email: string;
  passwordHash: string;
  displayName: string;
  tier: UserTier;
  role: UserRole;
  createdAt: number;
  ref?: string; // referrer username if any
}

const STORE = new Map<string, StoredUser>(); // keyed by email (lowercase)

function getAuthSalt(): string {
  return process.env.NEXTAUTH_SECRET ?? 'tmi-launch-salt-2026';
}

function hashPassword(password: string): string {
  return createHash('sha256').update(`${getAuthSalt()}:${password}`).digest('hex');
}

// Hardcoded admin emails — always valid with any password
const HARDCODED_ADMINS = new Set([
  'berntmusic33@gmail.com',
  'bjmtherapper1@gmail.com',
  'rjking42@icloud.com',
]);

// Diamond lifetime accounts
const HARDCODED_DIAMOND = new Set([
  't.muse82@icloud.com',
  'facethebully916@gmail.com',
  'kevenfobbsgrip@gmail.com',
  'parisdcooper91@gmail.com',
  'mystictrinity@yahoo.com',
  'sharingmyblessing1978@gmail.com',
  'blackstargoldpr@gmail.com',
]);

export function resolveHardcodedTierRole(email: string): { tier: UserTier; role: UserRole } | null {
  const e = email.toLowerCase();
  const envAdmins = (process.env.ADMIN_EMAILS ?? '').split(',').map((x) => x.trim().toLowerCase()).filter(Boolean);
  if (HARDCODED_ADMINS.has(e) || envAdmins.includes(e)) return { tier: 'ADMIN', role: 'admin' };
  if (HARDCODED_DIAMOND.has(e)) return { tier: 'DIAMOND', role: 'user' };
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
  ref?: string;
}): { ok: boolean; user?: StoredUser; error?: string } {
  const email = params.email.trim().toLowerCase();
  if (!email || !params.password) return { ok: false, error: 'Email and password required' };
  if (STORE.has(email)) return { ok: false, error: 'An account with that email already exists' };

  const hardcoded = resolveHardcodedTierRole(email);
  const tier = hardcoded?.tier ?? params.tier ?? 'FREE';
  const role = hardcoded?.role ?? 'user';

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
  return { ok: true, user };
}

export function loginUser(email: string, password: string): StoredUser | null {
  const e = email.trim().toLowerCase();

  // Hardcoded admins/diamond can always log in (any password during launch)
  const hardcoded = resolveHardcodedTierRole(e);
  if (hardcoded) {
    // Return or create their record
    const existing = STORE.get(e);
    if (existing) return existing;
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
