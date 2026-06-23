/**
 * AnalyticsEngine
 * Consolidated stats source for all UI surfaces.
 * Computes analytics from real data, never hardcoded.
 */

import { getActiveSessions, type LiveSession } from "@/lib/broadcast/GlobalLiveSessionRegistry";

export interface PlatformStats {
  totalLiveRooms: number;
  totalViewers: number;
  totalTips: number;
  avgViewersPerRoom: number;
  topPerformers: LiveSession[];
  topCategories: { category: string; count: number }[];
  audienceByRegion: { region: string; count: number }[];
}

export interface SessionStats {
  roomId: string;
  viewerCount: number;
  tipTotal: number;
  streamHealth: string;
  bitrateKbps: number;
  droppedFramesPct: number;
  rttMs: number;
}

// ── Real-time platform stats ──────────────────────────────────────────────────

export function getPlatformStats(): PlatformStats {
  const sessions = getActiveSessions();

  const totalLiveRooms = sessions.length;
  const totalViewers = sessions.reduce((sum, s) => sum + s.viewerCount, 0);
  const totalTips = sessions.reduce((sum, s) => sum + s.tipTotal, 0);
  const avgViewersPerRoom = totalLiveRooms > 0 ? Math.round(totalViewers / totalLiveRooms) : 0;

  // Top performers by viewers
  const topPerformers = [...sessions]
    .sort((a, b) => b.viewerCount - a.viewerCount)
    .slice(0, 5);

  // Category breakdown
  const categoryMap = new Map<string, number>();
  sessions.forEach((s) => {
    categoryMap.set(s.category, (categoryMap.get(s.category) ?? 0) + 1);
  });
  const topCategories = Array.from(categoryMap.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  // Audience by region
  const regionMap = new Map<string, number>();
  sessions.forEach((s) => {
    s.audienceCountries.forEach((country) => {
      regionMap.set(country.countryCode, (regionMap.get(country.countryCode) ?? 0) + country.count);
    });
  });
  const audienceByRegion = Array.from(regionMap.entries())
    .map(([region, count]) => ({ region, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalLiveRooms,
    totalViewers,
    totalTips,
    avgViewersPerRoom,
    topPerformers,
    topCategories,
    audienceByRegion,
  };
}

// ── Per-session stats ─────────────────────────────────────────────────────────

export function getSessionStats(session: LiveSession): SessionStats {
  return {
    roomId: session.roomId,
    viewerCount: session.viewerCount,
    tipTotal: session.tipTotal,
    streamHealth: session.streamHealth,
    bitrateKbps: session.bitrateKbps,
    droppedFramesPct: session.droppedFramesPct,
    rttMs: session.rttMs,
  };
}

// ── Aggregated health metrics ─────────────────────────────────────────────────

export interface HealthMetrics {
  excellentCount: number;
  goodCount: number;
  degradedCount: number;
  criticalCount: number;
  unknownCount: number;
  averageBitrateKbps: number;
  averageDroppedFramesPct: number;
  averageRttMs: number;
}

export function getHealthMetrics(): HealthMetrics {
  const sessions = getActiveSessions();

  const healthCounts = {
    excellent: 0,
    good: 0,
    degraded: 0,
    critical: 0,
    unknown: 0,
  };

  let totalBitrate = 0;
  let totalDropped = 0;
  let totalRtt = 0;
  let validCount = 0;

  sessions.forEach((s) => {
    healthCounts[s.streamHealth]++;
    if (s.bitrateKbps > 0) {
      totalBitrate += s.bitrateKbps;
      validCount++;
    }
    totalDropped += s.droppedFramesPct;
    totalRtt += s.rttMs;
  });

  return {
    excellentCount: healthCounts.excellent,
    goodCount: healthCounts.good,
    degradedCount: healthCounts.degraded,
    criticalCount: healthCounts.critical,
    unknownCount: healthCounts.unknown,
    averageBitrateKbps: validCount > 0 ? Math.round(totalBitrate / validCount) : 0,
    averageDroppedFramesPct:
      sessions.length > 0 ? Math.round((totalDropped / sessions.length) * 100) / 100 : 0,
    averageRttMs: sessions.length > 0 ? Math.round(totalRtt / sessions.length) : 0,
  };
}

// ── Revenue snapshot (tips only; real payment data comes from Stripe) ────────

export interface RevenueSnapshot {
  tipsToday: number;
  tipsBySession: { performerName: string; totalTips: number }[];
  topTippers: { performerName: string; totalTips: number }[];
}

export function getRevenueSnapshot(): RevenueSnapshot {
  const sessions = getActiveSessions();
  const tipsToday = sessions.reduce((sum, s) => sum + s.tipTotal, 0);
  const tipsBySession = sessions
    .filter((s) => s.tipTotal > 0)
    .map((s) => ({ performerName: s.displayName, totalTips: s.tipTotal }))
    .sort((a, b) => b.totalTips - a.totalTips);

  return {
    tipsToday,
    tipsBySession,
    topTippers: tipsBySession.slice(0, 5),
  };
}

// ── Never return fake stats; always fall back to zero or empty ────────────────

export function getHonestStat(value: number | undefined): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return 0;
  }
  return value;
}

export function getHonestCount(array: any[] | undefined): number {
  if (!Array.isArray(array)) {
    return 0;
  }
  return array.length;
}
