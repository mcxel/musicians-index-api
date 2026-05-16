export type HeatLevel = "cold" | "warm" | "hot" | "fire" | "inferno";

export interface CrowdHeatState {
  venueId: string;
  heat: number;
  level: HeatLevel;
  peakHeat: number;
  reactionVelocity: number;
  activeReactions: number;
  audienceCount: number;
  updatedAt: string;
}

const heatStates = new Map<string, CrowdHeatState>();

function levelFromHeat(heat: number): HeatLevel {
  if (heat < 20) return "cold";
  if (heat < 40) return "warm";
  if (heat < 65) return "hot";
  if (heat < 85) return "fire";
  return "inferno";
}

export function initHeat(venueId: string, audienceCount = 0): CrowdHeatState {
  const state: CrowdHeatState = {
    venueId,
    heat: Math.min(10, audienceCount * 0.1),
    level: "cold",
    peakHeat: 0,
    reactionVelocity: 0,
    activeReactions: 0,
    audienceCount,
    updatedAt: new Date().toISOString(),
  };
  heatStates.set(venueId, state);
  return state;
}

export function getHeatState(venueId: string): CrowdHeatState {
  return heatStates.get(venueId) ?? initHeat(venueId);
}

export function addHeat(venueId: string, amount: number): CrowdHeatState {
  const state = getHeatState(venueId);
  const heat = Math.min(100, Math.max(0, state.heat + amount));
  const next: CrowdHeatState = {
    ...state,
    heat,
    level: levelFromHeat(heat),
    peakHeat: Math.max(state.peakHeat, heat),
    reactionVelocity: amount,
    activeReactions: state.activeReactions + 1,
    updatedAt: new Date().toISOString(),
  };
  heatStates.set(venueId, next);
  return next;
}

export function decayHeat(venueId: string, rate = 0.5): CrowdHeatState {
  const state = getHeatState(venueId);
  const heat = Math.max(0, state.heat - rate);
  const next: CrowdHeatState = {
    ...state,
    heat,
    level: levelFromHeat(heat),
    reactionVelocity: -rate,
    updatedAt: new Date().toISOString(),
  };
  heatStates.set(venueId, next);
  return next;
}

export function registerReaction(venueId: string, reactionWeight: number): CrowdHeatState {
  return addHeat(venueId, reactionWeight * 2);
}

export function setAudienceCount(venueId: string, count: number): CrowdHeatState {
  const state = getHeatState(venueId);
  const next = { ...state, audienceCount: count, updatedAt: new Date().toISOString() };
  heatStates.set(venueId, next);
  return next;
}

export function getHeatColor(level: HeatLevel): string {
  const map: Record<HeatLevel, string> = {
    cold:    "#0088FF",
    warm:    "#FFD700",
    hot:     "#FF9500",
    fire:    "#FF2DAA",
    inferno: "#FF0000",
  };
  return map[level];
}

export function resetHeat(venueId: string): void {
  heatStates.delete(venueId);
}
