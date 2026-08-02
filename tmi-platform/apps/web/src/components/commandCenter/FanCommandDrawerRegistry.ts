/**
 * FanCommandDrawerRegistry — locked Fan Command Center drawer inventory.
 *
 * SHARED SHELL with Performer (CommandCenterShell): L/R rails, Dual→Quad→Octo
 * 16:9 monitors, bottom dock, drawer under media block, ThemeEngine shell colors.
 * Universal Drawer Base + per-module DrawerAnimationProfile (orbit/vinyl/…).
 *
 * FAN-ONLY drawer payloads (Rule 26 Identity Policy):
 *   - Avatar Fan Lobby (free-roam + cinema skin) — NEVER on Performer
 *   - Inventory / Avatar wearables / Room Controls — NEVER on Performer
 *   - YoPho fan canvas, playlists, memory wall
 *   - Live Destinations (DiscoveryBus), Analytics stub
 *
 * Ads: right-rail / zone `dashboard-fan-sidebar` via getAdSlotForZone (Rule 12).
 *
 * NOT this sprint: 3D bobblehead face-scan, peer Daily WebRTC LOD, EQ panel,
 * detachable external playlist player, Analytics mission control redesign.
 */

export {
  FAN_COMMAND_PANELS as FAN_DRAWER_SLOTS,
  type CommandCenterPanelId as FanDrawerSlotId,
  type CommandCenterPanelDef as FanDrawerSlotDef,
  isFanOnlyPanel,
} from "./commandCenterRegistry";

/** Direct left-rail OPEN DRAWER buttons (modules not already an OC primary). */
export const FAN_DRAWER_LAUNCHERS = [
  "lobby",
  "yopho",
  "playlist",
  "memory",
  "marketplace",
  "store",
  "live_destinations",
  "room_controls",
  "inventory",
  "analytics",
  "messaging",
  "submissions",
  "notifications",
  "scores",
] as const;

export const FAN_AD_ZONE = "dashboard-fan-sidebar";
