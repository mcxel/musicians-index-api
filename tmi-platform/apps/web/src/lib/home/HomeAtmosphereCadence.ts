export type HomeAtmosphereProfile = {
  sectionSweepSeconds: number;
  glowPulseSeconds: number;
  particleDriftSeconds: number;
  tickerDriftSeconds: number;
  spotlightDriftSeconds: number;
  hazeBreathSeconds: number;
  lanePulseSeconds: number;
  transitionCarryMs: number;
  easing: [number, number, number, number];
};

export type HomeAtmosphereKey = "home2" | "home3" | "home4" | "home5";

const PROFILE_BY_HOME: Record<HomeAtmosphereKey, HomeAtmosphereProfile> = {
  home2: {
    sectionSweepSeconds: 12.5,
    glowPulseSeconds: 5.6,
    particleDriftSeconds: 8.8,
    tickerDriftSeconds: 21,
    spotlightDriftSeconds: 10.4,
    hazeBreathSeconds: 7.4,
    lanePulseSeconds: 4.8,
    transitionCarryMs: 520,
    easing: [0.22, 0.8, 0.2, 1],
  },
  home3: {
    sectionSweepSeconds: 11.8,
    glowPulseSeconds: 4.9,
    particleDriftSeconds: 8.2,
    tickerDriftSeconds: 18.5,
    spotlightDriftSeconds: 7.8,
    hazeBreathSeconds: 6.5,
    lanePulseSeconds: 4.2,
    transitionCarryMs: 560,
    easing: [0.22, 0.8, 0.2, 1],
  },
  home4: {
    sectionSweepSeconds: 13.4,
    glowPulseSeconds: 6.2,
    particleDriftSeconds: 9.6,
    tickerDriftSeconds: 22.2,
    spotlightDriftSeconds: 9.8,
    hazeBreathSeconds: 7.8,
    lanePulseSeconds: 5.1,
    transitionCarryMs: 600,
    easing: [0.22, 0.8, 0.2, 1],
  },
  home5: {
    sectionSweepSeconds: 10.6,
    glowPulseSeconds: 4.2,
    particleDriftSeconds: 7.2,
    tickerDriftSeconds: 16.8,
    spotlightDriftSeconds: 6.9,
    hazeBreathSeconds: 5.9,
    lanePulseSeconds: 3.6,
    transitionCarryMs: 640,
    easing: [0.22, 0.8, 0.2, 1],
  },
};

export function getHomeAtmosphereCadence(key: HomeAtmosphereKey): HomeAtmosphereProfile {
  return PROFILE_BY_HOME[key];
}

export function withCadenceScale(value: number, scale = 1): number {
  return Math.max(0.001, value * Math.max(0.25, scale));
}

export function getContinuityDelayMs(
  key: HomeAtmosphereKey,
  sectionIndex: number,
  scale = 1
): number {
  const base = PROFILE_BY_HOME[key].transitionCarryMs;
  return Math.round(base * Math.max(0.35, scale) + sectionIndex * 90);
}

export function getCadenceSummary(key: HomeAtmosphereKey) {
  const p = PROFILE_BY_HOME[key];
  return {
    cinematicSweep: p.sectionSweepSeconds,
    pulse: p.glowPulseSeconds,
    drift: p.particleDriftSeconds,
    carryMs: p.transitionCarryMs,
  };
}
