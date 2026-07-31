/**
 * FloatingWorkspaceModules — Pass 8.x module catalog + Rule 26 role lists.
 * Same panel slot; content swaps by module id. Performers never get avatar inventory.
 */

export type FloatingWorkspaceModuleId =
  | "memory_wall"
  | "collections"
  | "venue_concierge"
  | "analytics"
  | "live_analytics"
  | "camera"
  | "messages"
  | "schedule"
  | "booking"
  | "music"
  | "avatar_inventory"
  | "quick_memories"
  | "fan_lobby";

export type FloatingWorkspaceRole = "FAN" | "PERFORMER" | "ADMIN" | "STAFF";

export interface FloatingWorkspaceModuleDef {
  id: FloatingWorkspaceModuleId;
  label: string;
  icon: string;
  /** Short dock hint */
  description: string;
}

export const FLOATING_WORKSPACE_MODULE_CATALOG: Record<
  FloatingWorkspaceModuleId,
  FloatingWorkspaceModuleDef
> = {
  memory_wall: {
    id: "memory_wall",
    label: "Memory Wall",
    icon: "🧠",
    description: "Full media library",
  },
  collections: {
    id: "collections",
    label: "Collections",
    icon: "📁",
    description: "Albums & collections",
  },
  venue_concierge: {
    id: "venue_concierge",
    label: "Venue Concierge",
    icon: "🗺️",
    description: "Nearby venues & booking",
  },
  analytics: {
    id: "analytics",
    label: "Analytics",
    icon: "📊",
    description: "Honest role metrics",
  },
  live_analytics: {
    id: "live_analytics",
    label: "Live Analytics",
    icon: "📈",
    description: "Live session metrics",
  },
  camera: {
    id: "camera",
    label: "Camera",
    icon: "📷",
    description: "Capture memory",
  },
  messages: {
    id: "messages",
    label: "Messages",
    icon: "💬",
    description: "Direct messages",
  },
  schedule: {
    id: "schedule",
    label: "Schedule",
    icon: "🗓️",
    description: "Upcoming dates",
  },
  booking: {
    id: "booking",
    label: "Booking",
    icon: "📅",
    description: "Booking requests",
  },
  music: {
    id: "music",
    label: "Music",
    icon: "🎵",
    description: "Playlists",
  },
  avatar_inventory: {
    id: "avatar_inventory",
    label: "Avatar Inventory",
    icon: "🎒",
    description: "Fan avatar loadout",
  },
  quick_memories: {
    id: "quick_memories",
    label: "Quick Memories",
    icon: "✨",
    description: "Recent media shelf",
  },
  fan_lobby: {
    id: "fan_lobby",
    label: "Fan Lobby",
    icon: "🎉",
    description: "Free-roam hangout with friends",
  },
};

/** FAN drawer modules (Rule 26 — avatar ownership allowed). */
export const FAN_FLOATING_MODULES: FloatingWorkspaceModuleId[] = [
  "fan_lobby",
  "quick_memories",
  "avatar_inventory",
  "memory_wall",
  "collections",
  "analytics",
  "camera",
  "messages",
  "schedule",
  "booking",
  "music",
];

/** PERFORMER modules — Venue Concierge + live analytics; NO avatar inventory. */
export const PERFORMER_FLOATING_MODULES: FloatingWorkspaceModuleId[] = [
  "venue_concierge",
  "quick_memories",
  "live_analytics",
  "memory_wall",
  "collections",
  "analytics",
  "camera",
  "messages",
  "schedule",
  "booking",
  "music",
];

/** Admin/staff see performer set plus fan inventory for support (ownership UI still RoleGate FAN). */
export const ADMIN_FLOATING_MODULES: FloatingWorkspaceModuleId[] = [
  ...PERFORMER_FLOATING_MODULES,
  "avatar_inventory",
];

export function modulesForRole(
  role: FloatingWorkspaceRole | string | null | undefined
): FloatingWorkspaceModuleId[] {
  const r = (role ?? "FAN").toUpperCase();
  if (r === "PERFORMER" || r === "ARTIST" || r === "BAND") {
    return [...PERFORMER_FLOATING_MODULES];
  }
  if (r === "ADMIN" || r === "STAFF") {
    return [...ADMIN_FLOATING_MODULES];
  }
  return [...FAN_FLOATING_MODULES];
}

export function isModuleAllowedForRole(
  moduleId: FloatingWorkspaceModuleId,
  role: FloatingWorkspaceRole | string | null | undefined
): boolean {
  return modulesForRole(role).includes(moduleId);
}

export function defaultModuleForRole(
  role: FloatingWorkspaceRole | string | null | undefined
): FloatingWorkspaceModuleId {
  const list = modulesForRole(role);
  return list[0] ?? "quick_memories";
}
