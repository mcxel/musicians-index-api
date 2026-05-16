/**
 * ResetTokenAuthority
 * Issues, validates, and invalidates password reset tokens.
 * Tokens are single-use, time-limited, and replay-protected.
 */

export interface ResetToken {
  token: string;
  userId: string;
  email: string;
  createdAt: number;
  expiresAt: number;
  usedAt: number | null;
  invalidated: boolean;
}

const TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutes
const MAX_STORED = 500;

const tokenStore = new Map<string, ResetToken>();

function makeToken(): string {
  const bytes = new Uint8Array(32);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 32; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
}

export function issueResetToken(userId: string, email: string): ResetToken {
  // Invalidate any existing tokens for this user
  for (const existing of tokenStore.values()) {
    if (existing.userId === userId && !existing.usedAt && !existing.invalidated) {
      existing.invalidated = true;
    }
  }

  const token = makeToken();
  const now = Date.now();
  const entry: ResetToken = {
    token,
    userId,
    email: email.toLowerCase().trim(),
    createdAt: now,
    expiresAt: now + TOKEN_TTL_MS,
    usedAt: null,
    invalidated: false,
  };

  tokenStore.set(token, entry);

  // Prune oldest entries if over limit
  if (tokenStore.size > MAX_STORED) {
    const oldest = [...tokenStore.entries()]
      .sort((a, b) => a[1].createdAt - b[1].createdAt)
      .slice(0, tokenStore.size - MAX_STORED);
    oldest.forEach(([k]) => tokenStore.delete(k));
  }

  return entry;
}

export type TokenValidation =
  | { valid: true; token: ResetToken }
  | { valid: false; reason: "not_found" | "expired" | "used" | "invalidated" };

export function validateResetToken(token: string): TokenValidation {
  const entry = tokenStore.get(token);
  if (!entry) return { valid: false, reason: "not_found" };
  if (entry.invalidated) return { valid: false, reason: "invalidated" };
  if (entry.usedAt !== null) return { valid: false, reason: "used" };
  if (Date.now() > entry.expiresAt) return { valid: false, reason: "expired" };
  return { valid: true, token: entry };
}

export function consumeResetToken(token: string): TokenValidation {
  const result = validateResetToken(token);
  if (!result.valid) return result;
  result.token.usedAt = Date.now();
  return result;
}

export function invalidateAllTokensForUser(userId: string): number {
  let count = 0;
  for (const entry of tokenStore.values()) {
    if (entry.userId === userId && !entry.invalidated) {
      entry.invalidated = true;
      count++;
    }
  }
  return count;
}

export function getTokenMetrics(): { total: number; active: number; used: number; expired: number; invalidated: number } {
  const now = Date.now();
  let active = 0, used = 0, expired = 0, invalidated = 0;
  for (const t of tokenStore.values()) {
    if (t.invalidated) { invalidated++; continue; }
    if (t.usedAt !== null) { used++; continue; }
    if (now > t.expiresAt) { expired++; continue; }
    active++;
  }
  return { total: tokenStore.size, active, used, expired, invalidated };
}
