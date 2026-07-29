/**
 * AutoDirectorEngine — pure Flight Deck idle-slot assignment (Phase 3.x / 4.8).
 *
 * findIdleSlots / pickNextContent / assignSlots — no side effects, no fabricated
 * viewer counts or opponents (Rule 20). Matchmaking / room-merge is LOCKED FUTURE
 * (see TODO.md); do not invent staging pools here.
 *
 * Layer 5: optional `programSuggestions` (ProgramBoard now-playing / starting-soon)
 * are preferred over the discovery pool when filling idle slots.
 */

import type {
  FlightDeckMonitorSlotId,
  MonitorAssignment,
  MonitorSlotLockState,
} from "@/core/eos/monitorAssignment";
import { FLIGHT_DECK_SLOT_IDS } from "@/core/eos/monitorAssignment";
import {
  getAutoDirectorDefaultCadenceMs,
  resolveAutoDirectorPreviews,
  type ResolvedAutoDirectorPreview,
} from "@/registries/eos/AutoDirectorRegistry";

export interface AssignSlotsOptions {
  /** Current slot map (USER locks preserved) */
  current: MonitorAssignment[];
  /** Optional override catalog; defaults to resolveAutoDirectorPreviews() */
  pool?: ResolvedAutoDirectorPreview[];
  /**
   * Layer 5 ProgramBoard suggestions (now playing / starting soon).
   * Preferred for idle fills before falling back to discovery pool.
   */
  programSuggestions?: ResolvedAutoDirectorPreview[];
  /** Pseudo-random seed for deterministic tests; defaults to Date.now() */
  seed?: number;
  /** Max distinct AUTO_DIRECTOR content ids across idle slots */
  maxDistinct?: number;
}

function emptyUserAssignment(slotId: FlightDeckMonitorSlotId): MonitorAssignment {
  return {
    slotId,
    source: "USER",
    contentType: "EMPTY",
    contentId: "empty",
    priority: 0,
    locked: false,
  };
}

/**
 * Build initial assignments from runtime lock state.
 * Locked USER surfaces are never idle.
 */
export function buildAssignmentsFromLockState(
  locks: MonitorSlotLockState,
): MonitorAssignment[] {
  const chatOrPlaylistOrMemory =
    Boolean(locks.chatLocked) ||
    Boolean(locks.playlistLocked) ||
    Boolean(locks.memoryWallLocked);

  return FLIGHT_DECK_SLOT_IDS.map((slotId) => {
    switch (slotId) {
      case "MONITOR_A": {
        const locked = Boolean(locks.monitorALive) || Boolean(locks.monitorAUserMedia);
        return {
          slotId,
          source: "USER" as const,
          contentType: locks.monitorALive
            ? ("LIVE_PREVIEW" as const)
            : locks.monitorAUserMedia
              ? ("MEDIA_PLAYER" as const)
              : ("EMPTY" as const),
          contentId: locks.monitorALive ? "user-live" : locks.monitorAUserMedia ? "user-media" : "empty",
          priority: 0,
          locked,
          title: locks.monitorALive ? "Your Broadcast" : undefined,
        };
      }
      case "MONITOR_B": {
        const locked = Boolean(locks.monitorBLocked);
        return {
          slotId,
          source: locked ? ("USER" as const) : ("AUTO_DIRECTOR" as const),
          contentType: locked ? ("LOBBY_WALL" as const) : ("EMPTY" as const),
          contentId: locked ? "lobby-wall" : "empty",
          priority: 0,
          locked,
          entryRoute: "/live/lobby",
          title: "Live Lobby Walls",
        };
      }
      case "PIP_LEFT": {
        // Chat / playlist / memory wall overlays lock left satellite when present
        const locked = Boolean(locks.pipLeftUserMedia) || chatOrPlaylistOrMemory;
        const contentType = locks.playlistLocked
          ? ("PLAYLIST" as const)
          : locks.memoryWallLocked
            ? ("MEMORY_WALL" as const)
            : locks.chatLocked
              ? ("CHAT" as const)
              : locks.pipLeftUserMedia
                ? ("MEDIA_PLAYER" as const)
                : ("EMPTY" as const);
        return {
          slotId,
          source: "USER" as const,
          contentType,
          contentId: locked ? contentType.toLowerCase() : "empty",
          priority: 0,
          locked,
        };
      }
      case "PIP_RIGHT": {
        const locked = Boolean(locks.cameraOn);
        return {
          slotId,
          source: "USER" as const,
          contentType: locked ? ("CAMERA" as const) : ("EMPTY" as const),
          contentId: locked ? "camera" : "empty",
          priority: 0,
          locked,
          title: locked ? "Your Camera" : undefined,
        };
      }
      default:
        return emptyUserAssignment(slotId);
    }
  });
}

