// ============================================================
// AVATAR EVOLUTION ENGINE — Core Types
// TMI Platform — The Musicians Index
// ============================================================

export type AvatarRole = 'host' | 'cohost' | 'guest' | 'artist' | 'fan' | 'vip' | 'audience' | 'npc';

export type AvatarPoseState =
  | 'idle'
  | 'watching'
  | 'listening-left'
  | 'listening-right'
  | 'leaning-in'
  | 'reacting'
  | 'clapping'
  | 'laughing'
  | 'surprised'
  | 'talking'
  | 'whispering'
  | 'cheering'
  | 'booing'
  | 'host-speaking'
  | 'cohost-speaking'
  | 'intro-walk'
  | 'stage-entry'
  | 'seat-settle'
  | 'dance-loop'
  | 'crowd-sway'
  | 'mic-hold'
  | 'camera-look'
  | 'audience-look-left'
  | 'audience-look-right';

export type AvatarExpressionState =
  | 'neutral'
  | 'happy'
  | 'excited'
  | 'focused'
  | 'surprised'
  | 'laughing'
  | 'thinking'
  | 'nodding'
  | 'skeptical'
  | 'proud'
  | 'hyped';

export type AvatarVenueZone =
  | 'audience-seat'
  | 'stage-mark'
  | 'host-podium'
  | 'dj-booth'
  | 'interview-chair'
  | 'vip-balcony'
  | 'cypher-circle'
  | 'backstage-zone'
  | 'venue-walkway'
  | 'sponsor-booth'
  | 'contest-platform'
  | 'green-room'
  | 'front-row';

export type AvatarCostumeCategory =
  | 'casual'
  | 'stage'
  | 'vip'
  | 'cypher'
  | 'contest'
  | 'sponsor-branded'
  | 'themed-room'
  | 'uniform'
  | 'formal';

export type AvatarPropCategory =
  | 'microphone'
  | 'instrument'
  | 'sign'
  | 'glow-item'
  | 'handheld'
  | 'animated-accessory'
  | 'stage-prop';

export type AvatarEvolutionTier = 'starter' | 'rising' | 'established' | 'featured' | 'legendary';

export interface AvatarIdentity {
  id: string;
  userId: string;
  displayName: string;
  role: AvatarRole;
  tier: AvatarEvolutionTier;
  costumeId: string;
  propIds: string[];
  expressionPreset: string;
  posePreset: string;
  venueBinding?: AvatarVenueZone;
  memoryProfile?: AvatarMemoryProfile;
  createdAt: string;
  updatedAt: string;
}

export interface AvatarMemoryProfile {
  favoritePoseStyle: AvatarPoseState;
  reactionHistory: AvatarExpressionState[];
  venueHistory: AvatarVenueZone[];
  interactionCount: number;
  lastActiveVenue?: string;
  personalityTags: string[];
}

export interface AvatarPresenceState {
  avatarId: string;
  currentPose: AvatarPoseState;
  currentExpression: AvatarExpressionState;
  currentZone: AvatarVenueZone;
  attentionTarget?: string;
  isActive: boolean;
  isSpeaking: boolean;
  isReacting: boolean;
  roomId?: string;
  seatIndex?: number;
}

export interface AvatarBehaviorContext {
  roomId: string;
  activeSpeakerId?: string;
  stagePerformerId?: string;
  crowdMood: 'calm' | 'excited' | 'hyped' | 'quiet';
  lightingState: 'normal' | 'spotlight' | 'dim' | 'party';
  sceneIntensity: number; // 0-1
  applauseActive: boolean;
  reactionEventActive: boolean;
}
