/**
 * TIMING REGISTRY — single source of truth for all motion durations.
 * Every animation that exists on the platform MUST reference this file.
 * Do NOT use inline magic numbers for timing.
 */

export const TIMING = {
  // UI micro-interactions
  instant: 80,
  fast: 160,
  normal: 260,
  smooth: 360,
  slow: 520,

  // Homepage rotation loop
  top10Hold: 5000,          // hold each face/position for 5s
  homepagePageHold: 25000,  // hold full home page for ~25s before cycling
  starburstDuration: 600,   // genre-change burst window

  // Glitch effects (short, controlled bursts)
  glitchFlicker: 120,
  glitchBurst: 280,
  signalInterrupt: 380,
  scanlineCycle: 8000,

  // Sponsor / ad motion
  adHoverDelay: 400,
  adTakeoverIn: 480,
  adTakeoverOut: 340,
  ctaPulse: 900,

  // Magazine
  pageFlip: 520,
  pageSlide: 440,
  editorialPop: 320,

  // Admin / HUD
  monitorFade: 240,
  alertFlash: 200,
  warningPulse: 800,
  criticalFlash: 300,
  counterTick: 60,
  heartbeat: 1200,

  // Game / event
  winnerReveal: 680,
  prizeFlash: 420,
  voteImpact: 200,
  crowdReaction: 560,

  // Route / transition
  routeGlitch: 320,
  routeFade: 260,
  routeBlackout: 180,
} as const;

export type TimingKey = keyof typeof TIMING;

export function ms(key: TimingKey): string {
  return `${TIMING[key]}ms`;
}

export function sec(key: TimingKey): string {
  return `${(TIMING[key] / 1000).toFixed(2)}s`;
}
