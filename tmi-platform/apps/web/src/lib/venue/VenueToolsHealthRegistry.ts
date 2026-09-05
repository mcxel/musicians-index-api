/**
 * VenueToolsHealthRegistry — observability for VENUE TOOLS modules (console + telemetry pattern).
 */

import type { VenueToolsModuleId } from "@/lib/venue/VenueToolsRegistry";

export type VenueToolsModuleHealth = "OK" | "PARTIAL" | "STUB" | "DISABLED" | "ERROR";

export interface VenueToolsHealthEntry {
  moduleId: VenueToolsModuleId;
  health: VenueToolsModuleHealth;
  lastCommand?: string;
  lastError?: string;
  updatedAt: string;
}

const _health = new Map<VenueToolsModuleId, VenueToolsHealthEntry>();

/**
 * Init defaults are NOT runtime health. Modules that mutate engines report OK/PARTIAL
 * only after a real command (reportVenueToolsModuleHealth). Default "OK" was false-green.
 */
const DEFAULT_HEALTH: Record<VenueToolsModuleId, VenueToolsModuleHealth> = {
  MOOD: "PARTIAL",
  LIGHTING: "PARTIAL",
  SCENES: "PARTIAL",
  STAGE: "PARTIAL",
  ENVIRONMENT: "PARTIAL",
  AMBIENCE: "PARTIAL",
  MEDIA: "DISABLED",
  CAMERAS: "PARTIAL",
  FX: "PARTIAL",
  DECOR: "PARTIAL",
  CURTAIN: "PARTIAL",
  CUES: "PARTIAL",
  ROOM_HEALTH: "STUB",
};

export function initVenueToolsHealth(): void {
  for (const [moduleId, health] of Object.entries(DEFAULT_HEALTH)) {
    _health.set(moduleId as VenueToolsModuleId, {
      moduleId: moduleId as VenueToolsModuleId,
      health,
      updatedAt: new Date().toISOString(),
    });
  }
}

export function reportVenueToolsModuleHealth(
  moduleId: VenueToolsModuleId,
  health: VenueToolsModuleHealth,
  meta?: { lastCommand?: string; lastError?: string },
): void {
  _health.set(moduleId, {
    moduleId,
    health,
    lastCommand: meta?.lastCommand,
    lastError: meta?.lastError,
    updatedAt: new Date().toISOString(),
  });
  if (typeof console !== "undefined" && process.env.NODE_ENV !== "production") {
    console.debug(`[VenueToolsHealth] ${moduleId} → ${health}`, meta ?? "");
  }
}

export function getVenueToolsHealthSnapshot(): VenueToolsHealthEntry[] {
  return Array.from(_health.values());
}

export function getVenueToolsModuleHealth(moduleId: VenueToolsModuleId): VenueToolsHealthEntry | undefined {
  return _health.get(moduleId);
}

if (typeof globalThis !== "undefined") {
  initVenueToolsHealth();
}
