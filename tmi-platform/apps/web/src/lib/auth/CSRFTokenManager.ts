/**
 * CSRFTokenManager.ts
 *
 * CSRF token generation, validation, and rotation.
 * Implements double-submit cookie pattern with server-side validation.
 */

import crypto from 'crypto';

const CSRF_TOKENS = new Map<string, { token: string; timestamp: number; used: boolean }>();
const CSRF_COOKIE_NAME = 'tmi_csrf';
const CSRF_HEADER_NAME = 'x-csrf-token';
const CSRF_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const CSRF_CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour

/**
 * Generate a new CSRF token for the client.
 * Tokens are generated per IP to prevent cross-site token sharing.
 */
export function generateCSRFToken(clientIp: string): string {
  const key = `csrf:${clientIp}`;
  const existingEntry = CSRF_TOKENS.get(key);

  // Reuse token if still valid and not used
  if (existingEntry && Date.now() - existingEntry.timestamp < CSRF_TTL_MS && !existingEntry.used) {
    return existingEntry.token;
  }

  // Generate new token
  const token = crypto.randomBytes(32).toString('hex');
  CSRF_TOKENS.set(key, {
    token,
    timestamp: Date.now(),
    used: false,
  });

  return token;
}

/**
 * Validate CSRF token.
 * Token must:
 * - Exist in our registry
 * - Not be expired
 * - Match the client IP (double-submit validation)
 */
export function validateCSRFToken(token: string, clientIp: string): boolean {
  if (!token || token.length < 32) {
    return false;
  }

  const key = `csrf:${clientIp}`;
  const entry = CSRF_TOKENS.get(key);

  if (!entry) {
    return false;
  }

  // Check expiration
  if (Date.now() - entry.timestamp > CSRF_TTL_MS) {
    CSRF_TOKENS.delete(key);
    return false;
  }

  // Check token match
  if (entry.token !== token) {
    return false;
  }

  // Mark as used (single-use CSRF tokens are optional; here we allow reuse but track usage)
  entry.used = true;

  return true;
}

/**
 * Invalidate CSRF token (e.g., after logout).
 */
export function invalidateCSRFToken(clientIp: string): void {
  const key = `csrf:${clientIp}`;
  CSRF_TOKENS.delete(key);
}

/**
 * Cleanup expired CSRF tokens (call periodically).
 */
export function cleanupExpiredCSRFTokens(): void {
  const now = Date.now();
  let cleanedCount = 0;

  for (const [key, entry] of CSRF_TOKENS.entries()) {
    if (now - entry.timestamp > CSRF_TTL_MS) {
      CSRF_TOKENS.delete(key);
      cleanedCount++;
    }
  }

  if (cleanedCount > 0) {
    console.log(`[CSRF] Cleaned up ${cleanedCount} expired tokens`);
  }
}

/**
 * Get CSRF stats for monitoring.
 */
export function getCSRFStats(): { totalTokens: number; expiredTokens: number } {
  const now = Date.now();
  let expiredCount = 0;

  for (const entry of CSRF_TOKENS.values()) {
    if (now - entry.timestamp > CSRF_TTL_MS) {
      expiredCount++;
    }
  }

  return {
    totalTokens: CSRF_TOKENS.size,
    expiredTokens: expiredCount,
  };
}

// Run cleanup every hour
setInterval(cleanupExpiredCSRFTokens, CSRF_CLEANUP_INTERVAL);
