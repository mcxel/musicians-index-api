/**
 * PerformerCommandDrawerRegistry — locked Performer Command Center drawer inventory.
 *
 * SHARED SHELL with Fan (CommandCenterShell) — matching blueprint chrome.
 *
 * PERFORMER drawer payloads (Rule 26 — NO avatar ownership / Fan Lobby / Avatar Studio):
 *   - Media Locker, Beat Lab, Performer YoPho, Bookings, Stage Tools
 *   - Playlists, Memory Wall, Store
 *   - Sponsors via zone `dashboard-performer-sponsors` (Rule 12)
 *
 * Instant Go Live: left-rail GO LIVE → /live/go + dock Launch Dock.
 *
 * NOT this sprint: full stage show engines (Deal or Feud / Monday Night Stage),
 * face-scan bobbleheads, CIR expansion.
 */

export {
  PERFORMER_COMMAND_PANELS as PERFORMER_DRAWER_SLOTS,
  type CommandCenterPanelId as PerformerDrawerSlotId,
  type CommandCenterPanelDef as PerformerDrawerSlotDef,
} from "./commandCenterRegistry";

export const PERFORMER_DRAWER_LAUNCHERS = [
  "media_locker",
  "yopho",
  "beat_lab",
  "booking",
  "stage_tools",
  "playlist",
  "memory",
  "store",
  "sponsors",
] as const;

export const PERFORMER_SPONSOR_ZONE = "dashboard-performer-sponsors";
