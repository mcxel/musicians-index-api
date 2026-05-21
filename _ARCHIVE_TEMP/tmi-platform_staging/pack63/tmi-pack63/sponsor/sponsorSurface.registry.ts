// apps/web/src/engines/sponsor/sponsorSurface.registry.ts
// Every environment has defined sponsor surfaces.
// Ads rotate on screens. Artist intros show 3-sponsor stack. 
// Keep it production-quality — not spammy.

export type SponsorSurfaceId =
  | "MAIN_STAGE_SCREEN"     // big center screen on stage
  | "SIDE_PANEL_LEFT"
  | "SIDE_PANEL_RIGHT"
  | "LOBBY_SCREEN"
  | "OVERHEAD_RIBBON"       // banner wrap above seating
  | "BACKGROUND_WALL"       // full back wall display
  | "FLOOR_PROJECTION"      // dance floor projection
  | "PRE_SHOW_SCREEN"       // warmup/waiting screen
  | "ARTIST_INTRO_STACK"    // 3-sponsor badges on artist entrance
  | "POST_PERF_CREDIT"      // "This performance sponsored by..." end card
  | "SPONSOR_BILLBOARD";    // dedicated billboard surface

export type SponsorTier = "primary" | "secondary" | "standard";
export type SponsorSlotCount = 3;  // LOCKED: always 3 primary slots per event

export interface SponsorSurface {
  id: SponsorSurfaceId;
  label: string;
  supportsTypes: ("video" | "image" | "animation" | "text")[];
  maxDurationS: number;      // max ad/credit duration in seconds
  rotationIntervalS: number; // how often to swap (idle mode)
  isActiveOnPerformance: boolean;  // shows during active performance?
  priority: "high" | "medium" | "low";
  animationStyle: "fade" | "slide" | "pop" | "glow";
}

export const SPONSOR_SURFACE_REGISTRY: Record<SponsorSurfaceId, SponsorSurface> = {
  MAIN_STAGE_SCREEN:    { id:"MAIN_STAGE_SCREEN",    label:"Main Stage Screen",     supportsTypes:["video","image","animation"], maxDurationS:30, rotationIntervalS:20, isActiveOnPerformance:false, priority:"high",   animationStyle:"fade" },
  SIDE_PANEL_LEFT:      { id:"SIDE_PANEL_LEFT",       label:"Side Panel (Left)",     supportsTypes:["image","animation"],         maxDurationS:15, rotationIntervalS:15, isActiveOnPerformance:true,  priority:"medium", animationStyle:"slide" },
  SIDE_PANEL_RIGHT:     { id:"SIDE_PANEL_RIGHT",      label:"Side Panel (Right)",    supportsTypes:["image","animation"],         maxDurationS:15, rotationIntervalS:15, isActiveOnPerformance:true,  priority:"medium", animationStyle:"slide" },
  LOBBY_SCREEN:         { id:"LOBBY_SCREEN",          label:"Lobby Screen",          supportsTypes:["video","image","animation"], maxDurationS:30, rotationIntervalS:20, isActiveOnPerformance:false, priority:"high",   animationStyle:"fade" },
  OVERHEAD_RIBBON:      { id:"OVERHEAD_RIBBON",       label:"Overhead Ribbon Board", supportsTypes:["text","animation"],          maxDurationS:10, rotationIntervalS:10, isActiveOnPerformance:true,  priority:"low",    animationStyle:"slide" },
  BACKGROUND_WALL:      { id:"BACKGROUND_WALL",       label:"Background Wall",       supportsTypes:["video","image"],             maxDurationS:60, rotationIntervalS:60, isActiveOnPerformance:false, priority:"medium", animationStyle:"fade" },
  FLOOR_PROJECTION:     { id:"FLOOR_PROJECTION",      label:"Floor Projection",      supportsTypes:["animation"],                 maxDurationS:30, rotationIntervalS:30, isActiveOnPerformance:true,  priority:"low",    animationStyle:"pop" },
  PRE_SHOW_SCREEN:      { id:"PRE_SHOW_SCREEN",       label:"Pre-Show Screen",       supportsTypes:["video","image","animation"], maxDurationS:60, rotationIntervalS:30, isActiveOnPerformance:false, priority:"high",   animationStyle:"fade" },
  ARTIST_INTRO_STACK:   { id:"ARTIST_INTRO_STACK",    label:"Artist Intro Stack",    supportsTypes:["animation","text"],          maxDurationS:4,  rotationIntervalS:0,  isActiveOnPerformance:false, priority:"high",   animationStyle:"pop" },
  POST_PERF_CREDIT:     { id:"POST_PERF_CREDIT",      label:"Post-Performance Credit",supportsTypes:["animation","text"],         maxDurationS:5,  rotationIntervalS:0,  isActiveOnPerformance:false, priority:"high",   animationStyle:"glow" },
  SPONSOR_BILLBOARD:    { id:"SPONSOR_BILLBOARD",     label:"Sponsor Billboard",     supportsTypes:["video","image","animation"], maxDurationS:30, rotationIntervalS:20, isActiveOnPerformance:false, priority:"high",   animationStyle:"fade" },
};

