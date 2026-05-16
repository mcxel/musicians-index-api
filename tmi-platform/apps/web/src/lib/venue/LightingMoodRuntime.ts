/**
 * LightingMoodRuntime
 * Drives venue lighting state based on stage energy, crowd mood, and show phase.
 * Produces lighting commands consumed by the venue visual layer.
 */

import { getVenueState, type VenuePhase } from "@/lib/venue/VenueStateEngine";
import { getStageEnergy } from "@/lib/venue/StageEnergyEngine";

export type LightingPreset =
  | "house-lights"
  | "lobby-warm"
  | "stage-blue"
  | "full-production"
  | "strobe-red"
  | "encore-gold"
  | "half-house"
  | "party-mode"
  | "battle-clash"
  | "spotlight-white"
  | "blackout"
  | "off";

export type LightingZone = "stage" | "house" | "vip" | "entrance" | "billboard";

export interface ZoneLighting {
  zone: LightingZone;
  preset: LightingPreset;
  intensity: number;    // 0-1
  color: string;        // hex
  strobing: boolean;
  pulseRate: number;    // pulses per second, 0 = none
}

export interface LightingState {
  venueId: string;
  masterPreset: LightingPreset;
  zones: ZoneLighting[];
  dimmingLevel: number;   // 0-1 overall dimmer
  fogActive: boolean;
  laserActive: boolean;
  autoMode: boolean;
  lockedPreset: LightingPreset | null;
  lastChangedAt: number;
}

type LightingListener = (state: LightingState) => void;

const PRESET_COLORS: Record<LightingPreset, { stage: string; house: string }> = {
  "house-lights":    { stage: "#ffffff", house: "#ffe8b0" },
  "lobby-warm":      { stage: "#ffcc66", house: "#ffb347" },
  "stage-blue":      { stage: "#00bfff", house: "#1a1a2e" },
  "full-production": { stage: "#ff00ff", house: "#0d0d2b" },
  "strobe-red":      { stage: "#ff2200", house: "#1a0000" },
  "encore-gold":     { stage: "#ffd700", house: "#2a1a00" },
  "half-house":      { stage: "#888888", house: "#444444" },
  "party-mode":      { stage: "#00ffcc", house: "#110033" },
  "battle-clash":    { stage: "#ff4444", house: "#0000aa" },
  "spotlight-white": { stage: "#ffffff", house: "#000000" },
  "blackout":        { stage: "#000000", house: "#000000" },
  "off":             { stage: "#000000", house: "#000000" },
};

const PHASE_PRESET_MAP: Record<VenuePhase, LightingPreset> = {
  "pre-doors":   "house-lights",
  "doors-open":  "lobby-warm",
  "warm-up":     "stage-blue",
  "main-show":   "full-production",
  "battle":      "battle-clash",
  "encore":      "encore-gold",
  "intermission":"half-house",
  "post-show":   "house-lights",
  "after-party": "party-mode",
  "closed":      "off",
};

const lightingStates = new Map<string, LightingState>();
const lightingListeners = new Map<string, Set<LightingListener>>();

function buildZones(preset: LightingPreset, energyScore: number): ZoneLighting[] {
  const colors = PRESET_COLORS[preset];
  const strobing = preset === "strobe-red" || (preset === "battle-clash" && energyScore > 80);
  const intensity = Math.min(1, 0.4 + energyScore / 100 * 0.6);

  const zones: LightingZone[] = ["stage", "house", "vip", "entrance", "billboard"];
  return zones.map(zone => ({
    zone,
    preset,
    intensity: zone === "stage" ? intensity : intensity * 0.7,
    color: zone === "stage" ? colors.stage : colors.house,
    strobing: strobing && zone === "stage",
    pulseRate: strobing ? 4 : 0,
  }));
}

function notify(venueId: string, state: LightingState): void {
  lightingListeners.get(venueId)?.forEach(l => l(state));
}

export function initLighting(venueId: string): LightingState {
  const state: LightingState = {
    venueId,
    masterPreset: "house-lights",
    zones: buildZones("house-lights", 0),
    dimmingLevel: 0.8,
    fogActive: false,
    laserActive: false,
    autoMode: true,
    lockedPreset: null,
    lastChangedAt: Date.now(),
  };
  lightingStates.set(venueId, state);
  return state;
}

export function syncLightingFromVenue(venueId: string): LightingState | null {
  const current = lightingStates.get(venueId);
  if (!current || current.lockedPreset) return current ?? null;

  const venue = getVenueState(venueId);
  const stage = getStageEnergy(venueId);
  const energyScore = stage?.energyScore ?? 0;
  const phase = venue?.phase ?? "pre-doors";
  const preset = PHASE_PRESET_MAP[phase];

  const updated: LightingState = {
    ...current,
    masterPreset: preset,
    zones: buildZones(preset, energyScore),
    fogActive: energyScore > 70 || preset === "full-production",
    laserActive: energyScore > 85 || preset === "encore-gold",
    lastChangedAt: Date.now(),
  };
  lightingStates.set(venueId, updated);
  notify(venueId, updated);
  return updated;
}

export function setPreset(venueId: string, preset: LightingPreset, lock = false): LightingState | null {
  const current = lightingStates.get(venueId);
  if (!current) return null;
  const energyScore = getStageEnergy(venueId)?.energyScore ?? 0;
  const updated: LightingState = {
    ...current,
    masterPreset: preset,
    zones: buildZones(preset, energyScore),
    lockedPreset: lock ? preset : null,
    autoMode: !lock,
    lastChangedAt: Date.now(),
  };
  lightingStates.set(venueId, updated);
  notify(venueId, updated);
  return updated;
}

export function unlockPreset(venueId: string): void {
  const current = lightingStates.get(venueId);
  if (!current) return;
  lightingStates.set(venueId, { ...current, lockedPreset: null, autoMode: true });
}

export function getLightingState(venueId: string): LightingState | null {
  return lightingStates.get(venueId) ?? null;
}

export function subscribeToLighting(venueId: string, listener: LightingListener): () => void {
  if (!lightingListeners.has(venueId)) lightingListeners.set(venueId, new Set());
  lightingListeners.get(venueId)!.add(listener);
  const current = lightingStates.get(venueId);
  if (current) listener(current);
  return () => lightingListeners.get(venueId)?.delete(listener);
}
