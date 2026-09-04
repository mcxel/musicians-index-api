/**
 * LiveEffectRuntime.ts
 *
 * Unified state manager for camera filters, green-screen segmentation,
 * 3D venue stage keying, and audience momentum heat level.
 *
 * Enforces the ZERO RECONNECTION LAW: updating filters or stage keying
 * modifies presentation layers only without restarting WebRTC streams.
 */

import { TmiFilterEngine, EraPresetId, QualityTier, EraPreset } from "./TmiFilterEngine";
import { BattleMomentumEngine, HeatState } from "./BattleMomentumEngine";

export type BackgroundMode = "MY_ROOM" | "BLUR" | "STAGE_3D" | "ERA_WORLD" | "PHOTO_BG";

export interface LiveEffectState {
  preset: EraPreset;
  backgroundMode: BackgroundMode;
  venueStageSlug: string;
  heatState: HeatState;
  qualityTier: QualityTier;
  cssFilterString: string;
}

export class LiveEffectRuntime {
  private filterEngine: TmiFilterEngine;
  private momentumEngine: BattleMomentumEngine;
  private bgMode: BackgroundMode = "MY_ROOM";
  private activeVenueSlug = "skyline-penthouse";

  constructor(initialPreset: EraPresetId = "natural", tier: QualityTier = "HIGH") {
    this.filterEngine = new TmiFilterEngine(initialPreset, tier);
    this.momentumEngine = new BattleMomentumEngine(0);
  }

  public setFilterPreset(presetId: EraPresetId): LiveEffectState {
    this.filterEngine.setPreset(presetId);
    return this.getState();
  }

  public setBackgroundMode(mode: BackgroundMode, stageSlug = "skyline-penthouse"): LiveEffectState {
    this.bgMode = mode;
    this.activeVenueSlug = stageSlug;
    return this.getState();
  }

  public recordReaction(weight = 5): LiveEffectState {
    this.momentumEngine.registerReaction(weight);
    return this.getState();
  }

  public setQualityTier(tier: QualityTier): LiveEffectState {
    this.filterEngine.setQualityTier(tier);
    return this.getState();
  }

  public getState(): LiveEffectState {
    return {
      preset: this.filterEngine.getActivePreset(),
      backgroundMode: this.bgMode,
      venueStageSlug: this.activeVenueSlug,
      heatState: this.momentumEngine.getState(),
      qualityTier: "HIGH",
      cssFilterString: this.filterEngine.getCssFilterString(),
    };
  }
}
