// Crown Cycle Engine — competitor orbit state and crown holder logic

export interface CrownContender {
  performerId: string;
  name: string;
  avatarUrl: string;
  votes: number;
  orbitAngle: number;       // 0–360 degrees, current angular position on orbit
  orbitRadius: number;      // px from center
  isCurrentCrown: boolean;
  route: string;
  profileRoute: string;
  articleRoute: string;
  hubRoute: string;
  xpRoute: string;
  battleRoute: string;
}

export interface CrownCycleState {
  genre: string;
  contenders: CrownContender[];
  crownHolder: CrownContender | null;
  battleActive: boolean;
  crownPulsePhase: "idle" | "cracking" | "dropping" | "crowning";
}

// Build orbit positions evenly spaced around a circle
export function buildOrbitPositions(count: number): number[] {
  return Array.from({ length: count }, (_, i) => (360 / count) * i);
}

// Advance orbit angles by `degPerTick` (call on each animation frame / interval)
export function tickOrbit(
  contenders: CrownContender[],
  degPerTick = 0.4
): CrownContender[] {
  return contenders.map((c) => ({
    ...c,
    orbitAngle: (c.orbitAngle + degPerTick) % 360,
  }));
}

// Determine crown holder — performer with most votes
export function resolveCrownHolder(
  contenders: CrownContender[]
): CrownContender | null {
  if (!contenders.length) return null;
  const winner = contenders.reduce((best, c) => (c.votes > best.votes ? c : best));
  return winner;
}

// Recompute isCurrentCrown flags from real vote counts — call after refreshing
// `contenders` from the real leaderboard/performers API, never on a timer with
// fabricated deltas (Rule 20 — no fake live vote counts).
export function recomputeCrownHolder(
  contenders: CrownContender[]
): CrownContender[] {
  const holder = resolveCrownHolder(contenders);
  return contenders.map((c) => ({
    ...c,
    isCurrentCrown: holder?.performerId === c.performerId,
  }));
}

// Build a contender record
export function makeContender(
  id: string,
  name: string,
  votes: number,
  avatarUrl: string,
  orbitAngle: number
): CrownContender {
  const slug = id.toLowerCase().replace(/\s+/g, "-");
  return {
    performerId: id,
    name,
    avatarUrl,
    votes,
    orbitAngle,
    orbitRadius: 180,
    isCurrentCrown: false,
    route:        `/artist/${slug}`,
    profileRoute: `/profile/${slug}`,
    articleRoute: `/article/${slug}`,
    hubRoute:     `/hub/${slug}`,
    xpRoute:      `/xp/${slug}`,
    battleRoute:  `/battle/${slug}`,
  };
}
