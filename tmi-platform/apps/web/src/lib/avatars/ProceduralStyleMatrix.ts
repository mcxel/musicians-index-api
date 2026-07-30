/**
 * Procedural Style Matrix — Generates motion variation matrices for avatar dancers.
 */

export interface SwaggerProfile {
  swagger: string;
  intensityMultiplier: number;
  energy: number;
  posture: 'HYPER' | 'LAID_BACK' | 'BALANCED';
  timingOffsetMs: number;
}

export interface DanceStyleProfile {
  styleId: string;
  name: string;
  bpmMultiplier: number;
  energyLevel: number;
  motionTags: string[];
}

export const DANCE_STYLE_MATRIX: Record<string, DanceStyleProfile> = {
  hiphop: { styleId: 'hiphop', name: 'Hip-Hop Groove', bpmMultiplier: 1.0, energyLevel: 85, motionTags: ['bounce', 'nod', 'arm-wave'] },
  electronic: { styleId: 'electronic', name: 'Rave Strobe', bpmMultiplier: 1.25, energyLevel: 95, motionTags: ['step-touch', 'jump', 'glow-shake'] },
  chill: { styleId: 'chill', name: 'Lo-Fi Sway', bpmMultiplier: 0.75, energyLevel: 45, motionTags: ['side-sway', 'head-tilt'] },
  battle: { styleId: 'battle', name: 'Cypher Break', bpmMultiplier: 1.1, energyLevel: 100, motionTags: ['freeze', 'pop-lock', 'spin'] },
};

export function getDanceStyle(styleId: string): DanceStyleProfile {
  return DANCE_STYLE_MATRIX[styleId] || DANCE_STYLE_MATRIX['hiphop'];
}

export function getAvatarProceduralDNA(avatarId: string): any {
  return {
    swagger: 'GROOVE_HEAVY',
    intensityMultiplier: 1.2,
    energy: 85,
    posture: 'BALANCED',
    timingOffsetMs: 120,
  };
}
