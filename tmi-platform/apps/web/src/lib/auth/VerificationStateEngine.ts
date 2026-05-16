/**
 * VerificationStateEngine
 * Manages email verification state per user.
 * Issues tokens, validates, and tracks verification completions.
 */

export type VerificationState = "unverified" | "pending" | "verified" | "expired" | "blocked";

export interface VerificationRecord {
  userId: string;
  email: string;
  state: VerificationState;
  token: string | null;
  tokenIssuedAt: number | null;
  tokenExpiresAt: number | null;
  verifiedAt: number | null;
  resendCount: number;
  lastResendAt: number | null;
}

const TOKEN_TTL_MS = 24 * 60 * 60_000; // 24 hours
const MAX_RESENDS = 5;
const MAX_RECORDS = 10_000;

const verificationStore = new Map<string, VerificationRecord>();

function makeVerificationToken(): string {
  const bytes = new Uint8Array(24);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 24; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
}

export function initVerification(userId: string, email: string): VerificationRecord {
  const existing = verificationStore.get(userId);
  if (existing?.state === "verified") return existing;

  const now = Date.now();
  const token = makeVerificationToken();
  const record: VerificationRecord = {
    userId,
    email: email.toLowerCase().trim(),
    state: "pending",
    token,
    tokenIssuedAt: now,
    tokenExpiresAt: now + TOKEN_TTL_MS,
    verifiedAt: null,
    resendCount: 0,
    lastResendAt: null,
  };
  verificationStore.set(userId, record);
  if (verificationStore.size > MAX_RECORDS) {
    const oldest = [...verificationStore.keys()].slice(0, 100);
    oldest.forEach(k => verificationStore.delete(k));
  }
  return record;
}

export function resendVerification(userId: string): VerificationRecord | { error: string } {
  const record = verificationStore.get(userId);
  if (!record) return { error: "no_record" };
  if (record.state === "verified") return { error: "already_verified" };
  if (record.resendCount >= MAX_RESENDS) return { error: "max_resends_reached" };

  const now = Date.now();
  record.token = makeVerificationToken();
  record.tokenIssuedAt = now;
  record.tokenExpiresAt = now + TOKEN_TTL_MS;
  record.state = "pending";
  record.resendCount++;
  record.lastResendAt = now;
  return record;
}

export type VerifyResult =
  | { success: true; record: VerificationRecord }
  | { success: false; reason: "not_found" | "already_verified" | "token_mismatch" | "expired" };

export function verifyEmail(userId: string, token: string): VerifyResult {
  const record = verificationStore.get(userId);
  if (!record) return { success: false, reason: "not_found" };
  if (record.state === "verified") return { success: false, reason: "already_verified" };
  if (record.token !== token) return { success: false, reason: "token_mismatch" };
  if (!record.tokenExpiresAt || Date.now() > record.tokenExpiresAt) {
    record.state = "expired";
    return { success: false, reason: "expired" };
  }
  record.state = "verified";
  record.verifiedAt = Date.now();
  record.token = null;
  return { success: true, record };
}

export function getVerificationState(userId: string): VerificationState {
  const record = verificationStore.get(userId);
  if (!record) return "unverified";
  if (record.state === "pending" && record.tokenExpiresAt && Date.now() > record.tokenExpiresAt) {
    record.state = "expired";
  }
  return record.state;
}

export function getVerificationRecord(userId: string): VerificationRecord | null {
  return verificationStore.get(userId) ?? null;
}

export function forceVerify(userId: string, email: string): VerificationRecord {
  const record = verificationStore.get(userId) ?? {
    userId, email: email.toLowerCase().trim(),
    state: "unverified" as VerificationState,
    token: null, tokenIssuedAt: null, tokenExpiresAt: null,
    verifiedAt: null, resendCount: 0, lastResendAt: null,
  };
  record.state = "verified";
  record.verifiedAt = Date.now();
  record.token = null;
  verificationStore.set(userId, record);
  return record;
}

export function getVerificationMetrics(): Record<VerificationState, number> & { total: number } {
  const counts: Record<VerificationState, number> & { total: number } = {
    unverified: 0, pending: 0, verified: 0, expired: 0, blocked: 0, total: 0,
  };
  for (const r of verificationStore.values()) {
    counts[r.state]++;
    counts.total++;
  }
  return counts;
}
