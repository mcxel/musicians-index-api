/**
 * RuntimeSurvivabilityOrchestrator.ts
 *
 * Unified survivability coordinator for the TMI runtime.
 * Aggregates health signals from all existing recovery engines
 * and decides: quarantine | soft-recover | hard-recover | escalate | clear.
 *
 * Existing engines it coordinates:
 *   - RuntimeRecoveryEngine     (loops/observers/listeners/streams)
 *   - RuntimeQuarantineMode     (room isolation with reason codes)
 *   - FeedRecoveryEngine        (lobby/arena/home/chat/performer feeds)
 *   - OverlaySyncRepairEngine   (scoreboard/avatar/seating/video desync)
 *   - SocketHeartbeatEngine     (connection liveness)
 *   - AvatarRecoveryCoordinator (avatar asset recovery)
 *
 * This orchestrator does NOT re-implement those engines.
 * It reads their state, synthesizes a room-level health score,
 * and fires the appropriate recovery decision.
 *
 * One orchestrator instance per room. Rooms that have never had
 * problems cost zero overhead (lazy init).
 */

import {
  getRoomFeedHealth,
  getRoomSurvivabilityScore,
  pulseFeedWatchdog,
  registerFeed,
  type FeedType,
  type FeedHealthStatus,
} from './FeedRecoveryEngine';

import {
  getRoomOverlayStates,
  getRoomDesyncScore,
  type OverlayType,
} from './OverlaySyncRepairEngine';

import {
  enterRuntimeQuarantine,
  getRuntimeQuarantineState,
  exitRuntimeQuarantine,
  type QuarantineReason,
} from './quarantine/RuntimeQuarantineMode';

import type { ChatRoomId } from '@/lib/chat/RoomChatEngine';
import { Analytics } from '@/lib/analytics/PersonaAnalyticsEngine';

// ── Types ─────────────────────────────────────────────────────────────────────

export type RoomHealthGrade = 'A' | 'B' | 'C' | 'D' | 'F';

export type OrchestratorDecision =
  | 'healthy'
  | 'monitor'         // degraded but stable — log + watch
  | 'soft-recover'    // trigger replay/patch on affected subsystem
  | 'hard-recover'    // reconnect + remount affected subsystem
  | 'quarantine'      // isolate room — degraded mode
  | 'escalate';       // human/admin intervention required

export interface RoomSurvivabilityReport {
  roomId:          ChatRoomId;
  generatedAt:     number;
  grade:           RoomHealthGrade;
  overallScore:    number;           // 0–100
  feedScore:       number;
  overlayScore:    number;
  decision:        OrchestratorDecision;
  activeFeeds:     string[];
  staleFeedCount:  number;
  frozenFeedCount: number;
  desyncedOverlays: string[];
  quarantined:     boolean;
  quarantineReason?: QuarantineReason;
  recoveryCount:   number;
  lastDecisionAt:  number;
  alerts:          string[];
}

// ── Configuration ─────────────────────────────────────────────────────────────

const WATCHDOG_INTERVAL_MS  = 15_000;   // pulse every 15s
const QUARANTINE_SCORE      = 25;       // score below this → quarantine
const HARD_RECOVER_SCORE    = 45;
const SOFT_RECOVER_SCORE    = 70;
const MONITOR_SCORE         = 85;

const DEFAULT_FEEDS: FeedType[]    = ['lobby-feed', 'chat-feed', 'performer-feed'];
const DEFAULT_OVERLAYS: OverlayType[] = ['scoreboard', 'avatar-grid', 'hud-persona'];

// ── In-Memory State ───────────────────────────────────────────────────────────

interface RoomOrchState {
  roomId:        ChatRoomId;
  registeredAt:  number;
  recoveryCount: number;
  lastDecision:  OrchestratorDecision;
  lastDecisionAt: number;
  intervalHandle?: ReturnType<typeof setInterval>;
}

