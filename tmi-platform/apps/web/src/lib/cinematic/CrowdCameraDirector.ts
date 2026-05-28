/**
 * CrowdCameraDirector
 * Acts as an AI broadcast switcher. Evaluates room state and cuts between
 * different virtual camera angles to create broadcast television realism.
 */

export type BroadcastCameraAngle = 
  | 'hero-closeup'       // Tight on the performer
  | 'stage-wide'         // Standard stage view
  | 'crowd-reaction'     // Cutaway to the audience
  | 'front-row-pan'      // Cinematic sweep across the front row
  | 'supporter-focus'    // Picture-in-picture of a VIP tipper
  | 'venue-establishing';// Wide shot from the back of the room

interface RoomTelemetry {
  crowdEnergy: number; // 0 to 1
  recentTipAmount: number;
  activeSpeakerId: string | null;
  isChorusOrDrop: boolean;
  timeSinceLastCutMs: number;
}

export class CrowdCameraDirector {
  private currentAngle: BroadcastCameraAngle = 'stage-wide';
  
  /**
   * Evaluates telemetry and decides if the broadcast should cut to a new angle.
   */
  public evaluateNextCut(telemetry: RoomTelemetry): BroadcastCameraAngle {
    // Rule 1: Minimum cut duration (Don't give the audience whiplash)
    if (telemetry.timeSinceLastCutMs < 2500 && !telemetry.recentTipAmount) {
      return this.currentAngle;
    }

    // Rule 2: Follow the money (Supporter Highlight)
    // If someone drops a major tip/gift, cut to them or show a PIP
    if (telemetry.recentTipAmount > 50) {
      this.currentAngle = 'supporter-focus';
      return this.currentAngle;
    }

    // Rule 3: Energy Spikes (Beat drops, punchlines)
    if (telemetry.isChorusOrDrop || telemetry.crowdEnergy > 0.85) {
      // High energy = Wide sweeping shots or crowd reactions to show scale
      const highEnergyShots: BroadcastCameraAngle[] = ['venue-establishing', 'front-row-pan', 'crowd-reaction'];
      this.currentAngle = highEnergyShots[Math.floor(Math.random() * highEnergyShots.length)];
      return this.currentAngle;
    }

    // Rule 4: Intimate / Neutral moments
    if (telemetry.crowdEnergy < 0.4) {
      // Low energy = Tight, intimate focus on the performer
      this.currentAngle = 'hero-closeup';
      return this.currentAngle;
    }

    // Rule 5: Standard Broadcast Rotation
    // Default to a 70/30 split between performer focus and stage wide
    if (telemetry.timeSinceLastCutMs > 7000) {
      this.currentAngle = Math.random() > 0.3 ? 'hero-closeup' : 'stage-wide';
      return this.currentAngle;
    }

    return this.currentAngle;
  }
  
  /**
   * Generates the CSS/Framer-Motion transition parameters for the cut.
   */
  public getTransitionPhysics() {
    // E.g., 'front-row-pan' needs a slow, sweeping ease. 
    // 'hero-closeup' from 'crowd-reaction' needs a hard broadcast-style cut.
    return this.currentAngle === 'front-row-pan' 
      ? { ease: "linear", duration: 8 } 
      : { duration: 0 }; // Hard cut
  }
}