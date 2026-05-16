/**
 * SessionRevocationEngine
 * Tracks revoked session tokens. Called after password reset or forced logout.
 * Any revoked token must fail auth regardless of expiry.
 */

export interface RevocationRecord {
  sessionId: string;
  userId: string;
  revokedAt: number;
  reason: "password_reset" | "forced_logout" | "suspicious_activity" | "admin_revoke";
}

const MAX_RECORDS = 2000;
const revocationLog: RevocationRecord[] = [];
const revokedSet = new Set<string>();

export function revokeSession(sessionId: string, userId: string, reason: RevocationRecord["reason"]): RevocationRecord {
  const record: RevocationRecord = { sessionId, userId, revokedAt: Date.now(), reason };
  revokedSet.add(sessionId);
  revocationLog.unshift(record);
  if (revocationLog.length > MAX_RECORDS) revocationLog.pop();
  return record;
}

export function revokeAllSessionsForUser(userId: string, reason: RevocationRecord["reason"]): RevocationRecord[] {
  // In a real system this would look up active sessions from a session store.
  // Here we record the revocation event so any inbound session for this userId is rejected.
  const sentinel = `user:${userId}:all`;
  revokedSet.add(sentinel);
  const record: RevocationRecord = { sessionId: sentinel, userId, revokedAt: Date.now(), reason };
  revocationLog.unshift(record);
  if (revocationLog.length > MAX_RECORDS) revocationLog.pop();
  return [record];
}

export function isRevoked(sessionId: string, userId?: string): boolean {
  if (revokedSet.has(sessionId)) return true;
  if (userId && revokedSet.has(`user:${userId}:all`)) return true;
  return false;
}

export function clearRevocationForUser(userId: string): void {
  revokedSet.delete(`user:${userId}:all`);
}

export function getRevocationLog(limit = 100): RevocationRecord[] {
  return revocationLog.slice(0, limit);
}

export function getRevocationMetrics(): { total: number; byReason: Record<RevocationRecord["reason"], number> } {
  const byReason: Record<RevocationRecord["reason"], number> = {
    password_reset: 0,
    forced_logout: 0,
    suspicious_activity: 0,
    admin_revoke: 0,
  };
  for (const r of revocationLog) byReason[r.reason]++;
  return { total: revocationLog.length, byReason };
}