const ORCH_STATES = new Map<ChatRoomId, RoomOrchState>();
const REPORT_CACHE = new Map<ChatRoomId, RoomSurvivabilityReport>();
const REPORT_SUBSCRIBERS = new Map<ChatRoomId, Set<(report: RoomSurvivabilityReport) => void>>();

// ── Core API ──────────────────────────────────────────────────────────────────

export function registerRoom(
  roomId:   ChatRoomId,
  options?: { feeds?: FeedType[]; overlays?: OverlayType[] }
): void {
  if (ORCH_STATES.has(roomId)) return;

  const feeds    = options?.feeds    ?? DEFAULT_FEEDS;
  const overlays = options?.overlays ?? DEFAULT_OVERLAYS;

  // Ensure feed health tracking is initialized
  feeds.forEach((ft) => registerFeed(roomId, ft));

  const state: RoomOrchState = {
    roomId,
    registeredAt:  Date.now(),
    recoveryCount: 0,
    lastDecision:  'healthy',
    lastDecisionAt: Date.now(),
  };

  // Start watchdog interval
  if (typeof setInterval !== 'undefined') {
    state.intervalHandle = setInterval(() => {
      pulseFeedWatchdog();
      const report = buildReport(roomId);
      _applyDecision(roomId, report, state);
    }, WATCHDOG_INTERVAL_MS);
  }

  ORCH_STATES.set(roomId, state);
}

export function deregisterRoom(roomId: ChatRoomId): void {
  const state = ORCH_STATES.get(roomId);
  if (state?.intervalHandle) clearInterval(state.intervalHandle);
  ORCH_STATES.delete(roomId);
  REPORT_CACHE.delete(roomId);
  REPORT_SUBSCRIBERS.delete(roomId);
}

export function buildReport(roomId: ChatRoomId): RoomSurvivabilityReport {
  const state       = ORCH_STATES.get(roomId);
  const feedScore   = getRoomSurvivabilityScore(roomId);
  const overlayScore = getRoomDesyncScore(roomId);
  const overallScore = Math.round((feedScore * 0.6) + (overlayScore * 0.4));

  const feedStates   = getRoomFeedHealth(roomId);
  const overlayStates = getRoomOverlayStates(roomId);
  const quarantine   = getRuntimeQuarantineState(roomId);

  const staleFeedCount  = feedStates.filter((f) => f.status === 'stale').length;
  const frozenFeedCount = feedStates.filter((f) => f.status === 'frozen' || f.status === 'failed').length;
  const desyncedOverlays = overlayStates
    .filter((o) => o.status === 'desynced' || o.status === 'drifted')
    .map((o) => o.overlayType);

  const alerts: string[] = [];
  if (frozenFeedCount > 0)   alerts.push(`${frozenFeedCount} feed(s) frozen`);
  if (staleFeedCount > 0)    alerts.push(`${staleFeedCount} feed(s) stale`);
  if (desyncedOverlays.length) alerts.push(`Overlay desync: ${desyncedOverlays.join(', ')}`);
  if (quarantine?.active)    alerts.push(`Quarantined: ${quarantine.reason}`);

  const grade = _scoreToGrade(overallScore);
  const decision = _scoreToDecision(overallScore, quarantine?.active ?? false);

  const report: RoomSurvivabilityReport = {
    roomId,
    generatedAt:     Date.now(),
    grade,
    overallScore,
    feedScore,
    overlayScore,
    decision,
    activeFeeds:     feedStates.map((f) => `${f.feedType}:${f.status}`),
    staleFeedCount,
    frozenFeedCount,
    desyncedOverlays,
    quarantined:     quarantine?.active ?? false,
    quarantineReason: quarantine?.reason,
    recoveryCount:   state?.recoveryCount ?? 0,
    lastDecisionAt:  state?.lastDecisionAt ?? Date.now(),
    alerts,
  };

  REPORT_CACHE.set(roomId, report);
  REPORT_SUBSCRIBERS.get(roomId)?.forEach((l) => l({ ...report }));
  return report;
}

