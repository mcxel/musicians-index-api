// packages/vr-engine/src/AvatarController.ts
// Manages user avatar in VR — movement, appearance, reactions, expressions.

export interface VRAvatarState {
  userId: string;
  displayName: string;
  loadout: AvatarLoadout3D;
  position: Vec3;
  rotation: Vec3;
  sceneId: string;
  seatSection?: string;
  seatNumber?: number;
  isSpeaking: boolean;
  currentEmote?: string;
  expressionBlend: ExpressionBlend;  // live face tracking if enabled
  isVIP: boolean;
  isHost: boolean;
}

export interface AvatarLoadout3D {
  baseModel: string;       // bobblehead style ID
  hat?: string;
  glasses?: string;
  chain?: string;
  jacket?: string;
  shirt?: string;
  pants?: string;
  shoes?: string;
  effect?: string;         // neon aura, smoke, etc
  emote?: string;
  idleAnimation: string;
}

export interface Vec3 { x: number; y: number; z: number; }

export interface ExpressionBlend {
  smile: number;     // 0-1
  surprise: number;
  cheer: number;
  concentration: number;
}

// ── AVATAR PLACEMENT RULES ────────────────────────────────
// VIP/Diamond users get front-row seats automatically
// Fans with most points get better seat sections
// Zero-viewers discovery law doesn't apply in VR (spatial placement instead)
export const AVATAR_PLACEMENT_RULES = {
  DIAMOND_section: "front_row",
  PLATINUM_section: "vip",
  GOLD_section: "reserved",
  PRO_section: "reserved",
  STARTER_section: "general_admission",
  FREE_section: "general_admission",
  hostSection: "stage",
  judgeSection: "judge_room",
} as const;

// ── CROWD WAVE ANIMATION ──────────────────────────────────
// Triggered by broadcaster command or hype threshold
export interface CrowdWaveEvent {
  sceneId: string;
  direction: "left_to_right" | "right_to_left" | "radial_from_stage";
  rippleSpeedMs: number;   // how fast wave propagates
  waveHeightUnits: number; // how high avatars jump
  triggerSource: "broadcaster" | "hype_threshold" | "winner_event";
}

// ── HAND TRACKING ─────────────────────────────────────────
export interface HandTrackingState {
  left: HandPose;
  right: HandPose;
}

export type HandPose =
  | "open" | "fist" | "point" | "thumbs_up" | "peace" | "clap" | "wave";

// Hand gestures trigger actions in VR
export const HAND_GESTURE_ACTIONS: Record<HandPose, string> = {
  open:      "browse",         // open hand = navigation mode
  fist:      "grab_interact",  // grab objects
  point:     "select",         // select / confirm
  thumbs_up: "like_react",     // like reaction
  peace:     "cheer_react",    // cheer reaction
  clap:      "clap_react",     // triggers clap sound
  wave:      "greet",          // wave at other avatars
};
