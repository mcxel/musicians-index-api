/**
 * RoomClutterGuard.ts
 * Final authority on room design — prevents messy, unreadable, or laggy rooms.
 * All designs must pass ClutterGuard before being rendered.
 */

import type { RoomDesign } from "./RoomDesignEngine";
import type { SponsorSlot } from "./SponsorPlacementEngine";

export type ClutterViolation = {
  code: string;
  message: string;
  severity: "warning" | "error";
};

export type ClutterGuardResult = {
  approved: boolean;
  violations: ClutterViolation[];
};

const MAX_ZONES_TOTAL = 20;
const MAX_SPONSOR_SLOTS = 6;
const MAX_OVERLAPPING_ZONES = 2;
const MIN_PERFORMANCE_PANEL_CLEAR_AREA = 0.3;

function checkOverlap(ax: number, ay: number, aw: number, ah: number, bx: number, by: number, bw: number, bh: number): boolean {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

export function runClutterGuard(design: RoomDesign, sponsorSlots: SponsorSlot[]): ClutterGuardResult {
  const violations: ClutterViolation[] = [];

  // 1. Total zone count
  if (design.zones.length > MAX_ZONES_TOTAL) {
    violations.push({ code: "TOO_MANY_ZONES", message: `${design.zones.length} zones exceed limit of ${MAX_ZONES_TOTAL}.`, severity: "error" });
  }

  // 2. Sponsor slot count
  if (sponsorSlots.length > MAX_SPONSOR_SLOTS) {
    violations.push({ code: "TOO_MANY_SPONSOR_SLOTS", message: `${sponsorSlots.length} sponsor slots exceed limit of ${MAX_SPONSOR_SLOTS}.`, severity: "warning" });
  }

  // 3. Performance panel must have clear area
  const perfPanel = design.zones.find((z) => z.kind === "performance-video");
  if (perfPanel) {
    const panelArea = perfPanel.width * perfPanel.height;
    if (panelArea < MIN_PERFORMANCE_PANEL_CLEAR_AREA) {
      violations.push({ code: "PERF_PANEL_TOO_SMALL", message: `Performance panel area ${panelArea.toFixed(2)} < ${MIN_PERFORMANCE_PANEL_CLEAR_AREA} minimum.`, severity: "error" });
    }
  } else {
    violations.push({ code: "MISSING_PERF_PANEL", message: "No performance-video zone found.", severity: "warning" });
  }

  // 4. Check for excessive zone overlaps (high-zIndex zones should not stack > MAX_OVERLAPPING_ZONES)
  const highZones = design.zones.filter((z) => z.zIndex >= 4);
  let overlapCount = 0;
  for (let i = 0; i < highZones.length; i++) {
    for (let j = i + 1; j < highZones.length; j++) {
      const a = highZones[i];
      const b = highZones[j];
      if (a && b && checkOverlap(a.x, a.y, a.width, a.height, b.x, b.y, b.width, b.height)) {
        overlapCount++;
      }
    }
  }
  if (overlapCount > MAX_OVERLAPPING_ZONES) {
    violations.push({ code: "EXCESSIVE_OVERLAPS", message: `${overlapCount} high-z zone overlaps detected.`, severity: "warning" });
  }

  // 5. Max props on screen
  if (design.maxPropsOnScreen > 8) {
    violations.push({ code: "TOO_MANY_PROPS", message: `maxPropsOnScreen ${design.maxPropsOnScreen} is too high (max 8).`, severity: "error" });
  }

  // 6. Must have stage zone
  const hasStage = design.zones.some((z) => z.kind === "stage");
  if (!hasStage) {
    violations.push({ code: "MISSING_STAGE", message: "Room has no stage zone.", severity: "error" });
  }

  // 7. Must have reaction zone
  const hasReaction = design.zones.some((z) => z.kind === "reaction");
  if (!hasReaction) {
    violations.push({ code: "MISSING_REACTION_ZONE", message: "Room has no reaction zone.", severity: "warning" });
  }

  const hasErrors = violations.some((v) => v.severity === "error");
  return { approved: !hasErrors, violations };
}

export function approveOrFallback(design: RoomDesign, sponsorSlots: SponsorSlot[]): { design: RoomDesign; result: ClutterGuardResult } {
  const result = runClutterGuard(design, sponsorSlots);
  const approved: RoomDesign = { ...design, clutterApproved: result.approved };
  return { design: approved, result };
}
