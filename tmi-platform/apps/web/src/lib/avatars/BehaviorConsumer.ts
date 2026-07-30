/**
 * Behavior Consumer — Consumes behavioral signals for avatar animation layers.
 */

import type { IntentType } from './AnimationDirector';

export interface BehaviorWeights {
  excitement?: number;
  rhythmSync?: number;
  socialProximity?: number;
  comedyAffinity?: number;
  danceAffinity?: number;
  competitionIntensity?: number;
  socialParticipation?: number;
  musicResponsiveness?: number;
  calmness?: number;
  animationState?: IntentType;
  bubbleChance?: number;
  [key: string]: any;
}

export interface BehaviorSignal {
  avatarId: string;
  intensity: number;
  action: 'DANCE' | 'CHEER' | 'HIGH_FIVE' | 'SPRAY_MONEY' | 'JOIN_CIRCLE';
  targetAvatarId?: string;
  timestamp: number;
}

export function consumeBehaviorSignal(signal: BehaviorSignal): void {
  // Dispatches behavior signal to active avatar runtime
}

export function computeLiveAvatarState(avatarId: any, weights?: any, ref?: any, crowdEnergy?: any): BehaviorWeights {
  return {
    excitement: 0.85,
    rhythmSync: 0.9,
    socialProximity: 0.75,
    comedyAffinity: 0.5,
    danceAffinity: 0.8,
    competitionIntensity: 0.7,
    socialParticipation: 0.8,
    musicResponsiveness: 0.85,
    calmness: 0.3,
    animationState: 'STAND_AND_DANCE',
    bubbleChance: 0.2,
  };
}
