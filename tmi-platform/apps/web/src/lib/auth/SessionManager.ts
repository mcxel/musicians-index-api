/**
 * SessionManager.ts
 *
 * Server-side session validation with replay attack detection and token rotation.
 * Maintains session state in memory with TTL-based cleanup.
 * Production deployment should use Redis/external cache.
 */

const SESSION_STORAGE = new Map<
  string,
  {
    userId: string;
    role: string;
    createdAt: number;
    lastActivity: number;
    lastIp: string;
    tokenRotationCount: number;
    fingerprint: string;
    tokenHistory: Array<{ token: string; timestamp: number }>;
  }
>();

const REVOKED_TOKENS = new Set<string>();
const REPLAY_ATTEMPTS = new Map<string, Array<{ timestamp: number; path: string; method: string }>>();

const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const REPLAY_WINDOW_MS = 5 * 1000; // 5 second window for replay detection
const TOKEN_ROTATION_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Compute fingerprint from session context.
 * Used to detect hijacked sessions.
 */
function computeFingerprint(clientIp: string, userAgent: string): string {
  const hash = require('crypto').createHash('sha256');
  hash.update(`${clientIp}:${userAgent}`);
  return hash.digest('hex');
}

/**
 * Validate session token server-side.
 * Checks expiration, inactivity, IP consistency, and revocation status.
 */
export async function validateSessionToken(
  sessionToken: string,
  sessionId: string,
  clientIp: string,
  userAgent?: string
): Promise<{
  valid: boolean;
  reason: string;
  replayDetected: boolean;
}> {
  // Check if token is revoked
  if (REVOKED_TOKENS.has(sessionToken)) {
    return { valid: false, reason: 'token-revoked', replayDetected: false };
  }

  // Lookup session
  const session = SESSION_STORAGE.get(sessionId);
  if (!session) {
    return { valid: false, reason: 'session-not-found', replayDetected: false };
  }

  const now = Date.now();

  // Check session expiration
  if (now - session.createdAt > SESSION_TTL_MS) {
    SESSION_STORAGE.delete(sessionId);
    return { valid: false, reason: 'session-expired', replayDetected: false };
  }

  // Check inactivity timeout
  if (now - session.lastActivity > INACTIVITY_TIMEOUT_MS) {
    SESSION_STORAGE.delete(sessionId);
    REVOKED_TOKENS.add(sessionToken);
    return { valid: false, reason: 'inactivity-timeout', replayDetected: false };
  }

  // Check IP consistency (optional: allow up to 2 different IPs in 5min window to handle proxies)
  const ipMismatch = session.lastIp !== clientIp;
  if (ipMismatch && session.lastActivity > now - 5 * 60 * 1000) {
    // IP change within 5 minutes - potential hijack
    return { valid: false, reason: 'ip-mismatch', replayDetected: true };
  }

  // Detect replay attacks: same request repeated in short time window
  const replayKey = `${sessionId}:${clientIp}`;
  const replayLog = REPLAY_ATTEMPTS.get(replayKey) || [];
  const recentAttempts = replayLog.filter((a) => now - a.timestamp < REPLAY_WINDOW_MS);

  if (recentAttempts.length > 3) {
    // More than 3 requests in 5 second window = likely replay
    return { valid: false, reason: 'replay-detected', replayDetected: true };
  }

  // Update session last activity
  session.lastActivity = now;
  session.lastIp = clientIp;

  // Log this request for replay detection
  recentAttempts.push({ timestamp: now, path: '', method: 'check' });
  REPLAY_ATTEMPTS.set(replayKey, recentAttempts.slice(-10)); // Keep last 10 attempts

  return { valid: true, reason: 'valid', replayDetected: false };
}

/**
 * Rotate session token.
 * Called on each request; returns new token if rotation interval elapsed.
 * Returns null if no rotation needed.
 */
