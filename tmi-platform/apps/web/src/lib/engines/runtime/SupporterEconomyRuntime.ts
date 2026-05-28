/**
 * SupporterEconomyRuntime
 * The visual payoff for spending money. Drives FOMO and reward loops.
 * Generates 3D visual explosions, updates the stage LED boards, 
 * and hooks into the CrowdCameraDirector.
 */

import { CrowdCameraDirector } from '../../cinematic/CrowdCameraDirector';

export interface TipEvent {
  userId: string;
  displayName: string;
  amountUsd: number;
  roomId: string;
}

export interface RoomContext {
  isSacredPerformanceMoment: boolean; // True during chorus, climax, emotional speech
  deviceVisualBudget: 'LOW' | 'MID' | 'HIGH';
}

export class SupporterEconomyRuntime {
  private cameraDirector: CrowdCameraDirector;
  private lastFocusCutAt: number = 0;
  private FOCUS_COOLDOWN_MS: number = 30000; // 30 seconds max 1 focus cut

  constructor(cameraDirector: CrowdCameraDirector) {
    this.cameraDirector = cameraDirector;
  }

  /**
   * Triggers the full audio-visual reward loop when money is spent.
   */
  public executeTipExplosion(event: TipEvent, roomContext: RoomContext) {
    // C. Emotional Weight Scaling
    let tier: 'SUBTLE' | 'PULSE' | 'ARENA' | 'GLOBAL' = 'SUBTLE';
    if (event.amountUsd >= 500) tier = 'GLOBAL';
    else if (event.amountUsd >= 100) tier = 'ARENA';
    else if (event.amountUsd >= 20) tier = 'PULSE';
    
    console.log(`[EconomyRuntime] ${tier} Tip Event: $${event.amountUsd} from ${event.displayName}`);

    // B. Visual Budget Governor
    this.triggerParticleSystem(tier, roomContext.deviceVisualBudget);

    // D. Camera Respect Logic & A. Tip Cooldown Governor
    if (tier === 'ARENA' || tier === 'GLOBAL') {
      
      if (roomContext.isSacredPerformanceMoment && tier !== 'GLOBAL') {
        console.log(`[EconomyRuntime] Sacred moment active. Suppressing camera cut for ${event.displayName}.`);
        return; // Do not interrupt performance unless it's a massive $500+ global pulse
      }

      const now = Date.now();
      if (now - this.lastFocusCutAt > this.FOCUS_COOLDOWN_MS || tier === 'GLOBAL') {
        this.lastFocusCutAt = now;
      console.log(`[EconomyRuntime] High-Tier Tip. Instructing Camera Director to cut to Supporter Focus.`);
      this.cameraDirector.evaluateNextCut({
        crowdEnergy: 1.0,
        recentTipAmount: event.amountUsd,
        activeSpeakerId: null,
        isChorusOrDrop: false,
        timeSinceLastCutMs: 10000,
      });
      } else {
        console.log(`[EconomyRuntime] Camera cooldown active. Cut suppressed.`);
      }
    }
  }

  private triggerParticleSystem(tier: string, visualBudget: 'LOW' | 'MID' | 'HIGH') {
    if (visualBudget === 'LOW') {
      // LOW Devices: Chat bursts only. Protect the GPU.
      return;
    }

    if (tier === 'GLOBAL' || tier === 'ARENA') {
      if (visualBudget === 'HIGH') {
        // HIGH Devices: Full holographic confetti and volumetric bloom
      } else {
        // MID Devices: Small localized eruptions
      }
    } else if (tier === 'PULSE') {
      // Subtle edge glows around the UI
    }
  }
}