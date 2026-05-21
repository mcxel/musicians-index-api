// packages/cache/src/cache.service.ts
// Redis abstraction for sessions, leaderboards, shop rotation, rate-limiting

import { Redis } from "ioredis";

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

// ── KEY NAMESPACES ─────────────────────────────────────
export const CACHE_KEYS = {
  // Sessions
  session:         (token: string) => `session:${token}`,
  userSessions:    (userId: string) => `user:${userId}:sessions`,
  // Rooms (lobby wall)
  lobbyRooms:      () => `lobby:rooms:sorted`,       // sorted set by viewerCount ASC
  roomViewers:     (roomId: string) => `room:${roomId}:viewers`,
  // Leaderboards (sorted sets)
  leaderboard:     (type: string) => `lb:${type}`,
  // Shop rotation snapshot
  shopRotation:    (zone: string) => `shop:${zone}:current`,
  // Points daily cap
  pointsDailyCap:  (userId: string) => `points:${userId}:daily:${new Date().toISOString().slice(0,10)}`,
  pointsWeeklyCap: (userId: string) => `points:${userId}:weekly:${getWeekKey()}`,
  // Rate limiting
  rateLimit:       (key: string) => `rl:${key}`,
  // Crown state
  crownState:      () => `crown:current`,
  // Feature flags
  featureFlag:     (key: string) => `ff:${key}`,
} as const;

function getWeekKey(): string {
  const d = new Date();
  const week = Math.ceil((d.getDate() - d.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${String(week).padStart(2,"0")}`;
}

// ── CORE OPERATIONS ────────────────────────────────────
export const cache = {
  get:    async (key: string) => redis.get(key),
  set:    async (key: string, value: string, ttlSeconds?: number) => ttlSeconds ? redis.setex(key, ttlSeconds, value) : redis.set(key, value),
  del:    async (key: string) => redis.del(key),
  incr:   async (key: string) => redis.incr(key),
  expire: async (key: string, seconds: number) => redis.expire(key, seconds),
  // Sorted sets (for leaderboards + lobby)
  zadd:   async (key: string, score: number, member: string) => redis.zadd(key, score, member),
  zrange: async (key: string, start: number, stop: number) => redis.zrange(key, start, stop, "WITHSCORES"),
  // Rate limiting
  rateLimit: async (key: string, maxRequests: number, windowSeconds: number): Promise<boolean> => {
    const count = await redis.incr(CACHE_KEYS.rateLimit(key));
    if (count === 1) await redis.expire(CACHE_KEYS.rateLimit(key), windowSeconds);
    return count <= maxRequests;
  },
};

// ── DAILY POINT CAP ENFORCEMENT ──────────────────────
// Platform: max 500 pts/day, 2000 pts/week
export async function checkAndIncrementPoints(userId: string, points: number): Promise<{ allowed: boolean; remaining: number }> {
  const dailyKey = CACHE_KEYS.pointsDailyCap(userId);
  const current = parseInt(await redis.get(dailyKey) || "0");
  const MAX_DAILY = 500;
  if (current + points > MAX_DAILY) {
    return { allowed: false, remaining: MAX_DAILY - current };
  }
  await redis.incr(dailyKey);
  await redis.incrby(dailyKey, points - 1); // subtract the initial incr
  await redis.expire(dailyKey, 86400); // 24h TTL
  return { allowed: true, remaining: MAX_DAILY - current - points };
}
