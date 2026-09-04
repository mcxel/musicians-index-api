/**
 * PerformerCommandDrawerRegistry — locked Performer Command Center drawer inventory.
 *
 * SHARED SHELL with Fan (CommandCenterShell) — matching blueprint chrome.
 *
 * PERFORMER drawer payloads (Rule 26 — NO avatar ownership / Fan Lobby / Avatar Studio):
 *   - Media Locker, Bio & Magazine, Beat Lab, Performer YoPho, Bookings, Stage Tools
 *   - Playlists, Memory Wall, Store
 *   - Sponsor management chrome intentionally omitted (Rule 26)
 *
 * Instant Go Live: left-rail GO LIVE → presentInstantGoLiveInPlace on Monitor A.
 *
 * NOT this sprint: full stage show engines (Deal or Feud / Monday Night Stage),
 * face-scan bobbleheads, CIR expansion.
 */

export {
  PERFORMER_COMMAND_PANELS as PERFORMER_DRAWER_SLOTS,
  type CommandCenterPanelId as PerformerDrawerSlotId,
  type CommandCenterPanelDef as PerformerDrawerSlotDef,
} from "./commandCenterRegistry";

/** Direct left-rail OPEN DRAWER buttons (modules not already an OC primary). */
export const PERFORMER_DRAWER_LAUNCHERS = [
  "media_locker",
  "bio_magazine",
  "commerce_center",
  "yopho",
  "beat_lab",
  "booking",
  "stage_tools",
  "playlist",
  "memory",
  "store",
  "messaging",
  "live_destinations",
  "submissions",
  "scores",
  "notifications",
] as const;

/** Legacy zone id — kept for ad-slot fallbacks; not mounted in Performer hub chrome. */
export const PERFORMER_SPONSOR_ZONE = "dashboard-performer-sponsors";
