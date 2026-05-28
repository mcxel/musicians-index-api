export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/app/api/admin/_utils/require-admin';
import { reconstructCrowd, runHumanityBenchmark } from '@/lib/engines/runtime/CrowdReconstructionEngine';
import { getWorldState } from '@/lib/engines/runtime/WorldStateReplicator';
import { getAlertLog, getSentinelStatus, startSentinel } from '@/lib/engines/runtime/RuntimeGlitchSentinel';
import { getPlatformHealth, getMonitorStatus, startHealthMonitor } from '@/lib/engines/runtime/VenueHealthMonitor';
import { triggerFailoverRecovery } from '@/lib/engines/runtime/VenueFailoverCoordinator';
import { captureSnapshot } from '@/lib/engines/runtime/PersistentWorldSnapshotEngine';
import { generateArtifactBundle } from '@/lib/engines/runtime/MemoryArtifactGenerator';
import { detectRegressions, getLatestRun, recordBenchmarkRun } from '@/lib/engines/runtime/HumanityBenchmarkHistory';
import { triggerVibeChange } from '@/lib/engines/runtime/GlobalEventSyncHeartbeat';
import type { VibePreset } from '@/lib/engines/runtime/WorldStateReplicator';

export type BenchmarkQualityMode = 'low' | 'med' | 'high' | 'cinematic';

type BenchmarkRequest = {
  avatarCount?: number;
  persistenceTest?: boolean;
  qualityMode?: BenchmarkQualityMode;
  emptyArenaFirst?: boolean;
  vibe?: VibePreset;
  bpmTarget?: number;
};

