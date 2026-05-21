// packages/vr-engine/src/StadiumController.ts
// Controls the Stadium VR scene — The biggest experience on the platform.
// 10,000+ avatars, live concert, fireworks, sponsor boards, merch booths.

export interface StadiumConfig {
  eventId: string;
  capacity: number;
  sections: StadiumSection[];
  stageConfig: StageConfig;
  sponsorBoards: SponsorBoard[];
  merchBooths: MerchBooth[];
  fireworksRig: FireworksRig;
  bigScreens: BigScreen[];
  cameras: StadiumCamera[];
}

export interface StadiumSection {
  id: string;
  label: string;
  type: "general_admission" | "reserved" | "vip" | "sponsor_box";
  seatCount: number;
  occupied: number;
  colorCode: string;
  position3d: { x: number; y: number; z: number };
  radius: number;          // how many rows deep
  priceMultiplier: number;
}

export interface StageConfig {
  width: number;
  depth: number;
  height: number;
  hasRunway: boolean;
  hasCircularStage: boolean;
  lightingRig: "stadium" | "arena" | "festival" | "intimate";
  screenConfig: "center" | "triptych" | "circular";
  livestreamVideoUrl?: string;  // artist's HLS feed
}

export interface SponsorBoard {
  id: string;
  sponsorId: string;
  position3d: { x: number; y: number; z: number };
  size: "small" | "medium" | "large" | "giant";
  mediaType: "static_image" | "video_loop" | "interactive";
  mediaUrl: string;
  ctaUrl: string;
  isAnimated: boolean;
  impressionsPerSecond: number;  // feeds analytics
}

export interface BigScreen {
  id: string;
  position: "center" | "left" | "right" | "rear";
  width: number;
  height: number;
  content: "livestream" | "leaderboard" | "crowd_cam" | "sponsor_ad" | "replay";
  switchable: boolean;  // host can change what's on screen
}

export interface FireworksRig {
  launchPositions: { x: number; y: number; z: number }[];
  triggerEvents: string[];  // "winner_reveal" | "crown_award" | "new_year"
  sequence: FireworkSequence[];
}

export interface FireworkSequence {
  delayMs: number;
  type: "burst" | "spiral" | "fountain" | "sparkle";
  color: string;
  heightUnits: number;
  soundCue: string;       // references audio catalog
}

export interface StadiumCamera {
  id: string;
  label: string;
  position3d: { x: number; y: number; z: number };
  target: "stage" | "crowd" | "vip" | "sponsor_board" | "overhead";
  canHostSwitch: boolean;    // host can select this camera
  autoTrigger?: string;      // auto-switch to this camera on event
}

// ── GPU INSTANCING FOR 10,000+ AVATARS ───────────────────
// Use Three.js InstancedMesh to render massive crowds efficiently
export interface InstancedCrowdConfig {
  maxInstances: number;         // 10000 for stadium
  lod_distances: {             // Level of Detail distances (meters)
    full_quality: 30,          // < 30m: full avatar detail
    medium_quality: 80,        // 30-80m: reduced detail
    billboard: 200,            // 80-200m: 2D billboard sprite
    invisible: 500,            // > 500m: not rendered
  };
  bobblePhysics: boolean;       // heads bobble on beat
  reactionAnimations: boolean;  // crowd waves, cheers
  shadowCasting: false;         // disabled for performance
  batchSize: 1000;              // render in batches of 1000
}

// ── STADIUM INTEGRATION WITH PLATFORM ────────────────────
export const STADIUM_PLATFORM_HOOKS = {
  // When artist goes live → stadium spawns
  onArtistGoesLive: "spawn_stadium_from_livestream",
  // Ticket scan → user enters their VR seat section
  onTicketScanned: "place_avatar_in_section",
  // Tip → coin animation flies from avatar to stage
  onTip: "coin_fly_animation",
  // Hype reaches 100% → fireworks trigger
  onHypeMax: "trigger_fireworks",
  // Crown awarded → golden crown floats above stage
  onCrownAwarded: "crown_pop_on_stage",
  // Sponsor pays for billboard → board activates
  onSponsorActivated: "activate_sponsor_board",
  // Winner revealed → big screen shows winner, crowd wave
  onWinnerReveal: "winner_reveal_sequence",
} as const;