/** Idle = unlocked and no user content (EMPTY or prior AUTO_DIRECTOR fill). */
export function findIdleSlots(assignments: MonitorAssignment[]): FlightDeckMonitorSlotId[] {
  return assignments
    .filter((a) => {
      if (a.locked) return false;
      if (a.source === "USER" && a.contentType !== "EMPTY") return false;
      return true;
    })
    .map((a) => a.slotId);
}

function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Weighted pick from the discovery pool. Excludes already-assigned content ids.
 * Never invents live status or viewer counts.
 */
export function pickNextContent(
  pool: ResolvedAutoDirectorPreview[],
  excludeIds: ReadonlySet<string> = new Set(),
  seed: number = Date.now(),
): ResolvedAutoDirectorPreview | null {
  const candidates = pool.filter((p) => !excludeIds.has(p.id) && !excludeIds.has(p.contentId));
  if (candidates.length === 0) return null;

  const total = candidates.reduce((sum, c) => sum + Math.max(1, c.priority), 0);
  const rand = mulberry32(seed)() * total;
  let cursor = 0;
  for (const c of candidates) {
    cursor += Math.max(1, c.priority);
    if (rand <= cursor) return c;
  }
  return candidates[candidates.length - 1] ?? null;
}

function previewToAssignment(
  slotId: FlightDeckMonitorSlotId,
  preview: ResolvedAutoDirectorPreview,
): MonitorAssignment {
  return {
    slotId,
    source: "AUTO_DIRECTOR",
    contentType: preview.contentType,
    contentId: preview.contentId,
    priority: preview.priority,
    locked: false,
    entryRoute: preview.entryRoute,
    title: preview.title,
    subtitle: preview.subtitle,
    accentColor: preview.accentColor,
    icon: preview.icon,
  };
}

/**
 * Fill idle slots with ProgramBoard suggestions first, then discovery pool.
 * Preserves all locked / USER non-empty assignments.
 */
export function assignSlots(options: AssignSlotsOptions): MonitorAssignment[] {
  const pool = options.pool ?? resolveAutoDirectorPreviews();
  const programSuggestions = options.programSuggestions ?? [];
  const seed = options.seed ?? Date.now();
  const maxDistinct = options.maxDistinct ?? FLIGHT_DECK_SLOT_IDS.length;

  const bySlot = new Map<FlightDeckMonitorSlotId, MonitorAssignment>();
  for (const id of FLIGHT_DECK_SLOT_IDS) {
    bySlot.set(id, emptyUserAssignment(id));
  }
  for (const a of options.current) {
    bySlot.set(a.slotId, a);
  }

  const currentList = FLIGHT_DECK_SLOT_IDS.map((id) => bySlot.get(id)!);
  const idle = findIdleSlots(currentList);
  const used = new Set<string>();

  // Preserve content ids already on locked/user slots so we don't duplicate
  for (const a of currentList) {
    if (a.locked || (a.source === "USER" && a.contentType !== "EMPTY")) {
      if (a.contentId && a.contentId !== "empty") used.add(a.contentId);
    }
    if (a.source === "AUTO_DIRECTOR" && a.contentId) used.add(a.contentId);
  }

  let picks = 0;
  let programCursor = 0;
  idle.forEach((slotId, index) => {
    if (picks >= maxDistinct) return;

    // Prefer ProgramBoard now-playing / starting-soon when available
    let preview: ResolvedAutoDirectorPreview | null = null;
    while (programCursor < programSuggestions.length && !preview) {
      const candidate = programSuggestions[programCursor];
      programCursor += 1;
      if (!candidate) break;
      if (used.has(candidate.id) || used.has(candidate.contentId)) continue;
      preview = candidate;
    }
    if (!preview) {
      preview = pickNextContent(pool, used, seed + index * 97);
    }
    if (!preview) return;
    used.add(preview.id);
    used.add(preview.contentId);
    bySlot.set(slotId, previewToAssignment(slotId, preview));
    picks += 1;
  });

  return FLIGHT_DECK_SLOT_IDS.map((id) => bySlot.get(id)!);
}

export function getRotationCadenceMs(): number {
  return getAutoDirectorDefaultCadenceMs();
}

/**
 * Re-assign only idle AUTO_DIRECTOR / EMPTY slots on cadence tick.
 * Locked USER content is untouched.
 */
export function rotateIdleAssignments(
  current: MonitorAssignment[],
  seed: number = Date.now(),
  programSuggestions?: ResolvedAutoDirectorPreview[],
): MonitorAssignment[] {
  // Clear prior AUTO_DIRECTOR fills so pickNextContent can rotate
  const cleared = current.map((a) => {
    if (a.locked) return a;
    if (a.source === "AUTO_DIRECTOR") {
      return {
        ...a,
        source: "USER" as const,
        contentType: "EMPTY" as const,
        contentId: "empty",
        entryRoute: undefined,
        title: undefined,
        subtitle: undefined,
        icon: undefined,
        accentColor: undefined,
        priority: 0,
      };
    }
    return a;
  });
  return assignSlots({ current: cleared, seed, programSuggestions });
}
