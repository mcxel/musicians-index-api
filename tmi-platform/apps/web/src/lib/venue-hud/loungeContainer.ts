/**
 * Canonical lounge container — do not invent /lounge/[id].
 * Social lounge already lives in the live-room renderer.
 */

import { getAnchorBySlug } from "../live/AnchorRoomRegistry";
import { resolveCanonicalHudFamily, type ExperienceType } from "./TMIExperienceHudRuntime";

export const CANONICAL_LOUNGE_CONTAINER = {
  routePattern: "/live/rooms/[id]",
  exampleSlug: "lounge-playlist",
  exampleRoute: "/live/rooms/lounge-playlist",
  renderer: "UniversalVenueRenderer",
  hud: "TMIInteractiveLoungeHud",
  monitors: "LiveRoomMonitorShareStack",
} as const;

export function experienceTypeForRoom(roomId: string): ExperienceType {
  const slug = roomId.trim().toLowerCase();
  const anchor = getAnchorBySlug(slug);
  if (anchor?.category === "LOUNGE") return "LOUNGE";
  if (slug === "lounge" || slug.startsWith("lounge-")) return "LOUNGE";
  return "LIVE";
}

export function loungeHudMountsForRoom(roomId: string): boolean {
  return resolveCanonicalHudFamily(experienceTypeForRoom(roomId)) === "LOUNGE_HUD";
}
