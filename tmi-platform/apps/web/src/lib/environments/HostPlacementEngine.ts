/**
 * HostPlacementEngine.ts
 * Determines host/co-host positions and walk paths within a room.
 * Ensures hosts never block the performance panel.
 */

import type { RoomDesign, RoomZone } from "./RoomDesignEngine";

export type HostRole = "lead-host" | "co-host" | "judge" | "sideline-reporter";

export type WalkPathPoint = {
  x: number;
  y: number;
  durationMs: number;
  action?: "talk" | "gesture" | "react" | "walk" | "idle";
};

export type HostPlacement = {
  hostId: string;
  role: HostRole;
  label: string;
  /** Normalized starting position */
  startX: number;
  startY: number;
  walkPath: WalkPathPoint[];
  /** Whether this host has a hook/cane mechanic (Bebo) */
  hasCaneMechanic: boolean;
};

function safeHostZone(design: RoomDesign): { x: number; y: number; width: number; height: number } {
  const zone: RoomZone | undefined = design.zones.find((z) => z.kind === "host-zone" || z.kind === "host-table");
  return zone ?? { x: 0.02, y: 0.15, width: 0.12, height: 0.3 };
}

function buildHostWalkPath(hostZone: ReturnType<typeof safeHostZone>, role: HostRole): WalkPathPoint[] {
  const { x, y, width, height } = hostZone;
  const cx = x + width / 2;
  const cy = y + height / 2;

  if (role === "lead-host") {
    return [
      { x: cx,        y: cy,        durationMs: 0,    action: "idle" },
      { x: cx + 0.05, y: cy - 0.05, durationMs: 2000, action: "talk" },
      { x: cx,        y: cy + 0.05, durationMs: 2000, action: "gesture" },
      { x: cx - 0.03, y: cy,        durationMs: 1500, action: "react" },
      { x: cx,        y: cy,        durationMs: 1500, action: "idle" },
    ];
  }
  if (role === "co-host") {
    return [
      { x: cx + 0.12, y: cy,        durationMs: 0,    action: "idle" },
      { x: cx + 0.10, y: cy - 0.04, durationMs: 2500, action: "talk" },
      { x: cx + 0.12, y: cy + 0.04, durationMs: 2000, action: "react" },
    ];
  }
  // judge / sideline
  return [
    { x: cx, y: cy, durationMs: 0,    action: "idle" },
    { x: cx, y: cy, durationMs: 3000, action: "react" },
  ];
}

export function buildHostPlacements(design: RoomDesign, roles: HostRole[]): HostPlacement[] {
  const hostZone = safeHostZone(design);
  return roles.map((role, i) => {
    const offsetX = i * 0.06;
    return {
      hostId: `host-${role}-${i}`,
      role,
      label: role === "lead-host" ? "Host" : role === "co-host" ? "Co-Host" : role === "judge" ? `Judge ${i}` : "Reporter",
      startX: hostZone.x + hostZone.width / 2 + offsetX,
      startY: hostZone.y + hostZone.height / 2,
      walkPath: buildHostWalkPath(hostZone, role),
      hasCaneMechanic: role === "lead-host" && design.roomId === "monday-night-stage",
    };
  });
}

/** Per-room host role lists */
export const ROOM_HOST_ROLES: Record<string, HostRole[]> = {
  "monthly-idol":       ["lead-host", "co-host", "judge", "judge"],
  "monday-night-stage": ["lead-host", "co-host"],
  "deal-or-feud":       ["lead-host"],
  "name-that-tune":     ["lead-host", "co-host"],
  "circle-squares":     ["lead-host"],
  "cypher":             ["lead-host"],
  "lobbies":            ["lead-host"],
};
