import type { ChatRoomId } from "@/lib/chat/RoomChatEngine";
import { getRoomPopulation, type RoomPopulationSnapshot } from "@/lib/rooms/RoomPopulationEngine";
import { getIntentSummary, type IntentSummary } from "@/lib/rooms/CrowdIntentEngine";
import { getCrowdMomentum } from "@/lib/live/crowdMomentumEngine";
import { getCameraFocusPlan, type CameraFocusPlan } from "@/lib/live/CameraFocusReactionEngine";
import { getActiveSponsorGifts, type SponsorGift } from "@/lib/commerce/SponsorGiftCommerceEngine";
import { getActivePreviews, type BillboardHoverState } from "@/lib/live/BillboardPreviewHoverEngine";
import { tickRuntimeConductor } from "@/lib/runtime/RuntimeConductorEngine";

// ─── Types ────────────────────────────────────────────────────────────────────

export type RoomAlertSeverity = "info" | "warn" | "critical";

export type RoomAlert = {
  id: string;
  roomId: ChatRoomId;
  severity: RoomAlertSeverity;
  message: string;
  timestampMs: number;
  resolved: boolean;
};

export type ObservatoryRoomView = {
  roomId: ChatRoomId;
  population: RoomPopulationSnapshot;
  intentSummary: IntentSummary;
  cameraFocus: CameraFocusPlan;
  momentumHypeLevel: number;
  runtimeConflictCount: number;
  runtimeBlocked: boolean;
  runtimeRecoveryActions: string[];
  cameraAuthorityGranted: boolean;
  alerts: RoomAlert[];
};

export type ObservatorySnapshot = {
  rooms: ObservatoryRoomView[];
  totalOccupancy: number;
  hottest: ChatRoomId | null;
  systemMessages: SystemMessage[];
  activeGifts: SponsorGift[];
  totalActiveGifts: number;
  activeBillboards: BillboardHoverState[];
  totalRuntimeConflicts: number;
  blockedRuntimeRooms: ChatRoomId[];
  capturedAt: number;
};

export type SystemMessage = {
  id: string;
  text: string;
  targetRoomId?: ChatRoomId;
  authorId: string;
  timestampMs: number;
};

// ─── Internal state ───────────────────────────────────────────────────────────

const ALL_ROOM_IDS: ChatRoomId[] = [
  "monthly-idol",
  "monday-night-stage",
  "deal-or-feud",
  "name-that-tune",
  "circle-squares",
  "cypher-arena",
  "venue-room",
];

const alertRegistry = new Map<ChatRoomId, RoomAlert[]>();
const systemMessages: SystemMessage[] = [];
let _msgCounter = 0;
let _alertCounter = 0;

function getOrInitAlerts(roomId: ChatRoomId): RoomAlert[] {
  if (!alertRegistry.has(roomId)) alertRegistry.set(roomId, []);
  return alertRegistry.get(roomId)!;
}

// ─── Alert auto-generation ────────────────────────────────────────────────────

