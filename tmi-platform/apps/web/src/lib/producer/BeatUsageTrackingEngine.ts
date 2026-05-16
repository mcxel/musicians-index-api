export type UsageContext = "song-battle" | "live-room" | "video" | "event" | "demo" | "ad-placement";

export interface BeatUsageEvent {
  usageId: string;
  beatId: string;
  producerId: string;
  licenseeId: string;
  context: UsageContext;
  sessionId?: string;
  durationSec: number;
  timestamp: string;
  royaltyTriggered: boolean;
  royaltyAmount: number;
}

const usageLog: BeatUsageEvent[] = [];
const beatIndex = new Map<string, string[]>();

function gen(): string {
  return `bu_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

const ROYALTY_RATES: Record<UsageContext, number> = {
  "song-battle":   0.05,
  "live-room":     0.02,
  "video":         0.08,
  "event":         0.10,
  "demo":          0.00,
  "ad-placement":  0.15,
};

export function trackBeatUsage(
  beatId: string,
  producerId: string,
  licenseeId: string,
  context: UsageContext,
  durationSec: number,
  sessionId?: string,
): BeatUsageEvent {
  const royaltyRate = ROYALTY_RATES[context];
  const royaltyAmount = Math.round(durationSec * royaltyRate * 100) / 100;
  const event: BeatUsageEvent = {
    usageId: gen(),
    beatId,
    producerId,
    licenseeId,
    context,
    sessionId,
    durationSec,
    timestamp: new Date().toISOString(),
    royaltyTriggered: royaltyAmount > 0,
    royaltyAmount,
  };
  usageLog.unshift(event);
  const list = beatIndex.get(beatId) ?? [];
  list.unshift(event.usageId);
  beatIndex.set(beatId, list.slice(0, 500));
  return event;
}

export function getBeatUsage(beatId: string): BeatUsageEvent[] {
  const ids = beatIndex.get(beatId) ?? [];
  return ids.map((id) => usageLog.find((e) => e.usageId === id)!).filter(Boolean);
}

export function getTotalRoyaltiesEarned(producerId: string): number {
  return usageLog.filter((e) => e.producerId === producerId && e.royaltyTriggered).reduce((s, e) => s + e.royaltyAmount, 0);
}

export function getUsageCountByContext(beatId: string): Partial<Record<UsageContext, number>> {
  const events = getBeatUsage(beatId);
  const counts: Partial<Record<UsageContext, number>> = {};
  for (const e of events) { counts[e.context] = (counts[e.context] ?? 0) + 1; }
  return counts;
}

export function getMostUsedBeats(producerId: string, limit = 5): Array<{ beatId: string; usageCount: number }> {
  const counts = new Map<string, number>();
  for (const e of usageLog) {
    if (e.producerId === producerId) counts.set(e.beatId, (counts.get(e.beatId) ?? 0) + 1);
  }
  return [...counts.entries()].sort(([, a], [, b]) => b - a).slice(0, limit).map(([beatId, usageCount]) => ({ beatId, usageCount }));
}
