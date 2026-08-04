/**
 * Media Player chassis inventory — equipped chassis per user.
 * Free default: Standard TMI Player (`standard`). Fish is never auto-equipped.
 */

import {
  FREE_DEFAULT_CHASSIS_ID,
  MEDIA_PLAYER_CHASSIS_REGISTRY,
  canEquipChassis,
  type MediaPlayerChassisId,
} from "@/lib/artifacts/PlaylistArtifactEngine";

const OWNED_KEY = "tmi_media_player_owned_v1";
const EQUIPPED_KEY = "tmi_media_player_equipped_v1";

function storageGet<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function storageSet(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota */
  }
}

/** Ensure every user owns + equips the free Standard TMI Player. */
export function ensureDefaultMediaPlayer(userId: string): MediaPlayerChassisId {
  const owned = getOwnedChassisIds(userId);
  if (!owned.includes(FREE_DEFAULT_CHASSIS_ID)) {
    setOwnedChassisIds(userId, [...owned, FREE_DEFAULT_CHASSIS_ID, "tmi_classic", "tmi_dark", "tmi_neon"]);
  }
  const equipped = getEquippedChassisId(userId);
  // Migrate legacy fish/submarine default off free equip.
  if (equipped === "fish" || equipped === "submarine") {
    setEquippedChassisId(userId, FREE_DEFAULT_CHASSIS_ID);
    return FREE_DEFAULT_CHASSIS_ID;
  }
  if (!equipped || !MEDIA_PLAYER_CHASSIS_REGISTRY[equipped]) {
    setEquippedChassisId(userId, FREE_DEFAULT_CHASSIS_ID);
    return FREE_DEFAULT_CHASSIS_ID;
  }
  return equipped;
}

export function getOwnedChassisIds(userId: string): MediaPlayerChassisId[] {
  const all = storageGet<Record<string, MediaPlayerChassisId[]>>(OWNED_KEY, {});
  return all[userId] ?? [FREE_DEFAULT_CHASSIS_ID, "tmi_classic", "tmi_dark", "tmi_neon"];
}

function setOwnedChassisIds(userId: string, ids: MediaPlayerChassisId[]): void {
  const all = storageGet<Record<string, MediaPlayerChassisId[]>>(OWNED_KEY, {});
  all[userId] = Array.from(new Set(ids));
  storageSet(OWNED_KEY, all);
}

export function getEquippedChassisId(userId: string): MediaPlayerChassisId {
  const all = storageGet<Record<string, MediaPlayerChassisId>>(EQUIPPED_KEY, {});
  return all[userId] ?? FREE_DEFAULT_CHASSIS_ID;
}

export function setEquippedChassisId(userId: string, chassisId: MediaPlayerChassisId): boolean {
  const owned = getOwnedChassisIds(userId);
  if (!canEquipChassis(chassisId, "FREE", owned)) return false;
  const all = storageGet<Record<string, MediaPlayerChassisId>>(EQUIPPED_KEY, {});
  all[userId] = chassisId;
  storageSet(EQUIPPED_KEY, all);
  return true;
}

export function grantChassisOwnership(userId: string, chassisId: MediaPlayerChassisId): void {
  const owned = getOwnedChassisIds(userId);
  if (owned.includes(chassisId)) return;
  setOwnedChassisIds(userId, [...owned, chassisId]);
}

export function ownsChassis(userId: string, chassisId: MediaPlayerChassisId): boolean {
  return getOwnedChassisIds(userId).includes(chassisId);
}
