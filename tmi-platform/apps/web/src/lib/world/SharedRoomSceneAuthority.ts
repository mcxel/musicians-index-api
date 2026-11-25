/**
 * SharedRoomSceneAuthority — one WebGL/scene context per roomId.
 * Reuses UniversalVenueRenderer + WorldProfilesContract; does not create a
 * second room engine. Manufactured JOB worlds bind via ManufacturingArtifactBinding
 * (integration lane only until LIVE_ASSET_SWITCHES).
 */

import {
  QUALITY_PROFILES,
  assignAvatarLods,
  type QualityProfile,
  type AvatarLodLevel,
} from "@/lib/world/WorldProfilesContract";
import {
  INTEGRATION_VENUE_WORLDS,
  LIVE_ASSET_SWITCHES,
  manufacturingBoundaryLocks,
} from "@/lib/assets/ManufacturingArtifactBinding";

export const SHARED_ROOM_SCENE_AUTHORITY_ID = "SHARED_ROOM_SCENE_AUTHORITY_v1" as const;
export const ONE_SCENE_PER_ROOM = true as const;
export const PER_SEAT_WEBG_CANVAS_FORBIDDEN = true as const;
export const NEW_ROOM_ENGINE = false as const;

export type SharedSceneQualityMode = "AUTO" | "PERFORMANCE" | "BALANCED" | "ULTRA";

export type SharedRoomSceneKey = {
  roomId: string;
  venueBlueprintId: string | null;
  liveSessionId: string | null;
};

const activeScenes = new Map<string, SharedRoomSceneKey>();

export function sharedSceneMapKey(roomId: string): string {
  return `room:${roomId}`;
}

/** Register / reclaim the single scene slot for this room. */
export function bindSharedRoomScene(input: SharedRoomSceneKey): {
  ok: true;
  key: string;
  replaced: boolean;
  liveAssetSwitches: false;
} {
  const key = sharedSceneMapKey(input.roomId);
  const prior = activeScenes.get(key);
  activeScenes.set(key, { ...input });
  return {
    ok: true,
    key,
    replaced: Boolean(prior),
    liveAssetSwitches: LIVE_ASSET_SWITCHES,
  };
}

export function unbindSharedRoomScene(roomId: string): boolean {
  return activeScenes.delete(sharedSceneMapKey(roomId));
}

export function getSharedRoomScene(roomId: string): SharedRoomSceneKey | null {
  return activeScenes.get(sharedSceneMapKey(roomId)) ?? null;
}

export function resolveQualityProfile(mode: SharedSceneQualityMode): QualityProfile {
  if (mode === "PERFORMANCE") return QUALITY_PROFILES.LOW;
  if (mode === "ULTRA") return QUALITY_PROFILES.ULTRA;
  if (mode === "BALANCED") return QUALITY_PROFILES.MEDIUM;
  return QUALITY_PROFILES.HIGH;
}

export function planSharedSceneAvatarLods(
  people: ReadonlyArray<{ id: string; distanceM: number; certifiedLods: readonly AvatarLodLevel[] }>,
  mode: SharedSceneQualityMode,
): Map<string, AvatarLodLevel> {
  return assignAvatarLods(people, resolveQualityProfile(mode));
}

/**
 * Integration-lane world GLB for a blueprint — never a /models live URL while switches are OFF.
 */
export function resolveIntegrationWorldGlb(
  blueprintId: string | null | undefined,
): string | null {
  if (!blueprintId) return null;
  if (blueprintId === "reference-auditorium-v3") {
    return INTEGRATION_VENUE_WORLDS["reference-auditorium-v3"];
  }
  // Experience id "monday-night-stage" and arch-v2 blueprint share JOB-VENUE-MNS-ARCH-V2 world.
  if (
    blueprintId === "monday-night-stage" ||
    blueprintId === "monday-night-stage-arch-v2"
  ) {
    return INTEGRATION_VENUE_WORLDS["monday-night-stage-arch-v2"];
  }
  if (
    blueprintId === "monday-night-stage-arch-v3" ||
    blueprintId === "monday-night-stage-arch-v3-fx"
  ) {
    return INTEGRATION_VENUE_WORLDS["monday-night-stage-arch-v3-fx"];
  }
  if (blueprintId === "purpose-lounge-v2" || blueprintId === "purpose-lounge-v2-interactives") {
    return INTEGRATION_VENUE_WORLDS["purpose-lounge-v2-interactives"];
  }
  return null;
}

export function sharedRoomSceneLocks() {
  return {
    ONE_SCENE_PER_ROOM,
    PER_SEAT_WEBG_CANVAS_FORBIDDEN,
    NEW_ROOM_ENGINE,
    CANONICAL_RENDERER: "UniversalVenueRenderer",
    LOD_AUTHORITY: "WorldProfilesContract.assignAvatarLods",
    ...manufacturingBoundaryLocks(),
  } as const;
}

/** Test helper */
export function resetSharedRoomScenesForTests(): void {
  activeScenes.clear();
}
