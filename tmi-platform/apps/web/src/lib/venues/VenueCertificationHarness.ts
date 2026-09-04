// VenueCertificationHarness — evidence log schema for the 18-step physical gate.
// Evidence is written to packages/assets/generated/evidence/ by venueCertify.ts.

import type { VenueType } from "./VenueAssetRegistry";
import type { PresenceCertSnapshot } from "./VenuePresenceCertificationAdapter";

// 18 steps of the physical certification gate (from CLAUDE.md)
export const CERT_STEPS = [
  "production_glb_imported",
  "world_scale_verified",
  "collision_mesh_active",
  "navmesh_walkable",
  "seating_anchors_defined",
  "stage_audience_zones_defined",
  "camera_anchors_defined",
  "screen_anchors_defined",
  "venue_hud_mounted",
  "fan_avatar_entered",
  "performer_host_entered",
  "same_room_id_confirmed",
  "monitor_b_shows_fan",
  "movement_sit_stand_synced",
  "prop_equipment_synced",
  "disconnect_cleanup_verified",
  "has_canonical_3d_world_flipped",
  "fallback_mp4_suppressed_confirmed",
] as const;

export type CertStep = (typeof CERT_STEPS)[number];

export type StepResult =
  | { status: "PENDING" }
  | { status: "PASS"; notes?: string }
  | { status: "FAIL"; reason: string; failingStep: CertStep };

export interface CertificationEvidenceLog {
  venueId: VenueType;
  certificationVersion: number;
  sessionId: string;
  startedAt: string;
  completedAt: string | null;
  device1: { label: string; ua: string };
  device2: { label: string; ua: string };
  roomId: string;
  steps: Record<CertStep, StepResult>;
  presenceSnapshots: PresenceCertSnapshot[];
  finalVerdict: "PENDING" | "PASS" | "FAIL";
}

export function createEvidenceLogStub(
  venueId: VenueType,
  roomId: string,
  sessionId: string,
): CertificationEvidenceLog {
  const steps = Object.fromEntries(
    CERT_STEPS.map(s => [s, { status: "PENDING" } satisfies StepResult])
  ) as Record<CertStep, StepResult>;

  return {
    venueId,
    certificationVersion: 1,
    sessionId,
    startedAt: new Date().toISOString(),
    completedAt: null,
    device1: { label: "Device 1 (Fan)", ua: "" },
    device2: { label: "Device 2 (Performer/Host)", ua: "" },
    roomId,
    steps,
    presenceSnapshots: [],
    finalVerdict: "PENDING",
  };
}
