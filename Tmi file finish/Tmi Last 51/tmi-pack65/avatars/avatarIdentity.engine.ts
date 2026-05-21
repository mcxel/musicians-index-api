// apps/web/src/lib/avatars/avatarIdentity.engine.ts
// Transforms user identity into a stylized bobblehead avatar.
// Style rules: oversized head (1.5-2x body), smooth shading, cinematic lighting,
// expressive eyes, simplified features, slight gloss finish.
// ONE consistent style across ALL environments.

export interface AvatarStyle {
  headScale: number;        // 1.5 - 2.0 (bobblehead ratio)
  bodyType: "slim" | "average" | "broad";
  skinToneHex: string;      // preserved from user photo
  hairStyle: string;        // approximated from photo
  eyeSize: number;          // exaggerated (1.3-1.6x normal)
  expressionSet: AvatarExpression[];
  lightingPreset: string;   // "cinematic_soft" | "neon_stage" | "studio_warm"
  glossLevel: number;       // 0-1 slight gloss on skin
  outfitId: string;         // from item inventory
  accessories: string[];    // from item inventory
  heldItemId?: string;      // optional held item
}

export type AvatarExpression =
  | "neutral" | "happy" | "excited" | "surprised" | "focused"
  | "laughing" | "cheering" | "booing" | "thinking" | "dancing";

// THE UNIFIED STYLE RULES — never deviate from these
export const TMI_AVATAR_STYLE_RULES = {
  HEAD_SCALE_MIN: 1.5,
  HEAD_SCALE_MAX: 2.0,
  SHADING: "smooth_cel",
  LIGHTING: "cinematic_soft",
  EYE_EXAGGERATION: 1.4,
  GLOSS: 0.25,
  STYLE: "bobblehead_stylized",   // DO NOT use photorealism or flat cartoon
  TEXTURE: "clean_no_pores",
  OUTLINE: "subtle_2px",
} as const;

export interface AvatarProfile {
  userId: string;
  displayName: string;
  style: AvatarStyle;
  prestige: number;      // unlocks more expression options
  tier: string;          // affects outfit options
  equippedItems: string[];
  animations: string[];  // unlocked animation set
  lastUpdated: Date;
}

// Motion states for avatar in environments
export type AvatarMotionState =
  | "idle_sway"       // gentle bobblehead idle
  | "head_bounce"     // head physics bounce
  | "walk"
  | "dance_basic"
  | "dance_hype"
  | "clap"
  | "cheer"
  | "boo"
  | "wave"
  | "point"
  | "sit_idle"        // sitting in seat
  | "sit_react"       // reacting while seated
  | "jump";

export const AVATAR_MOTION_REGISTRY: Record<AvatarMotionState, { durationMs: number; loopable: boolean; triggeredBy: string }> = {
  idle_sway:    { durationMs:2000, loopable:true,  triggeredBy:"default" },
  head_bounce:  { durationMs:400,  loopable:false, triggeredBy:"event_reaction" },
  walk:         { durationMs:800,  loopable:true,  triggeredBy:"navigation" },
  dance_basic:  { durationMs:2000, loopable:true,  triggeredBy:"music_playing" },
  dance_hype:   { durationMs:1500, loopable:true,  triggeredBy:"crown_moment" },
  clap:         { durationMs:600,  loopable:false, triggeredBy:"applause_trigger" },
  cheer:        { durationMs:1000, loopable:false, triggeredBy:"cheer_vote" },
  boo:          { durationMs:800,  loopable:false, triggeredBy:"boo_vote" },
  wave:         { durationMs:1200, loopable:false, triggeredBy:"enter_room" },
  point:        { durationMs:600,  loopable:false, triggeredBy:"interactive_element" },
  sit_idle:     { durationMs:3000, loopable:true,  triggeredBy:"seated_in_venue" },
  sit_react:    { durationMs:500,  loopable:false, triggeredBy:"event_reaction" },
  jump:         { durationMs:600,  loopable:false, triggeredBy:"winner_moment" },
};
