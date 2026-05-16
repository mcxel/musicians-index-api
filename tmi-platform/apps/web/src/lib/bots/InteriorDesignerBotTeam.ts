/**
 * InteriorDesignerBotTeam.ts
 * Orchestrates all room design bots into a single design pipeline.
 * Output: a fully approved RoomDesign + sponsor slots + lighting scenes.
 */

import { buildDefaultRoomDesign, type RoomDesign, type RoomId } from "../environments/RoomDesignEngine";
import { getActiveThemeForRoom, type RoomTheme } from "../environments/RoomThemeRotationEngine";
import { getSeatingLayoutForRoom, type SeatingLayout } from "../environments/SeatingLayoutEngine";
import { buildLightingScene, type LightingScene, type LightingMode } from "../environments/LightingSceneEngine";
import { buildHostPlacements, ROOM_HOST_ROLES, type HostPlacement } from "../environments/HostPlacementEngine";
import { buildSponsorSlots, enforceNoEmptySlots, type SponsorSlot } from "../environments/SponsorPlacementEngine";
import { approveOrFallback, type ClutterGuardResult } from "../environments/RoomClutterGuard";

export type DesignPackage = {
  roomId: RoomId;
  design: RoomDesign;
  theme: RoomTheme;
  seating: SeatingLayout;
  lighting: LightingScene;
  hosts: HostPlacement[];
  sponsorSlots: SponsorSlot[];
  clutterResult: ClutterGuardResult;
};

/**
 * Run the full Interior Designer Bot pipeline for a room.
 * @param roomId - The target room
 * @param lightingMode - Current show state (defaults to "idle")
 * @param occupancyPct - How full the room is (0–1)
 */
export function runInteriorDesignerBotTeam(
  roomId: RoomId,
  lightingMode: LightingMode = "idle",
  occupancyPct = 0.5,
): DesignPackage {
  // 1. Theme Rotation Bot — pick active theme
  const theme = getActiveThemeForRoom(roomId);

  // 2. Room Layout Bot — build default design with theme
  let design = buildDefaultRoomDesign(roomId, theme.key);

  // 3. Seating Layout Bot
  const seating = getSeatingLayoutForRoom(roomId, occupancyPct);

  // 4. Lighting Bot
  const lighting = buildLightingScene(lightingMode, theme.palette);

  // 5. Host Blocking Bot
  const hostRoles = ROOM_HOST_ROLES[roomId] ?? ["lead-host"];
  const hosts = buildHostPlacements(design, hostRoles);

  // 6. Sponsor Decor Bot — build + enforce no empty slots
  const rawSlots = buildSponsorSlots(roomId);
  const sponsorSlots = enforceNoEmptySlots(rawSlots);

  // 7. Clutter Guard Bot — final authority
  const { design: approvedDesign, result: clutterResult } = approveOrFallback(design, sponsorSlots);
  design = approvedDesign;

  return {
    roomId,
    design,
    theme,
    seating,
    lighting,
    hosts,
    sponsorSlots,
    clutterResult,
  };
}

/** Quick accessor — get just the theme for a room */
export function getRoomTheme(roomId: RoomId): RoomTheme {
  return getActiveThemeForRoom(roomId);
}
