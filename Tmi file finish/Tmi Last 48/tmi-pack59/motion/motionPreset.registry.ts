// apps/web/src/engines/homepage/motionPreset.registry.ts
// All motion presets for homepage cards, transitions, and scene changes.
// Import in components — do NOT scatter motion logic in UI files.

export type MotionPresetId =
  | "card_float"          // cards gently drift up/down
  | "card_orbit"          // cards slowly orbit around center
  | "card_swap"           // one card slides out, next slides in
  | "card_spotlight"      // crown/featured card pulses and expands
  | "card_rank_bounce"    // rank number bounces when position changes
  | "crown_travel"        // crown graphic moves between artists
  | "crown_pop_on"        // crown appears on artist head (3000ms)
  | "genre_cluster_in"    // genre cluster slides in from sides
  | "genre_cluster_out"   // genre cluster fades/scales out
  | "magazine_expand"     // magazine card expands to fill belt area
  | "magazine_page_turn"  // page-turn flip animation
  | "magazine_collapse"   // magazine shrinks back to card size
  | "scene_fade"          // simple fade between scenes
  | "scene_wipe_left"     // wipe transition left-to-right
  | "scene_neon_flash"    // neon glow flash on scene change
  | "cta_popup_in"        // CTA message slides up
  | "cta_popup_out"       // CTA message fades out
  | "ticker_scroll"       // horizontal scrolling ticker
  | "live_pulse"          // pulsing red live indicator
  | "rank_badge_in"       // rank change badge appears (+2, NEW, etc.)
  | "winner_confetti"     // winner moment confetti burst
  | "parallax_bg"         // background layers at different scroll speeds
  | "glow_pulse";         // neon glow intensity pulses

export interface MotionPreset {
  id: MotionPresetId;
  durationMs: number;
  easing: string;           // CSS easing or Framer Motion easing name
  cssAnimation?: string;    // CSS keyframe name if applicable
  delayMs?: number;
  repeatCount?: number | "infinite";
  description: string;
}

export const MOTION_PRESETS: Record<MotionPresetId, MotionPreset> = {
  card_float:          { id:"card_float",          durationMs:3000,  easing:"ease-in-out", repeatCount:"infinite", description:"Subtle vertical drift" },
  card_orbit:          { id:"card_orbit",          durationMs:8000,  easing:"linear",       repeatCount:"infinite", description:"Slow orbit around center point" },
  card_swap:           { id:"card_swap",           durationMs:600,   easing:"ease-out",     description:"Slide-out/slide-in card transition" },
  card_spotlight:      { id:"card_spotlight",      durationMs:1200,  easing:"ease-out",     description:"Scale up + glow for crown/featured card" },
  card_rank_bounce:    { id:"card_rank_bounce",    durationMs:400,   easing:"spring",       description:"Rank number bounces on position change" },
  crown_travel:        { id:"crown_travel",        durationMs:2000,  easing:"ease-in-out",  description:"Crown graphic arcs between artists" },
  crown_pop_on:        { id:"crown_pop_on",        durationMs:3000,  easing:"spring",       description:"Crown appears on artist (Platform Law: always 3000ms)" },
  genre_cluster_in:    { id:"genre_cluster_in",    durationMs:800,   easing:"ease-out",     description:"Genre cluster slides in from side" },
  genre_cluster_out:   { id:"genre_cluster_out",   durationMs:600,   easing:"ease-in",      description:"Genre cluster fades + scales out" },
  magazine_expand:     { id:"magazine_expand",     durationMs:700,   easing:"ease-out",     description:"Magazine card expands to fill scene" },
  magazine_page_turn:  { id:"magazine_page_turn",  durationMs:800,   easing:"ease-in-out",  description:"CSS 3D page turn flip" },
  magazine_collapse:   { id:"magazine_collapse",   durationMs:600,   easing:"ease-in",      description:"Magazine shrinks back to card" },
  scene_fade:          { id:"scene_fade",          durationMs:500,   easing:"ease-in-out",  description:"Simple opacity crossfade" },
  scene_wipe_left:     { id:"scene_wipe_left",     durationMs:700,   easing:"ease-out",     description:"Horizontal wipe transition" },
  scene_neon_flash:    { id:"scene_neon_flash",    durationMs:400,   easing:"ease-out",     description:"Neon glow burst on scene start" },
  cta_popup_in:        { id:"cta_popup_in",        durationMs:400,   easing:"spring",       description:"CTA card slides up from bottom" },
  cta_popup_out:       { id:"cta_popup_out",       durationMs:300,   easing:"ease-in",      description:"CTA fades and scales down" },
  ticker_scroll:       { id:"ticker_scroll",       durationMs:20000, easing:"linear",       repeatCount:"infinite", description:"Horizontal ticker scroll" },
  live_pulse:          { id:"live_pulse",          durationMs:1000,  easing:"ease-in-out",  repeatCount:"infinite", description:"Red live dot pulse" },
  rank_badge_in:       { id:"rank_badge_in",       durationMs:500,   easing:"spring",       description:"Rank change badge pops in" },
  winner_confetti:     { id:"winner_confetti",     durationMs:3000,  easing:"ease-out",     description:"Confetti burst for winner moment" },
  parallax_bg:         { id:"parallax_bg",         durationMs:12000, easing:"linear",       repeatCount:"infinite", description:"Slow background parallax" },
  glow_pulse:          { id:"glow_pulse",          durationMs:2000,  easing:"ease-in-out",  repeatCount:"infinite", description:"Neon glow intensity oscillation" },
};

export function getPreset(id: MotionPresetId): MotionPreset {
  return MOTION_PRESETS[id];
}

// CSS keyframes companion (inject into global styles)
export const MOTION_KEYFRAMES_CSS = `
@keyframes card-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
@keyframes glow-pulse { 0%,100% { box-shadow: 0 0 12px var(--accent); } 50% { box-shadow: 0 0 28px var(--accent); } }
@keyframes live-pulse { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
@keyframes ticker-scroll { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
@keyframes crown-pop { 0% { transform: scale(0) rotate(-20deg); opacity:0; } 60% { transform: scale(1.3) rotate(5deg); opacity:1; } 100% { transform: scale(1) rotate(0); opacity:1; } }
@keyframes rank-bounce { 0%,100% { transform: scale(1); } 50% { transform: scale(1.4); } }
@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
@keyframes confetti-fall { 0% { transform: translateY(-20px) rotate(0deg); opacity:1; } 100% { transform: translateY(80px) rotate(360deg); opacity:0; } }
`;
