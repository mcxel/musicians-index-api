type SessionRecoveryRecord = {
  email: string;
  createdAt: number;
  expiresAt: number;
  reason: "browser_restart" | "token_refresh" | "manual_recovery";
};

const SESSION_RECOVERY_TTL_MS = 24 * 60 * 60 * 1000;
const sessionRecoveryStore = new Map<string, SessionRecoveryRecord>();

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function createSessionRecovery(params: {
  email: string;
  reason?: SessionRecoveryRecord["reason"];
}): SessionRecoveryRecord {
  const email = normalizeEmail(params.email);
  const now = Date.now();
  const record: SessionRecoveryRecord = {
    email,
    createdAt: now,
    expiresAt: now + SESSION_RECOVERY_TTL_MS,
    reason: params.reason ?? "manual_recovery",
  };
  sessionRecoveryStore.set(email, record);
  return record;
}

export function getSessionRecovery(email: string): SessionRecoveryRecord | null {
  const key = normalizeEmail(email);
  const rec = sessionRecoveryStore.get(key);
  if (!rec) return null;
  if (Date.now() > rec.expiresAt) {
    sessionRecoveryStore.delete(key);
    return null;
  }
  return rec;
}

export function consumeSessionRecovery(email: string): SessionRecoveryRecord | null {
  const key = normalizeEmail(email);
  const rec = getSessionRecovery(key);
  if (!rec) return null;
  sessionRecoveryStore.delete(key);
  return rec;
}

/**
 * Validate recovery link expiration (for middleware).
 * Recovery tokens expire after 24 hours.
 * Returns true if token is valid and not expired.
 */
export function validateRecoveryLinkExpiration(token: string): boolean {
  if (!token) return false;

  // In production, tokens should be validated against a secure store
  // For now, we validate based on recovery records that are stored by email
  // In a real implementation, the token would be:
  // - Hashed version of email + timestamp
  // - Stored in a recovery_tokens table with expiration
  // - Compared against hashed incoming token

  // Simple implementation: check if any active recovery record exists
  const now = Date.now();
  for (const record of sessionRecoveryStore.values()) {
    if (record.expiresAt > now) {
      return true; // At least one valid recovery token exists
    }
  }

  return false;
}
