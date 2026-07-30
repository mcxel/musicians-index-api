/**
 * EOS Runtime Validator — contract enforcement before StageLoader mounts.
 */

import type { ExperienceDefinition, EosValidationResult, RuntimeManifest } from "./types";
import { getExperienceById, EXPERIENCE_REGISTRY } from "@/registries/eos/ExperienceRegistry";
import { getVenueById } from "@/registries/eos/VenueRegistry";
import { getWidgetById } from "@/registries/eos/WidgetRegistry";
import { getCameraPackById } from "@/registries/eos/CameraRegistry";
import { getAnimationPackById } from "@/registries/eos/AnimationRegistry";

const REQUIRED_WIDGETS_BY_CATEGORY: Partial<Record<string, string[]>> = {
  BATTLE: ["voting_panel", "leaderboard"],
  CYPHER: ["queue_system"],
  CHALLENGE: ["round_timer"],
  STAGE_SHOW: ["crowd_meter"],
  // Broadcast Showcase Profile — performer card + crowd engagement + broadcast panel are non-negotiable.
  LIVE_SHOWCASE: ["performer_card", "crowd_meter", "broadcast_controls"],
  GAME_SHOW: ["prize_panel"],
  LOUNGE: ["presence_frame"],
  DANCE_PARTY: ["dj_booth"],
};

export function validateExperienceDefinition(def: ExperienceDefinition): EosValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  validateRequiredFields(def, errors);
  validateRegistryRefs(def, errors);
  validateWidgets(def, errors, warnings);
  validateAvatarMode(def, errors, warnings);

  return { valid: errors.length === 0, errors, warnings };
}

function validateRequiredFields(def: ExperienceDefinition, errors: string[]): void {
  if (!def.id?.trim()) errors.push("Experience id is required");
  if (!def.title?.trim()) errors.push("Experience title is required");
  if (!def.venueId) errors.push("venueId is required");
  if (!def.version?.trim()) errors.push("version is required");
  if (!def.entryRoute?.startsWith("/")) errors.push("entryRoute must be an absolute path");
}

function validateRegistryRefs(def: ExperienceDefinition, errors: string[]): void {
  if (!getVenueById(def.venueId)) errors.push(`Unknown venueId: ${def.venueId}`);
  if (!getCameraPackById(def.cameraPackId)) errors.push(`Unknown cameraPackId: ${def.cameraPackId}`);
  if (!getAnimationPackById(def.animationPackId)) errors.push(`Unknown animationPackId: ${def.animationPackId}`);
}

function validateWidgets(
  def: ExperienceDefinition,
  errors: string[],
  warnings: string[],
): void {
  for (const widgetId of def.widgetIds) {
    if (!getWidgetById(widgetId)) errors.push(`Unknown widgetId: ${widgetId}`);
  }
  for (const overlayId of def.overlayIds) {
    if (!getWidgetById(overlayId)) {
      warnings.push(`Overlay id not in WidgetRegistry (may be overlay-only): ${overlayId}`);
    }
  }
  const required = REQUIRED_WIDGETS_BY_CATEGORY[def.category] ?? [];
  for (const req of required) {
    if (!def.widgetIds.includes(req)) errors.push(`Category ${def.category} requires widget: ${req}`);
  }
}

function validateAvatarMode(
  def: ExperienceDefinition,
  errors: string[],
  warnings: string[],
): void {
  if (def.avatarMode === "presence_frame" && def.category !== "LOUNGE" && def.category !== "FAN_LOBBY") {
    warnings.push("presence_frame avatarMode is typically used for LOUNGE / FAN_LOBBY only");
  }
  if (def.avatarMode === "interactive" && def.category === "LOUNGE") {
    errors.push("LOUNGE experiences must use presence_frame avatarMode (no walking feet)");
  }
}

export function validateAllExperiences(): EosValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const def of Object.values(EXPERIENCE_REGISTRY)) {
    const result = validateExperienceDefinition(def);
    errors.push(...result.errors.map((e) => `[${def.id}] ${e}`));
    warnings.push(...result.warnings.map((w) => `[${def.id}] ${w}`));
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function validateRuntimeManifest(manifest: RuntimeManifest): EosValidationResult {
  const base = validateExperienceDefinition(manifest.experience);
  const errors = [...base.errors];
  const warnings = [...base.warnings];

  if (manifest.venue.venueType !== manifest.experience.venueId) {
    errors.push(
      `Venue mismatch: manifest venue ${manifest.venue.venueType} !== experience ${manifest.experience.venueId}`
    );
  }

  if (manifest.widgets.length !== manifest.experience.widgetIds.length) {
    warnings.push("Some widget IDs could not be resolved to WidgetDefinitions");
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function assertExperienceReady(experienceId: string): ExperienceDefinition {
  const def = getExperienceById(experienceId);
  if (!def) throw new Error(`EOS: Experience not found: ${experienceId}`);
  const result = validateExperienceDefinition(def);
  if (!result.valid) {
    throw new Error(`EOS: Experience contract failed [${experienceId}]: ${result.errors.join("; ")}`);
  }
  return def;
}
