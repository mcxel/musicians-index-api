/**
 * Song Challenge visual identity — work-vs-work contest stage.
 *
 * Distinct from Battle (cyan/fuchsia/red) and Cypher (purple/teal-purple).
 * Canon-safe: gold/amber + electric teal on dark-space.
 */

export const SONG_CHALLENGE_SKIN = {
  id: "song-challenge-work-vs-work",
  label: "SONG CHALLENGE",
  /** Side A — amber gold (work A) */
  sideA: "#FFB000",
  /** Side B — electric teal (work B) */
  sideB: "#00E5C8",
  /** Crown / winner / alert */
  crown: "#FFD700",
  /** Recruiting / needs / underlay pulse */
  underlay: "#FFAB00",
  /** Deep space base */
  bg: "#050510",
  bgRadial:
    "radial-gradient(ellipse at 50% 30%, rgba(255,176,0,0.14) 0%, rgba(0,229,200,0.06) 42%, rgba(5,5,16,1) 75%)",
  glass: "rgba(8,10,18,0.82)",
  textMuted: "rgba(255,255,255,0.45)",
  text: "#ffffff",
  /** VS badge — neither battle red nor cypher purple */
  vsBadge: "#FFB000",
  vsBadgeGlow: "rgba(255,176,0,0.45)",
  frameGlowA: "rgba(255,176,0,0.45)",
  frameGlowB: "rgba(0,229,200,0.45)",
} as const;

export type SongChallengeSkin = typeof SONG_CHALLENGE_SKIN;
