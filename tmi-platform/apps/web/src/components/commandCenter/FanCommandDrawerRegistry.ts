/**
 * FanCommandDrawerRegistry — locked Fan Command Center drawer inventory.
 *
 * SHARED SHELL with Performer (CommandCenterShell): L/R rails, Dual→Quad→Octo
 * 16:9 monitors, bottom dock, drawer under media block, ThemeEngine shell colors.
 *
 * FAN-ONLY drawer payloads (Rule 26 Identity Policy):
 *   - Avatar Fan Lobby (free-roam + cinema skin) — NEVER on Performer
 *   - Inventory / Avatar wearables — NEVER on Performer
 *   - YoPho fan canvas, playlists, memory wall
 *
 * Ads: right-rail / zone `dashboard-fan-sidebar` via getAdSlotForZone (Rule 12).
 *
 * NOT this sprint: 3D bobblehead face-scan, Lounge PresenceFrame full commerce,
 * World Dance Party full-body separation (document in comments only).
 */

export {
  FAN_COMMAND_PANELS as FAN_DRAWER_SLOTS,
  type CommandCenterPanelId as FanDrawerSlotId,
  type CommandCenterPanelDef as FanDrawerSlotDef,
  isFanOnlyPanel,
} from "./commandCenterRegistry";

export const FAN_DRAWER_LAUNCHERS = [
  "lobby",
  "yopho",
  "playlist",
  "memory",
  "inventory",
] as const;

export const FAN_AD_ZONE = "dashboard-fan-sidebar";
