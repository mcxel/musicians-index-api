// lib/mail/MailRateLimiter.ts — Anti-spam: max 3 engagement/hr, max 8 marketing/week, 30min dedup

interface WindowEntry {
  userId: string;
  category: string;
  sentAt: number;
}

interface DedupEntry {
  key: string;
  sentAt: number;
}

const windowLog: WindowEntry[] = [];
const dedupLog: DedupEntry[] = [];

const LIMITS: Record<string, { maxPerWindow: number; windowMs: number }> = {
  engagement: { maxPerWindow: 3, windowMs: 60 * 60 * 1000 },        // 3/hr
  growth:     { maxPerWindow: 8, windowMs: 7 * 24 * 60 * 60 * 1000 }, // 8/week
  revenue:    { maxPerWindow: 20, windowMs: 24 * 60 * 60 * 1000 },   // 20/day (payouts can be frequent)
  system:     { maxPerWindow: 100, windowMs: 24 * 60 * 60 * 1000 },  // effectively unlimited
};

const DEDUP_WINDOW_MS = 30 * 60 * 1000; // 30 minutes

function prune(): void {
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const pruneIdx = windowLog.findIndex(e => e.sentAt > cutoff);
  if (pruneIdx > 0) windowLog.splice(0, pruneIdx);

  const dedupCutoff = Date.now() - DEDUP_WINDOW_MS;
  const dedupIdx = dedupLog.findIndex(e => e.sentAt > dedupCutoff);
  if (dedupIdx > 0) dedupLog.splice(0, dedupIdx);
}

export function checkRateLimit(userId: string, category: string): { allowed: boolean; reason?: string } {
  prune();
  const rule = LIMITS[category] ?? LIMITS.system;
  const now = Date.now();
  const windowStart = now - rule.windowMs;
  const recentCount = windowLog.filter(
    e => e.userId === userId && e.category === category && e.sentAt > windowStart
  ).length;

  if (recentCount >= rule.maxPerWindow) {
    return {
      allowed: false,
      reason: `Rate limit: ${recentCount}/${rule.maxPerWindow} ${category} emails in window`,
    };
  }

  return { allowed: true };
}

export function checkDedup(dedupKey: string): { allowed: boolean } {
  prune();
  const cutoff = Date.now() - DEDUP_WINDOW_MS;
  const duplicate = dedupLog.find(e => e.key === dedupKey && e.sentAt > cutoff);
  return { allowed: !duplicate };
}

export function recordSent(userId: string, category: string, dedupKey?: string): void {
  const now = Date.now();
  windowLog.push({ userId, category, sentAt: now });
  if (dedupKey) dedupLog.push({ key: dedupKey, sentAt: now });
}

export function getRateLimitStats(userId: string): Record<string, { sent: number; limit: number; windowLabel: string }> {
  prune();
  const now = Date.now();
  return Object.fromEntries(
    Object.entries(LIMITS).map(([cat, rule]) => {
      const sent = windowLog.filter(
        e => e.userId === userId && e.category === cat && e.sentAt > now - rule.windowMs
      ).length;
      const windowLabel = rule.windowMs < 2 * 60 * 60 * 1000 ? "hour" :
                          rule.windowMs < 2 * 24 * 60 * 60 * 1000 ? "day" : "week";
      return [cat, { sent, limit: rule.maxPerWindow, windowLabel }];
    })
  );
}
