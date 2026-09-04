/**
 * VenueToolsDirector — single mutation bus for VENUE TOOLS (Rule 8).
 * All UI surfaces route through canonical commands — never call legacy engines directly.
 */

import {
  setLightingPreset,
  triggerEffect,
  clearEffect,
  setCameraAngle,
  showBannerText,
  clearBannerText,
  type StageEffect,
  type CameraAngle,
} from "@/lib/live/StageDirectorEngine";
import {
  initLighting,
  setPreset,
  setDimmingLevel,
  type LightingPreset,
} from "@/lib/venue/LightingMoodRuntime";
import { setVenueEnergy } from "@/lib/venue/VenueStateEngine";
import { getSceneDefinition } from "@/lib/venue/VenueToolsRegistry";
import { applyVenueCurtainCue, type VenueCurtainCueAction } from "@/lib/venue/VenueCurtainDirector";
import { reportVenueToolsModuleHealth } from "@/lib/venue/VenueToolsHealthRegistry";

export type VenueToolsCommand =
  | { type: "VENUE_LIGHTING_SET"; venueId: string; presetId: string }
  | { type: "VENUE_MOOD_SET"; venueId: string; preset: LightingPreset; lock?: boolean }
  | { type: "VENUE_DIMMER_SET"; venueId: string; level: number }
  | { type: "VENUE_SCENE_APPLY"; venueId: string; sceneId: string }
  | { type: "VENUE_FX_TRIGGER"; effect: StageEffect; intensity?: number }
  | { type: "VENUE_FX_CLEAR" }
  | { type: "VENUE_CAMERA_SET"; angle: CameraAngle }
  | { type: "VENUE_ENERGY_SET"; venueId: string; level: number }
  | { type: "VENUE_BANNER_SHOW"; text: string; color?: string }
  | { type: "VENUE_BANNER_CLEAR" }
  | { type: "VENUE_CURTAIN_CUE"; venueId: string; sessionId: string; performerId: string; action: VenueCurtainCueAction; countdownSeconds?: number };

export interface VenueToolsCommandResult {
  ok: boolean;
  command: VenueToolsCommand["type"];
  error?: string;
}

const MOOD_MAP: Record<string, LightingPreset> = {
  "purple-wash": "full-production",
  "blue-arena": "stage-blue",
  "concert-red": "strobe-red",
  spotlight: "spotlight-white",
  "audience-glow": "party-mode",
  strobe: "strobe-red",
  blackout: "blackout",
  rainbow: "party-mode",
};

function ensureLighting(venueId: string): void {
  initLighting(venueId);
}

export function dispatchVenueToolsCommand(cmd: VenueToolsCommand): VenueToolsCommandResult {
  try {
    switch (cmd.type) {
      case "VENUE_LIGHTING_SET": {
        ensureLighting(cmd.venueId);
        setLightingPreset(cmd.presetId);
        const mood = MOOD_MAP[cmd.presetId];
        if (mood) setPreset(cmd.venueId, mood, true);
        reportVenueToolsModuleHealth("LIGHTING", "OK", { lastCommand: cmd.type });
        return { ok: true, command: cmd.type };
      }
      case "VENUE_MOOD_SET": {
        ensureLighting(cmd.venueId);
        setPreset(cmd.venueId, cmd.preset, cmd.lock ?? true);
        reportVenueToolsModuleHealth("MOOD", "OK", { lastCommand: cmd.type });
        return { ok: true, command: cmd.type };
      }
      case "VENUE_DIMMER_SET": {
        ensureLighting(cmd.venueId);
        setDimmingLevel(cmd.venueId, cmd.level);
        return { ok: true, command: cmd.type };
      }
      case "VENUE_SCENE_APPLY": {
        const scene = getSceneDefinition(cmd.sceneId);
        if (!scene) return { ok: false, command: cmd.type, error: `Unknown scene: ${cmd.sceneId}` };
        ensureLighting(cmd.venueId);
        setLightingPreset(scene.lightingPresetId);
        setPreset(cmd.venueId, scene.moodPreset, true);
        reportVenueToolsModuleHealth("SCENES", "OK", { lastCommand: cmd.type });
        reportVenueToolsModuleHealth("LIGHTING", "OK", { lastCommand: cmd.type });
        reportVenueToolsModuleHealth("MOOD", "OK", { lastCommand: cmd.type });
        return { ok: true, command: cmd.type };
      }
      case "VENUE_FX_TRIGGER":
        triggerEffect(cmd.effect, cmd.intensity ?? 1);
        return { ok: true, command: cmd.type };
      case "VENUE_FX_CLEAR":
        clearEffect();
        return { ok: true, command: cmd.type };
      case "VENUE_CAMERA_SET":
        setCameraAngle(cmd.angle);
        return { ok: true, command: cmd.type };
      case "VENUE_ENERGY_SET":
        setVenueEnergy(cmd.venueId, cmd.level);
        return { ok: true, command: cmd.type };
      case "VENUE_BANNER_SHOW":
        showBannerText(cmd.text, cmd.color);
        return { ok: true, command: cmd.type };
      case "VENUE_BANNER_CLEAR":
        clearBannerText();
        return { ok: true, command: cmd.type };
      case "VENUE_CURTAIN_CUE": {
        const result = applyVenueCurtainCue({
          venueId: cmd.venueId,
          sessionId: cmd.sessionId,
          performerId: cmd.performerId,
          action: cmd.action,
          countdownSeconds: cmd.countdownSeconds,
        });
        return result.ok
          ? { ok: true, command: cmd.type }
          : { ok: false, command: cmd.type, error: result.error };
      }
      default:
        return { ok: false, command: "VENUE_LIGHTING_SET", error: "Unknown command" };
    }
  } catch (err) {
    return {
      ok: false,
      command: cmd.type,
      error: err instanceof Error ? err.message : "Venue command failed",
    };
  }
}