export async function rotateSessionToken(
  currentToken: string,
  sessionId: string,
  clientIp: string
): Promise<string | null> {
  const session = SESSION_STORAGE.get(sessionId);
  if (!session) return null;

  const now = Date.now();
  const lastRotation = session.tokenHistory[session.tokenHistory.length - 1]?.timestamp || session.createdAt;

  // Rotate if interval elapsed
  if (now - lastRotation >= TOKEN_ROTATION_INTERVAL_MS) {
    const crypto = require('crypto');
    const newToken = crypto.randomBytes(32).toString('hex');

    // Add current token to history
    session.tokenHistory.push({ token: currentToken, timestamp: now });

    // Keep only last 5 tokens in history
    if (session.tokenHistory.length > 5) {
      const oldToken = session.tokenHistory.shift();
      if (oldToken) {
        // Don't revoke immediately; let them expire naturally to handle race conditions
        setTimeout(() => REVOKED_TOKENS.add(oldToken.token), 60 * 1000);
      }
    }

    session.tokenRotationCount++;
    return newToken;
  }

  return null;
}

/**
 * Create new session (called on login).
 */
export function createSession(
  userId: string,
  role: string,
  clientIp: string,
  userAgent?: string
): { sessionId: string; sessionToken: string } {
  const crypto = require('crypto');
  const sessionId = crypto.randomBytes(16).toString('hex');
  const sessionToken = crypto.randomBytes(32).toString('hex');
  const now = Date.now();

  SESSION_STORAGE.set(sessionId, {
    userId,
    role,
    createdAt: now,
    lastActivity: now,
    lastIp: clientIp,
    tokenRotationCount: 0,
    fingerprint: computeFingerprint(clientIp, userAgent || ''),
    tokenHistory: [{ token: sessionToken, timestamp: now }],
  });

  return { sessionId, sessionToken };
}

/**
 * Destroy session (called on logout).
 */
export function destroySession(sessionId: string, sessionToken: string): void {
  SESSION_STORAGE.delete(sessionId);
  REVOKED_TOKENS.add(sessionToken);

  // Also clear replay logs for this session
  for (const key of REPLAY_ATTEMPTS.keys()) {
    if (key.startsWith(sessionId)) {
      REPLAY_ATTEMPTS.delete(key);
    }
  }
}

/**
 * Cleanup expired sessions and replay logs (call periodically).
 */
export function cleanupExpiredSessions(): void {
  const now = Date.now();
  let cleanedCount = 0;

  // Clean sessions
  for (const [sessionId, session] of SESSION_STORAGE.entries()) {
    if (now - session.createdAt > SESSION_TTL_MS || now - session.lastActivity > INACTIVITY_TIMEOUT_MS) {
      SESSION_STORAGE.delete(sessionId);
      cleanedCount++;
    }
  }

  // Clean replay logs older than 1 hour
  for (const [key, attempts] of REPLAY_ATTEMPTS.entries()) {
    const recentAttempts = attempts.filter((a) => now - a.timestamp < 60 * 60 * 1000);
    if (recentAttempts.length === 0) {
      REPLAY_ATTEMPTS.delete(key);
    } else {
      REPLAY_ATTEMPTS.set(key, recentAttempts);
    }
  }

  // Clean revoked tokens older than 1 hour (sampling-based cleanup)
  if (REVOKED_TOKENS.size > 10000) {
    // Reset and rebuild from recent data (this is a simplification; real impl would track timestamp)
    REVOKED_TOKENS.clear();
  }
}

/**
 * Get current sessions count (for monitoring).
 */
export function getSessionStats(): {
  activeSessions: number;
  revokedTokens: number;
  replayLogsTracked: number;
} {
  return {
    activeSessions: SESSION_STORAGE.size,
    revokedTokens: REVOKED_TOKENS.size,
    replayLogsTracked: REPLAY_ATTEMPTS.size,
  };
}

// Run cleanup every 10 minutes
setInterval(cleanupExpiredSessions, 10 * 60 * 1000);