function evaluateAutoAlerts(roomId: ChatRoomId, pop: RoomPopulationSnapshot): void {
  const alerts = getOrInitAlerts(roomId);
  const now = Date.now();

  if (pop.heatLevel >= 90) {
    const existing = alerts.find(a => !a.resolved && a.message.includes("heat critical"));
    if (!existing) {
      alerts.push({
        id: `alert-${++_alertCounter}`,
        roomId,
        severity: "critical",
        message: `Room heat critical: ${pop.heatLevel}/100 — consider moderation escalation`,
        timestampMs: now,
        resolved: false,
      });
    }
  }

  if (pop.queueDepth >= 20) {
    const existing = alerts.find(a => !a.resolved && a.message.includes("queue depth"));
    if (!existing) {
      alerts.push({
        id: `alert-${++_alertCounter}`,
        roomId,
        severity: "warn",
        message: `Queue depth ${pop.queueDepth} — overflow risk`,
        timestampMs: now,
        resolved: false,
      });
    }
  }

  if (pop.audienceCount > 500) {
    const existing = alerts.find(a => !a.resolved && a.message.includes("high occupancy"));
    if (!existing) {
      alerts.push({
        id: `alert-${++_alertCounter}`,
        roomId,
        severity: "info",
        message: `High occupancy: ${pop.audienceCount} audience members`,
        timestampMs: now,
        resolved: false,
      });
    }
  }

  // Prune resolved alerts older than 10 min
  const cutoff = now - 10 * 60 * 1000;
  const i = alerts.findIndex(a => a.resolved && a.timestampMs < cutoff);
  if (i >= 0) alerts.splice(0, i + 1);
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Build a full view of a single room's state: population, intent summary,
 * camera focus, momentum, and active alerts.
 */
export function observeRoom(roomId: ChatRoomId): ObservatoryRoomView {
  const now = Date.now();
  const population = getRoomPopulation(roomId);
  evaluateAutoAlerts(roomId, population);

  const synchronized = tickRuntimeConductor(roomId);
  const momentum = getCrowdMomentum(roomId);

  return {
    roomId,
    population,
    intentSummary: getIntentSummary(roomId, now),
    cameraFocus: synchronized.camera.plan ?? getCameraFocusPlan(roomId),
    momentumHypeLevel: synchronized.crowdMomentum.current ?? momentum?.current ?? 0,
    runtimeConflictCount: synchronized.authority.conflictCount,
    runtimeBlocked: synchronized.blockedByAuthorityConflict,
    runtimeRecoveryActions: synchronized.recovery.actions,
    cameraAuthorityGranted: synchronized.camera.authorityGranted,
    alerts: getOrInitAlerts(roomId).filter(a => !a.resolved),
  };
}

/**
 * Snapshot all known rooms in one pass. Sorted hottest-first by heat level.
 */
export function getObservatorySnapshot(): ObservatorySnapshot {
  const now = Date.now();
  const rooms = ALL_ROOM_IDS.map(id => observeRoom(id));

  rooms.sort((a, b) => b.population.heatLevel - a.population.heatLevel);

  const totalOccupancy = rooms.reduce((sum, r) => {
    const p = r.population;
    return sum + p.audienceCount + p.performerCount + p.hostCount + p.sponsorCount;
  }, 0);

  const hottest = rooms[0]?.population.heatLevel > 0 ? rooms[0].roomId : null;

  const activeGifts = getActiveSponsorGifts();
  const activeBillboards = getActivePreviews();
  const totalRuntimeConflicts = rooms.reduce((sum, room) => sum + room.runtimeConflictCount, 0);
  const blockedRuntimeRooms = rooms.filter((room) => room.runtimeBlocked).map((room) => room.roomId);

  return {
    rooms,
    totalOccupancy,
    hottest,
    systemMessages: [...systemMessages].slice(-50),
    activeGifts,
    totalActiveGifts: activeGifts.length,
    activeBillboards,
    totalRuntimeConflicts,
    blockedRuntimeRooms,
    capturedAt: now,
  };
}

/**
 * Broadcast a system-level message to one or all rooms.
 * Visible in the admin observatory chat feed.
 */
export function broadcastSystemMessage(
  text: string,
  authorId: string,
  targetRoomId?: ChatRoomId,
): SystemMessage {
  const msg: SystemMessage = {
    id: `sysmsg-${++_msgCounter}`,
    text,
    targetRoomId,
    authorId,
    timestampMs: Date.now(),
  };
  systemMessages.push(msg);
  // Keep last 200 messages
  if (systemMessages.length > 200) systemMessages.splice(0, systemMessages.length - 200);
  return msg;
}

/**
 * Manually flag a room with a custom alert.
 */
export function flagRoomAlert(
  roomId: ChatRoomId,
  message: string,
  severity: RoomAlertSeverity = "warn",
): RoomAlert {
  const alert: RoomAlert = {
    id: `alert-${++_alertCounter}`,
    roomId,
    severity,
    message,
    timestampMs: Date.now(),
    resolved: false,
  };
  getOrInitAlerts(roomId).push(alert);
  return alert;
}

/**
 * Resolve an alert by ID.
 */
export function resolveAlert(roomId: ChatRoomId, alertId: string): boolean {
  const alerts = getOrInitAlerts(roomId);
  const alert = alerts.find(a => a.id === alertId);
  if (!alert) return false;
  alert.resolved = true;
  return true;
}

/**
 * Get all active (unresolved) alerts for a room.
 */
export function getRoomAlerts(roomId: ChatRoomId): RoomAlert[] {
  return getOrInitAlerts(roomId).filter(a => !a.resolved);
}

/**
 * Get all active alerts across all rooms, sorted by severity then time.
 */
export function getAllAlerts(): RoomAlert[] {
  const severityOrder: Record<RoomAlertSeverity, number> = { critical: 0, warn: 1, info: 2 };
  const all: RoomAlert[] = [];
  for (const roomId of ALL_ROOM_IDS) {
    all.push(...getRoomAlerts(roomId));
  }
  return all.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity] || b.timestampMs - a.timestampMs);
}
