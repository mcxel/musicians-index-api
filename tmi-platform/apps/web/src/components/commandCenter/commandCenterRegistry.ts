/**
 * Command Center panel registry — Fan vs Performer drawer payloads (Rule 26).
 * Same chrome/shell; different drawer content. Never mount Fan Lobby ownership
 * or Avatar Studio for PERFORMER.
 *
 * Animation personalities live in UniversalDrawerRegistry — not here.
 */

import {
  FAN_UNIVERSAL_SWAP_MODULES,
  getUniversalDrawerModule,
  modulesForRole,
  type UniversalDrawerModuleId,
} from "@/lib/drawers/UniversalDrawerRegistry";

export type CommandCenterRole = "fan" | "performer";

export type CommandCenterPanelId = UniversalDrawerModuleId;

export interface CommandCenterPanelDef {
  id: CommandCenterPanelId;
  label: string;
  info: string;
  accent: string;
  /** Primary = highlighted left-rail OPEN DRAWER section */
  primary?: boolean;
}

function toPanelDef(id: UniversalDrawerModuleId): CommandCenterPanelDef | null {
  const m = getUniversalDrawerModule(id);
  if (!m) return null;
  return {
    id: m.id,
    label: m.label,
    info: m.info,
    accent: m.accent,
    primary: m.primary,
  };
}

/** Marcel P0: Lobby / YoPho / Memory / Playlist + Live Destinations under-monitor drawer. */
export const FAN_COMMAND_PANELS: CommandCenterPanelDef[] = modulesForRole("fan")
  .map((m) => toPanelDef(m.id))
  .filter((p): p is CommandCenterPanelDef => p != null);

/** Quick-swap chips inside the open drawer (Fan Command Center). */
export const FAN_DRAWER_SWAP_PANELS: CommandCenterPanelId[] = [...FAN_UNIVERSAL_SWAP_MODULES];

/** Performer drawers — NO avatar lobby ownership / Avatar Studio (Rule 26). */
export const PERFORMER_COMMAND_PANELS: CommandCenterPanelDef[] = modulesForRole("performer")
  .map((m) => toPanelDef(m.id))
  .filter((p): p is CommandCenterPanelDef => p != null);

export function panelsForRole(role: CommandCenterRole): CommandCenterPanelDef[] {
  return role === "performer" ? PERFORMER_COMMAND_PANELS : FAN_COMMAND_PANELS;
}

export function isFanOnlyPanel(id: CommandCenterPanelId): boolean {
  return id === "lobby" || id === "inventory" || id === "room_controls";
}