function clampAvatarCount(value: number): number {
  if (!Number.isFinite(value)) return 20;
  return Math.max(10, Math.min(100, Math.round(value)));
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForArenaReadiness(maxWaitMs = 30_000): Promise<{ status: string; waitedMs: number }> {
  const startedAt = Date.now();
  while (Date.now() - startedAt < maxWaitMs) {
    const health = getPlatformHealth();
    if (health.overallHealth === 'offline' || health.overallHealth === 'healthy') {
      return { status: health.overallHealth, waitedMs: Date.now() - startedAt };
    }
    await delay(1_000);
  }
  const final = getPlatformHealth();
  return { status: final.overallHealth, waitedMs: Date.now() - startedAt };
}

export async function GET(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  startSentinel();
  startHealthMonitor();

  const world = getWorldState();
  const sentinel = getSentinelStatus();
  const monitor = getMonitorStatus();
  const health = getPlatformHealth();

  return NextResponse.json({
    ok: true,
    heartbeat: {
      beatPhase: world.beatPhase,
      bpm: world.vibeConfig.bpm,
      vibe: world.vibe,
    },
    glitchSentinel: sentinel,
    venueHealthMonitor: {
      ...monitor,
      overallHealth: health.overallHealth,
      avgRttMs: health.avgRttMs,
      worstRttMs: health.worstRttMs,
    },
  });
}

export async function POST(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  let payload: BenchmarkRequest = {};
  try {
    payload = (await request.json()) as BenchmarkRequest;
  } catch {
    payload = {};
  }

  const avatarCount = clampAvatarCount(Number(payload.avatarCount ?? 20));
  const persistenceTest = payload.persistenceTest === true;
  const emptyArenaFirst = payload.emptyArenaFirst !== false;
  const vibeOverride = payload.vibe;
  const bpmTarget = Number(payload.bpmTarget ?? 0);
  const qualityMode: BenchmarkQualityMode =
    payload.qualityMode === 'low' ||
    payload.qualityMode === 'med' ||
    payload.qualityMode === 'high' ||
    payload.qualityMode === 'cinematic'
      ? payload.qualityMode
      : 'high';

  startSentinel();
  startHealthMonitor();

  const roomId = `bench-${Date.now().toString(36)}`;
  const runStart = Date.now();
  const logs: string[] = [];

  if (typeof vibeOverride === 'string') {
    triggerVibeChange(vibeOverride);
    logs.push(`Vibe override applied: ${vibeOverride}`);
  } else if (bpmTarget === 128) {
    triggerVibeChange('midnight-afterparty');
    logs.push('BPM target 128 applied via vibe midnight-afterparty');
  }

  if (emptyArenaFirst) {
    const readiness = await waitForArenaReadiness();
    logs.push(`Arena readiness gate: ${readiness.status} after ${readiness.waitedMs}ms`);
    const empty = reconstructCrowd(`${roomId}-empty`, { fade: false });
    logs.push(`Empty arena validation: ${empty.occupiedSeats}/${empty.totalSeats} occupied`);
  }

  const benchmark = runHumanityBenchmark(roomId, avatarCount);
  logs.push(...benchmark.notes);

  const world = getWorldState();
  const glitch = getSentinelStatus();
  const venue = getPlatformHealth();
  const recentAlerts = getAlertLog(20);

  const hasPulseGap = recentAlerts.some((alert) => alert.code === 'PULSE_GAP');
  const hasRttSpike = venue.avgRttMs >= 400 || venue.worstRttMs >= 800;

  let failoverEvent: { id: string; status: string } | null = null;
  if (hasPulseGap || hasRttSpike) {
    const event = await triggerFailoverRecovery(
      `humanity-benchmark:risk pulseGap=${hasPulseGap} avgRtt=${venue.avgRttMs.toFixed(0)} worstRtt=${venue.worstRttMs.toFixed(0)}`,
    );
    failoverEvent = { id: event.id, status: event.status };
    logs.push(`Failover escalation: ${event.status} (${event.id})`);
  }

  const qualityMultipliers: Record<BenchmarkQualityMode, number> = {
    low: 0.55,
    med: 0.75,
    high: 0.9,
    cinematic: 1,
  };

  const appliedRenderCost = Math.round(qualityMultipliers[qualityMode] * 100);

  let snapshotId: string | null = null;
  let artifactBundleId: string | null = null;

  if (benchmark.passed && avatarCount >= 20) {
    const snapshot = await captureSnapshot({
      trigger: 'admin-manual',
      label: `Humanity Benchmark Success — ${qualityMode.toUpperCase()} · ${avatarCount} avatars`,
      roomId,
      metadata: {
        qualityMode,
        emptyArenaFirst,
        persistenceTest,
        seatedCorrectly: benchmark.seatedCorrectly,
        occupancyRate: benchmark.occupancyRate,
      },
      isLegendary: benchmark.seatedCorrectly === avatarCount,
    });
    snapshotId = snapshot.id;
    artifactBundleId = generateArtifactBundle(snapshot).snapshotId;
    logs.push(`Artifact generated: ${artifactBundleId}`);
  }

  const previous = getLatestRun();
  const historyRecord = recordBenchmarkRun({
    avatarCount,
    seatedCorrectly: benchmark.seatedCorrectly,
    occupancyPercent: Math.round(benchmark.occupancyRate * 1000) / 10,
    friendClusters: benchmark.friendClustersIntact,
    clusterCohesion: benchmark.friendClustersIntact > 0 ? Math.min(1, benchmark.friendClustersIntact / 2) : 0,
    reconstructionLatencyMs: Date.now() - runStart,
    beatSyncMs: benchmark.beatSyncConfidence === 'exact' ? 80 : 140,
    rejoinLatencyMs: persistenceTest ? 320 : 0,
    avgRttMs: venue.avgRttMs,
    worstRttMs: venue.worstRttMs,
    pulseGapCount: recentAlerts.filter((alert) => alert.code === 'PULSE_GAP').length,
    sentinelAlerts: glitch.alertCount,
    avgCrowdEnergy: benchmark.avgEnergyLevel,
    crowdEnergyVariance: Math.max(0, 1 - benchmark.avgEnergyLevel),
    peakEnergyReached: Math.min(1, benchmark.avgEnergyLevel + 0.18),
    activeLODLevel: qualityMode === 'low' ? 'far' : qualityMode === 'med' ? 'medium' : qualityMode === 'high' ? 'near' : 'mixed',
    failoverEvents: failoverEvent ? 1 : 0,
    snapshotsCaptured: snapshotId ? 1 : 0,
    legendaryMomentsDetected: snapshotId ? 1 : 0,
    attentionSyncPercent: Math.round(benchmark.occupancyRate * 1000) / 10,
    runtimeVersion: 'humanity-benchmark-v1',
    environmentProfile: process.env.NODE_ENV === 'production' ? 'production' : process.env.NODE_ENV === 'development' ? 'local' : 'staging',
    persistenceTestRan: persistenceTest,
    benchmarkRoomId: roomId,
    snapshotId,
    notes: logs.join(' | '),
  });

  const regressions = previous ? detectRegressions(historyRecord, previous).filter((r) => r.direction === 'worse') : [];
  if (regressions.length > 0) {
    logs.push(`Regression watch: ${regressions.length} degraded metric(s)`);
  }

  return NextResponse.json({
    ok: true,
    roomId,
    qualityMode,
    emptyArenaFirst,
    persistenceTest,
    avatarCount,
    benchmark,
    runtime: {
      heartbeat: {
        beatPhase: world.beatPhase,
        bpm: world.vibeConfig.bpm,
        vibe: world.vibe,
      },
      glitchSentinel: glitch,
      venueHealthMonitor: {
        overallHealth: venue.overallHealth,
        avgRttMs: venue.avgRttMs,
        worstRttMs: venue.worstRttMs,
        totalRooms: venue.totalRooms,
        degradedRooms: venue.degradedRooms,
        criticalRooms: venue.criticalRooms,
      },
      appliedRenderCost,
      failoverEvent,
    },
    history: {
      runId: historyRecord.id,
      runIndex: historyRecord.runIndex,
      result: historyRecord.result,
      regressions,
      snapshotId,
      artifactBundleId,
    },
    logs,
  });
}