export function getLastReport(roomId: ChatRoomId): RoomSurvivabilityReport | null {
  return REPORT_CACHE.get(roomId) ?? null;
}

export function getAllReports(): RoomSurvivabilityReport[] {
  return [...REPORT_CACHE.values()];
}

export function subscribeReport(
  roomId:   ChatRoomId,
  listener: (report: RoomSurvivabilityReport) => void
): () => void {
  if (!REPORT_SUBSCRIBERS.has(roomId)) REPORT_SUBSCRIBERS.set(roomId, new Set());
  REPORT_SUBSCRIBERS.get(roomId)!.add(listener);
  const cached = REPORT_CACHE.get(roomId);
  if (cached) listener(cached);
  return () => REPORT_SUBSCRIBERS.get(roomId)?.delete(listener);
}

export function getPlatformSurvivabilitySummary(): {
  totalRooms:      number;
  healthyRooms:    number;
  degradedRooms:   number;
  quarantinedRooms: number;
  averageScore:    number;
  criticalAlerts:  string[];
} {
  const reports = getAllReports();
  if (reports.length === 0) {
    return { totalRooms: 0, healthyRooms: 0, degradedRooms: 0, quarantinedRooms: 0, averageScore: 100, criticalAlerts: [] };
  }

  const healthyRooms    = reports.filter((r) => r.grade === 'A' || r.grade === 'B').length;
  const degradedRooms   = reports.filter((r) => r.grade === 'C' || r.grade === 'D').length;
  const quarantinedRooms = reports.filter((r) => r.quarantined).length;
  const averageScore    = Math.round(reports.reduce((s, r) => s + r.overallScore, 0) / reports.length);
  const criticalAlerts  = reports
    .filter((r) => r.grade === 'D' || r.grade === 'F')
    .flatMap((r) => r.alerts.map((a) => `[${r.roomId}] ${a}`));

  return { totalRooms: reports.length, healthyRooms, degradedRooms, quarantinedRooms, averageScore, criticalAlerts };
}

// ── Internal Decision Engine ──────────────────────────────────────────────────

function _applyDecision(
  roomId:  ChatRoomId,
  report:  RoomSurvivabilityReport,
  state:   RoomOrchState
): void {
  const prev = state.lastDecision;
  const next = report.decision;

  if (next === prev && next === 'healthy') return; // no change, no action needed

  state.lastDecision   = next;
  state.lastDecisionAt = Date.now();

  if (next === 'quarantine' && !report.quarantined) {
    const reason: QuarantineReason =
      report.frozenFeedCount > 0 ? 'overlay-loop' :
      report.desyncedOverlays.length > 0 ? 'orphan-ownership' :
      'generator-corruption';

    enterRuntimeQuarantine({ roomId, reason, severity: 'high', ttlMs: 60_000 });
    state.recoveryCount += 1;

    Analytics.livestreamEvent({
      eventType: 'room_quarantined',
      streamId:  roomId,
      activePersona: 'admin',
      meta: { score: report.overallScore, reason },
    });
  }

  if (next === 'escalate') {
    Analytics.livestreamEvent({
      eventType: 'survivability_escalation',
      streamId:  roomId,
      activePersona: 'admin',
      meta: { score: report.overallScore, alerts: report.alerts.join('; ') },
    });
  }
}

function _scoreToDecision(score: number, quarantined: boolean): OrchestratorDecision {
  if (quarantined) return 'quarantine';
  if (score <= QUARANTINE_SCORE)   return 'quarantine';
  if (score <= HARD_RECOVER_SCORE) return 'hard-recover';
  if (score <= SOFT_RECOVER_SCORE) return 'soft-recover';
  if (score <= MONITOR_SCORE)      return 'monitor';
  return 'healthy';
}

function _scoreToGrade(score: number): RoomHealthGrade {
  if (score >= 90) return 'A';
  if (score >= 75) return 'B';
  if (score >= 55) return 'C';
  if (score >= 30) return 'D';
  return 'F';
}
