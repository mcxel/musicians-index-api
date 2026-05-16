/**
 * RecoveryRateLimiter
 * Prevents abuse of password reset, resend-verification, and recovery flows.
 * Enforces per-email and per-IP limits with automatic window expiry.
 */

export type RateLimitedAction =
  | "password_reset_request"
  | "resend_verification"
  | "recovery_attempt"
  | "support_recovery_request";

interface RateWindow {
  count: number;
  windowStart: number;
  blocked: boolean;
  blockedUntil: number;
}

const LIMITS: Record<RateLimitedAction, { maxPerWindow: number; windowMs: number; blockMs: number }> = {
  password_reset_request:      { maxPerWindow: 3,  windowMs: 15 * 60_000, blockMs: 30 * 60_000 },
  resend_verification:         { maxPerWindow: 5,  windowMs: 60 * 60_000, blockMs: 60 * 60_000 },
  recovery_attempt:            { maxPerWindow: 10, windowMs: 15 * 60_000, blockMs: 60 * 60_000 },
  support_recovery_request:    { maxPerWindow: 2,  windowMs: 24 * 60 * 60_000, blockMs: 24 * 60 * 60_000 },
};

const emailWindows = new Map<string, Map<RateLimitedAction, RateWindow>>();
const ipWindows    = new Map<string, Map<RateLimitedAction, RateWindow>>();

function windowKey(identifier: string, action: RateLimitedAction): string {
  return `${identifier}::${action}`;
}

function getWindow(
  store: Map<string, Map<RateLimitedAction, RateWindow>>,
  identifier: string,
  action: RateLimitedAction
): RateWindow {
  if (!store.has(identifier)) store.set(identifier, new Map());
  const actionMap = store.get(identifier)!;
  if (!actionMap.has(action)) {
    actionMap.set(action, { count: 0, windowStart: Date.now(), blocked: false, blockedUntil: 0 });
  }
  return actionMap.get(action)!;
}

export interface RateLimitResult {
  allowed: boolean;
  reason: "ok" | "blocked" | "limit_reached";
  remainingAttempts: number;
  resetAt: number;
  blockedUntil: number;
}

export function checkRateLimit(
  action: RateLimitedAction,
  email: string,
  ip?: string
): RateLimitResult {
  const now = Date.now();
  const limit = LIMITS[action];
  const normalizedEmail = email.toLowerCase().trim();

  function evalWindow(window: RateWindow): RateLimitResult {
    if (window.blocked) {
      if (now < window.blockedUntil) {
        return { allowed: false, reason: "blocked", remainingAttempts: 0, resetAt: window.windowStart + limit.windowMs, blockedUntil: window.blockedUntil };
      }
      window.blocked = false;
      window.count = 0;
      window.windowStart = now;
    }

    if (now - window.windowStart > limit.windowMs) {
      window.count = 0;
      window.windowStart = now;
    }

    if (window.count >= limit.maxPerWindow) {
      window.blocked = true;
      window.blockedUntil = now + limit.blockMs;
      return { allowed: false, reason: "limit_reached", remainingAttempts: 0, resetAt: window.windowStart + limit.windowMs, blockedUntil: window.blockedUntil };
    }

    return {
      allowed: true,
      reason: "ok",
      remainingAttempts: limit.maxPerWindow - window.count,
      resetAt: window.windowStart + limit.windowMs,
      blockedUntil: 0,
    };
  }

  const emailWindow = getWindow(emailWindows, normalizedEmail, action);
  const emailResult = evalWindow(emailWindow);
  if (!emailResult.allowed) return emailResult;

  if (ip) {
    const ipWindow = getWindow(ipWindows, ip, action);
    const ipResult = evalWindow(ipWindow);
    if (!ipResult.allowed) return ipResult;
    ipWindow.count++;
  }

  emailWindow.count++;
  return emailResult;
}

export function recordAttempt(action: RateLimitedAction, email: string, ip?: string): RateLimitResult {
  return checkRateLimit(action, email, ip);
}

export function clearLimits(email: string): void {
  emailWindows.delete(email.toLowerCase().trim());
}

export function getRateLimitStatus(action: RateLimitedAction, email: string): {
  count: number;
  remaining: number;
  blocked: boolean;
  blockedUntil: number;
} {
  const normalizedEmail = email.toLowerCase().trim();
  const limit = LIMITS[action];
  const window = getWindow(emailWindows, normalizedEmail, action);
  const now = Date.now();
  const inWindow = (now - window.windowStart) <= limit.windowMs;
  const count = inWindow ? window.count : 0;
  return {
    count,
    remaining: Math.max(0, limit.maxPerWindow - count),
    blocked: window.blocked && now < window.blockedUntil,
    blockedUntil: window.blockedUntil,
  };
}
