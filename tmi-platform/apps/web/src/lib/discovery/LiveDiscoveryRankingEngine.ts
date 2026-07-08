type DiscoveryStatus = 'live' | 'starting' | 'ended';

type ExposureMemory = {
  lastDisplayedAt: number;
  displayFrequency: number;
};

export type LiveDiscoveryCandidate = {
  id: string;
  roomId: string;
  category: string;
  status: DiscoveryStatus;
  isBot: boolean;
  isJoinable: boolean;
  viewerCount: number;
  startedAt?: number;
  lastPingAt?: number;
  engagementScore?: number;
  geoDiversityScore?: number;
  followerCount?: number;
};

export type RankedLiveDiscoveryCandidate = LiveDiscoveryCandidate & {
  discoveryScore: number;
  discoveryGroup: 1 | 2 | 3 | 4 | 5 | 6;
};

const exposureBySurface = new Map<string, Map<string, ExposureMemory>>();

function memoryForSurface(surfaceKey: string): Map<string, ExposureMemory> {
  const existing = exposureBySurface.get(surfaceKey);
  if (existing) return existing;
  const created = new Map<string, ExposureMemory>();
  exposureBySurface.set(surfaceKey, created);
  return created;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function groupForCandidate(row: LiveDiscoveryCandidate): 1 | 2 | 3 | 4 | 5 | 6 {
  const category = row.category.toLowerCase();
  const openCompetition = category === 'battle' || category === 'cypher' || category === 'challenge';
  const openLounge = category === 'live' || category === 'concert' || category === 'session';

  if (!row.isBot && row.isJoinable && row.status === 'live') return 1;
  if (!row.isBot && row.isJoinable && openCompetition) return 2;
  if (!row.isBot && row.isJoinable && openLounge) return 3;
  if (!row.isBot && row.status === 'starting') return 4;
  if (row.isBot) return 5;
  return 6;
}

function groupWeight(group: 1 | 2 | 3 | 4 | 5 | 6): number {
  switch (group) {
    case 1: return 6000;
    case 2: return 5200;
    case 3: return 4600;
    case 4: return 3400;
    case 5: return 1800;
    case 6: return 800;
    default: return 0;
  }
}

function viewerDiscoveryBoost(viewerCount: number): number {
  // Balanced discovery bands: small rooms get a meaningful boost,
  // but larger rooms stay competitive and visible.
  if (viewerCount <= 5) return 28;
  if (viewerCount <= 25) return 18;
  if (viewerCount <= 100) return 12;
  return 8;
}

function viewerPopularityBoost(viewerCount: number): number {
  // Popularity contribution grows sub-linearly so high-view rooms do not dominate.
  return clamp(Math.log2(Math.max(1, viewerCount + 1)) * 6, 0, 42);
}

function freshnessBoost(now: number, startedAt?: number): number {
  if (!startedAt) return 6;
  const minutes = (now - startedAt) / 60000;
  return clamp(26 - minutes * 0.8, 0, 26);
}

function lastExposureBoost(now: number, memory?: ExposureMemory): number {
  if (!memory) return 20;
  const secs = (now - memory.lastDisplayedAt) / 1000;
  return clamp(secs / 3, 0, 20);
}

function frequencyPenalty(memory?: ExposureMemory): number {
  if (!memory) return 0;
  return clamp(memory.displayFrequency * 1.5, 0, 22);
}

function recencyPenalty(now: number, memory?: ExposureMemory): number {
  if (!memory) return 0;
  const secs = (now - memory.lastDisplayedAt) / 1000;
  if (secs < 15) return 24;
  if (secs < 30) return 10;
  return 0;
}

function botPenalty(isBot: boolean): number {
  return isBot ? 120 : 0;
}

function diversityJitter(id: string, category: string): number {
  const text = `${id}:${category}`;
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) hash = (hash * 33 + text.charCodeAt(i)) | 0;
  return (Math.abs(hash) % 100) / 100;
}

export function rankLiveDiscoveryCandidates(
  rows: LiveDiscoveryCandidate[],
  options?: { now?: number; surfaceKey?: string },
): RankedLiveDiscoveryCandidate[] {
  const now = options?.now ?? Date.now();
  const surfaceKey = options?.surfaceKey ?? 'global';
  const memory = memoryForSurface(surfaceKey);

  const scored = rows.map((row) => {
    const group = groupForCandidate(row);
    const exposure = memory.get(row.id);

    const score =
      groupWeight(group) +
      viewerDiscoveryBoost(row.viewerCount) +
      viewerPopularityBoost(row.viewerCount) +
      freshnessBoost(now, row.startedAt) +
      lastExposureBoost(now, exposure) -
      frequencyPenalty(exposure) -
      recencyPenalty(now, exposure) +
      clamp((row.engagementScore ?? 0) * 12, 0, 24) +
      clamp((row.geoDiversityScore ?? 0) * 8, 0, 12) +
      clamp(Math.log10(Math.max(1, row.followerCount ?? 1)) * 6, 0, 18) +
      diversityJitter(row.id, row.category) -
      botPenalty(row.isBot);

    return {
      ...row,
      discoveryScore: score,
      discoveryGroup: group,
    };
  });

  return scored.sort((a, b) => {
    if (b.discoveryScore !== a.discoveryScore) return b.discoveryScore - a.discoveryScore;
    if (b.viewerCount !== a.viewerCount) return b.viewerCount - a.viewerCount;
    return a.id.localeCompare(b.id);
  });
}

export function markDisplayedCandidates(rows: Array<Pick<LiveDiscoveryCandidate, 'id'>>, options?: { now?: number; surfaceKey?: string }): void {
  const now = options?.now ?? Date.now();
  const surfaceKey = options?.surfaceKey ?? 'global';
  const memory = memoryForSurface(surfaceKey);

  for (const row of rows) {
    const existing = memory.get(row.id);
    if (!existing) {
      memory.set(row.id, { lastDisplayedAt: now, displayFrequency: 1 });
      continue;
    }
    existing.lastDisplayedAt = now;
    existing.displayFrequency += 1;
  }
}