/** Convenience wrappers used by VenueToolsPanel */
export function venueSetLighting(venueId: string, presetId: string): VenueToolsCommandResult {
  return dispatchVenueToolsCommand({ type: "VENUE_LIGHTING_SET", venueId, presetId });
}

export function venueSetMood(venueId: string, preset: LightingPreset): VenueToolsCommandResult {
  return dispatchVenueToolsCommand({ type: "VENUE_MOOD_SET", venueId, preset, lock: true });
}

export function venueSetDimmer(venueId: string, level: number): VenueToolsCommandResult {
  return dispatchVenueToolsCommand({ type: "VENUE_DIMMER_SET", venueId, level });
}

export function venueApplyScene(venueId: string, sceneId: string): VenueToolsCommandResult {
  return dispatchVenueToolsCommand({ type: "VENUE_SCENE_APPLY", venueId, sceneId });
}

export function venueTriggerFx(effect: StageEffect): VenueToolsCommandResult {
  return dispatchVenueToolsCommand({ type: "VENUE_FX_TRIGGER", effect });
}

export function venueSetCamera(angle: CameraAngle): VenueToolsCommandResult {
  return dispatchVenueToolsCommand({ type: "VENUE_CAMERA_SET", angle });
}

export function venueSetEnergy(venueId: string, level: number): VenueToolsCommandResult {
  return dispatchVenueToolsCommand({ type: "VENUE_ENERGY_SET", venueId, level });
}

/** Scene snapshot for preview / apply / rollback (revision-tracked). */
export interface VenueSceneSnapshot {
  venueId: string;
  sceneId: string;
  lightingPresetId: string;
  moodPreset: LightingPreset;
  revision: number;
  capturedAt: string;
}

let _lastKnownGoodScene: VenueSceneSnapshot | null = null;
let _previewScene: VenueSceneSnapshot | null = null;
let _revision = 0;

export function getLastKnownGoodScene(): VenueSceneSnapshot | null {
  return _lastKnownGoodScene;
}

export function getPreviewScene(): VenueSceneSnapshot | null {
  return _previewScene;
}

export function getSceneRevision(): number {
  return _revision;
}

function captureSceneSnapshot(venueId: string, sceneId: string): VenueSceneSnapshot {
  const scene = getSceneDefinition(sceneId);
  _revision += 1;
  return {
    venueId,
    sceneId,
    lightingPresetId: scene?.lightingPresetId ?? "purple-wash",
    moodPreset: scene?.moodPreset ?? "full-production",
    revision: _revision,
    capturedAt: new Date().toISOString(),
  };
}

/** Preview — applies scene without committing lastKnownGood. */
export function previewVenueScene(venueId: string, sceneId: string): VenueToolsCommandResult {
  const result = dispatchVenueToolsCommand({ type: "VENUE_SCENE_APPLY", venueId, sceneId });
  if (result.ok) {
    _previewScene = captureSceneSnapshot(venueId, sceneId);
  }
  return result;
}

/** Apply — commits scene and updates lastKnownGood. */
export function applyVenueScene(venueId: string, sceneId: string): VenueToolsCommandResult {
  const result = dispatchVenueToolsCommand({ type: "VENUE_SCENE_APPLY", venueId, sceneId });
  if (result.ok) {
    const snap = captureSceneSnapshot(venueId, sceneId);
    _lastKnownGoodScene = snap;
    _previewScene = null;
  }
  return result;
}

/** Rollback — restores lastKnownGood scene. */
export function rollbackVenueScene(): VenueToolsCommandResult {
  if (!_lastKnownGoodScene) {
    return { ok: false, command: "VENUE_SCENE_APPLY", error: "No lastKnownGoodScene to rollback" };
  }
  const { venueId, sceneId } = _lastKnownGoodScene;
  const result = dispatchVenueToolsCommand({ type: "VENUE_SCENE_APPLY", venueId, sceneId });
  if (result.ok) {
    _previewScene = null;
    _revision += 1;
  }
  return result;
}
