/**
 * Client-only snapshot of personal media prefs. Keyed by userId+roomId.
 * Never POSTs. Fail-safe if storage is unavailable (SSR / private mode).
 */

import {
  parseMonitorSlotKey,
  type MonitorTarget,
} from "./types";

export type PersonalMediaPersistedSnapshot = {
  assignments: Array<{ key: string; participantId: string }>;
  pinnedAudio: string[];
  mutedAudio: string[];
  hiddenVideo: string[];
  removedFromView: string[];
  interactionTargetId: string | null;
};

export function personalMediaStorageKey(userId: string, roomId: string): string {
  return `tmi.personal-media.v1.${userId}.${roomId}`;
}

export function loadPersonalMediaSnapshot(
  userId: string,
  roomId: string,
): PersonalMediaPersistedSnapshot | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(personalMediaStorageKey(userId, roomId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersonalMediaPersistedSnapshot;
    if (!parsed || !Array.isArray(parsed.assignments)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function savePersonalMediaSnapshot(
  userId: string,
  roomId: string,
  snapshot: PersonalMediaPersistedSnapshot,
): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(personalMediaStorageKey(userId, roomId), JSON.stringify(snapshot));
  } catch {
    // Ignore quota / private-mode failures. Routing still works in-memory.
  }
}

export function clearPersonalMediaSnapshot(userId: string, roomId: string): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.removeItem(personalMediaStorageKey(userId, roomId));
  } catch {
    // ignore
  }
}

export function assignmentEntriesFromSnapshot(
  snapshot: PersonalMediaPersistedSnapshot,
): Array<{ target: MonitorTarget; participantId: string }> {
  return snapshot.assignments
    .filter((row) => row && typeof row.key === "string" && typeof row.participantId === "string")
    .map((row) => ({ target: parseMonitorSlotKey(row.key), participantId: row.participantId }));
}
