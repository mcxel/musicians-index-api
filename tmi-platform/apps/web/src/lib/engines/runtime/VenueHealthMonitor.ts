/**
 * VenueHealthMonitor
 * Polls live metrics for each room and classifies health status.
 * Feeds real-time health signals to the admin dashboard and glitch sentinel.
 */

import { getRegisteredRoomCount, getAverageRtt, getWorstCaseRtt } from './LatencyCompensator';
import { getSubscriberCount, getSubscribedRooms } from './EventPulseDistributor';
import { getHeartbeatStats } from './GlobalEventSyncHeartbeat';

export type RoomHealth = 'healthy' | 'degraded' | 'critical' | 'offline';

export interface RoomHealthReport {
  roomId: string;
  health: RoomHealth;
  subscriberCount: number;
  lastPulseAgeMs: number;
  rttMs: number;
  issues: string[];
  checkedAt: number;
}

export interface PlatformHealthSummary {
  overallHealth: RoomHealth;
  totalRooms: number;
  healthyRooms: number;
  degradedRooms: number;
  criticalRooms: number;
  offlineRooms: number;
  avgRttMs: number;
  worstRttMs: number;
  heartbeatStatus: string;
  checkedAt: number;
}

const roomReports = new Map<string, RoomHealthReport>();
let pollHandle: ReturnType<typeof setInterval> | null = null;
type HealthListener = (summary: PlatformHealthSummary) => void;
const listeners = new Set<HealthListener>();

const THRESHOLDS = {
  degradedRttMs: 200,
  criticalRttMs: 500,
  degradedPulseGapMs: 3_000,
  criticalPulseGapMs: 8_000,
};

function classifyRoom(rttMs: number, lastPulseAgeMs: number): { health: RoomHealth; issues: string[] } {
  const issues: string[] = [];

  if (rttMs > THRESHOLDS.criticalRttMs) issues.push(`RTT ${rttMs}ms critical`);
  else if (rttMs > THRESHOLDS.degradedRttMs) issues.push(`RTT ${rttMs}ms elevated`);

  if (lastPulseAgeMs > THRESHOLDS.criticalPulseGapMs) issues.push('Pulse gap critical');
  else if (lastPulseAgeMs > THRESHOLDS.degradedPulseGapMs) issues.push('Pulse gap elevated');

  const health: RoomHealth =
    issues.some((i) => i.includes('critical'))
      ? 'critical'
      : issues.length > 0
      ? 'degraded'
      : 'healthy';

  return { health, issues };
}

function buildPlatformSummary(): PlatformHealthSummary {
  const reports = [...roomReports.values()];
  const stats = getHeartbeatStats();

  const counts = { healthy: 0, degraded: 0, critical: 0, offline: 0 };
  for (const r of reports) counts[r.health]++;

  const overallHealth: RoomHealth =
    counts.critical > 0 ? 'critical'
    : counts.degraded > 0 ? 'degraded'
    : reports.length === 0 ? 'offline'
    : 'healthy';

  return {
    overallHealth,
    totalRooms: reports.length,
    healthyRooms: counts.healthy,
    degradedRooms: counts.degraded,
    criticalRooms: counts.critical,
    offlineRooms: counts.offline,
    avgRttMs: getAverageRtt(),
    worstRttMs: getWorstCaseRtt(),
    heartbeatStatus: stats.status,
    checkedAt: Date.now(),
  };
}

function poll(): void {
  const rooms = getSubscribedRooms();
  const avgRtt = getAverageRtt();
  const stats = getHeartbeatStats();
  const lastPulseAgeMs = stats.lastPulseAt ? Date.now() - stats.lastPulseAt : 0;

  for (const roomId of rooms) {
    const { health, issues } = classifyRoom(avgRtt, lastPulseAgeMs);
    roomReports.set(roomId, {
      roomId, health, issues,
      subscriberCount: getSubscriberCount(),
      lastPulseAgeMs,
      rttMs: avgRtt,
      checkedAt: Date.now(),
    });
  }

  // Remove stale rooms (not in subscriber list)
  for (const roomId of roomReports.keys()) {
    if (!rooms.includes(roomId)) roomReports.delete(roomId);
  }

  const summary = buildPlatformSummary();
  for (const l of listeners) {
    try { l(summary); } catch { /* ignore listener errors */ }
  }
}

export function startHealthMonitor(intervalMs = 5_000): void {
  if (pollHandle) return;
  pollHandle = setInterval(poll, intervalMs);
}

export function stopHealthMonitor(): void {
  if (pollHandle) clearInterval(pollHandle);
  pollHandle = null;
}

export function getPlatformHealth(): PlatformHealthSummary {
  return buildPlatformSummary();
}

export function getRoomReport(roomId: string): RoomHealthReport | undefined {
  return roomReports.get(roomId);
}

export function getAllRoomReports(): RoomHealthReport[] {
  return [...roomReports.values()];
}

export function onHealthUpdate(listener: HealthListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getMonitorStatus(): { active: boolean; roomsTracked: number } {
  return { active: pollHandle !== null, roomsTracked: roomReports.size };
}