// ── ENVIRONMENT → SURFACE MAP ────────────────────────────────────
export const ENVIRONMENT_SURFACES: Record<string, SponsorSurfaceId[]> = {
  "concert-hall":           ["MAIN_STAGE_SCREEN","SIDE_PANEL_LEFT","SIDE_PANEL_RIGHT","OVERHEAD_RIBBON","ARTIST_INTRO_STACK","POST_PERF_CREDIT"],
  "warehouse":              ["SIDE_PANEL_LEFT","SIDE_PANEL_RIGHT","OVERHEAD_RIBBON","ARTIST_INTRO_STACK","POST_PERF_CREDIT"],
  "tv-studio":              ["MAIN_STAGE_SCREEN","SIDE_PANEL_LEFT","SIDE_PANEL_RIGHT","PRE_SHOW_SCREEN","ARTIST_INTRO_STACK","POST_PERF_CREDIT"],
  "neon-club":              ["SIDE_PANEL_LEFT","SIDE_PANEL_RIGHT","FLOOR_PROJECTION","LOBBY_SCREEN","ARTIST_INTRO_STACK"],
  "festival":               ["MAIN_STAGE_SCREEN","BACKGROUND_WALL","OVERHEAD_RIBBON","SPONSOR_BILLBOARD","ARTIST_INTRO_STACK","POST_PERF_CREDIT"],
  "neon-announcement-stage":["MAIN_STAGE_SCREEN","SIDE_PANEL_LEFT","SIDE_PANEL_RIGHT","OVERHEAD_RIBBON","BACKGROUND_WALL","ARTIST_INTRO_STACK","POST_PERF_CREDIT","SPONSOR_BILLBOARD"],
  "game-show-box":          ["MAIN_STAGE_SCREEN","SIDE_PANEL_LEFT","SIDE_PANEL_RIGHT","PRE_SHOW_SCREEN","POST_PERF_CREDIT"],
  "trivia-podium":          ["MAIN_STAGE_SCREEN","SIDE_PANEL_LEFT","SIDE_PANEL_RIGHT","PRE_SHOW_SCREEN","POST_PERF_CREDIT"],
  "luxury-lounge":          ["LOBBY_SCREEN","BACKGROUND_WALL"],
};

// ── 3-SPONSOR STACK ARTIST INTRO ─────────────────────────────────
// When an artist enters the stage, their sponsors pop in (2-4s total) and fade clean.
// Platform Law: max 4s, never block artist face, no hard cuts.
export interface ArtistSponsorStack {
  artistId: string;
  sponsors: Array<{
    name: string;
    logoUrl: string;
    tier: SponsorTier;
    displayDurationMs: 3500;  // 3.5s total for all 3 to appear and fade
  }>;
}

export function buildArtistSponsorStack(artistId: string, sponsors: string[]): ArtistSponsorStack {
  return {
    artistId,
    sponsors: sponsors.slice(0, 3).map((name, i) => ({
      name,
      logoUrl: `/public/sponsors/${name.toLowerCase().replace(/ /g, "_")}/logo.png`,
      tier: (["primary","secondary","standard"] as SponsorTier[])[i],
      displayDurationMs: 3500,
    })),
  };
}
