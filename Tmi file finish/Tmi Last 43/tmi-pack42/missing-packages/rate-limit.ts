// packages/cache/src/rate-limit.service.ts
// Request rate limiting using Redis + sliding window algorithm.

import { cache, CACHE_KEYS } from "./cache-layer";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  retryAfterSeconds?: number;
}

// ── RATE LIMIT CONFIGS ────────────────────────────────
export const RATE_LIMITS = {
  // API endpoints
  "api:global":           { max: 100,  windowSeconds: 60   },  // 100 req/min per IP
  "api:auth:login":       { max: 5,    windowSeconds: 60   },  // 5 login attempts/min
  "api:auth:register":    { max: 3,    windowSeconds: 300  },  // 3 registrations/5min
  "api:upload":           { max: 10,   windowSeconds: 3600 },  // 10 uploads/hr
  "api:vote":             { max: 20,   windowSeconds: 60   },  // 20 votes/min
  "api:tip":              { max: 50,   windowSeconds: 3600 },  // 50 tips/hr
  "api:message":          { max: 60,   windowSeconds: 60   },  // 60 messages/min
  "api:search":           { max: 30,   windowSeconds: 60   },  // 30 searches/min

  // Fraud prevention
  "fraud:points_earn":    { max: 10,   windowSeconds: 60   },  // velocity check
  "fraud:vote_duplicate": { max: 1,    windowSeconds: 86400},  // 1 vote per event per day

  // Bots
  "bot:outreach":         { max: 50,   windowSeconds: 86400},  // 50 outreach/day per bot
  "bot:email":            { max: 1000, windowSeconds: 3600 },  // 1000 emails/hr
} as const;

export type RateLimitKey = keyof typeof RATE_LIMITS;

// ── SLIDING WINDOW CHECK ─────────────────────────────
export async function checkRateLimit(
  key: RateLimitKey,
  identifier: string  // userId or IP
): Promise<RateLimitResult> {
  const config = RATE_LIMITS[key];
  const cacheKey = `rl:${key}:${identifier}`;
  const allowed = await cache.rateLimit(cacheKey, config.max, config.windowSeconds);
  const current = parseInt(await cache.get(cacheKey) || "0");
  return {
    allowed,
    remaining: Math.max(0, config.max - current),
    resetAt: new Date(Date.now() + config.windowSeconds * 1000),
    retryAfterSeconds: allowed ? undefined : config.windowSeconds,
  };
}
