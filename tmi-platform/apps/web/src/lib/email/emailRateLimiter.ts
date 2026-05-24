/**
 * emailRateLimiter.ts
 * In-process rate limiter for transactional email sends.
 * Guards against spam bursts and accidental loops.
 */

interface RateRecord {
  count: number;
  windowStart: number;
}

const WINDOW_MS     = 60_000;   // 1-minute sliding window
const MAX_PER_MIN   = 5;        // per recipient per minute
const MAX_GLOBAL    = 200;      // platform-wide per minute

const perRecipient = new Map<string, RateRecord>();
let globalRecord: RateRecord = { count: 0, windowStart: Date.now() };

// Prune stale records every 5 min
setInterval(() => {
  const now = Date.now();
  for (const [key, rec] of perRecipient) {
    if (now - rec.windowStart > WINDOW_MS * 2) perRecipient.delete(key);
  }
}, 300_000);

export function checkEmailRateLimit(recipient: string): {
  allowed: boolean;
  reason?: string;
  retryAfterMs?: number;
} {
  const now = Date.now();

  // Global limit
  if (now - globalRecord.windowStart > WINDOW_MS) {
    globalRecord = { count: 0, windowStart: now };
  }
  if (globalRecord.count >= MAX_GLOBAL) {
    return { allowed: false, reason: 'global_rate_limit', retryAfterMs: WINDOW_MS - (now - globalRecord.windowStart) };
  }

  // Per-recipient limit
  let rec = perRecipient.get(recipient);
  if (!rec || now - rec.windowStart > WINDOW_MS) {
    rec = { count: 0, windowStart: now };
  }
  if (rec.count >= MAX_PER_MIN) {
    return { allowed: false, reason: 'recipient_rate_limit', retryAfterMs: WINDOW_MS - (now - rec.windowStart) };
  }

  // Allow — increment counters
  perRecipient.set(recipient, { ...rec, count: rec.count + 1 });
  globalRecord.count++;

  return { allowed: true };
}

export function getRateLimitStats() {
  return {
    globalCount: globalRecord.count,
    trackedRecipients: perRecipient.size,
    windowMs: WINDOW_MS,
    maxPerMin: MAX_PER_MIN,
    maxGlobal: MAX_GLOBAL,
  };
}
