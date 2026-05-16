/**
 * TMI Simulation Engine
 * Drives the synthetic population — rankings, lobby walls, sponsor rotations,
 * room occupancy, streaming presence.  Pure TypeScript, no DOM dependency.
 * Wire to WebSockets or polling from the observatory page.
 */

// ─── Types ────────────────────────────────────────────────────────────────────
export type SimulationTick = {
  tickId: number;
  timestamp: number;
  activeBots: number;
  streamingBots: number;
  workingBots: number;
  browsingBots: number;
  idleBots: number;
  lobbyOccupancy: Record<string, number>;
  top10Snapshot: Top10Entry[];
  sponsorImpressions: SponsorImpression[];
  rankingDeltas: RankingDelta[];
};

export type Top10Entry = {
  rank: number;
  artistId: string;
  artistName: string;
  genre: string;
  points: number;
  trend: "up" | "down" | "same";
  crownHolder: boolean;
};

export type SponsorImpression = {
  sponsorId: string;
  slotId: string;
  impressions: number;
  clicks: number;
  ctr: number;
};

export type RankingDelta = {
  artistId: string;
  previousRank: number;
  newRank: number;
  pointsDelta: number;
};

export type SimulationScenario =
  | "baseline"          // normal platform activity
  | "crown-night"       // Monday night spike — top 10 pressure high
  | "sponsor-drop"      // sponsor activation — marketplace traffic high
  | "cypher-event"      // battle night — live rooms full
  | "dead-hour"         // low traffic simulation
  | "stress-test";      // max load — all bots active

// ─── Scenario configs ─────────────────────────────────────────────────────────
const scenarioConfig: Record<SimulationScenario, {
  streamingRatio: number;
  workingRatio: number;
  browsingRatio: number;
  sponsorMultiplier: number;
  rankingVolatility: number; // 0–1
}> = {
  baseline:      { streamingRatio: 0.35, workingRatio: 0.25, browsingRatio: 0.25, sponsorMultiplier: 1.0,  rankingVolatility: 0.15 },
  "crown-night": { streamingRatio: 0.60, workingRatio: 0.10, browsingRatio: 0.20, sponsorMultiplier: 1.8,  rankingVolatility: 0.55 },
  "sponsor-drop":{ streamingRatio: 0.20, workingRatio: 0.30, browsingRatio: 0.30, sponsorMultiplier: 3.5,  rankingVolatility: 0.10 },
  "cypher-event":{ streamingRatio: 0.70, workingRatio: 0.05, browsingRatio: 0.15, sponsorMultiplier: 2.2,  rankingVolatility: 0.40 },
  "dead-hour":   { streamingRatio: 0.05, workingRatio: 0.10, browsingRatio: 0.15, sponsorMultiplier: 0.4,  rankingVolatility: 0.05 },
  "stress-test": { streamingRatio: 0.90, workingRatio: 0.05, browsingRatio: 0.05, sponsorMultiplier: 5.0,  rankingVolatility: 0.80 },
};

// ─── Static seed data ─────────────────────────────────────────────────────────
const SEED_ARTISTS: Top10Entry[] = [
  { rank: 1, artistId: "nova-kane",   artistName: "Nova Kane",   genre: "Hip Hop",   points: 14200, trend: "up",   crownHolder: true  },
  { rank: 2, artistId: "ari-volt",    artistName: "Ari Volt",    genre: "R&B",       points: 13800, trend: "same", crownHolder: false },
  { rank: 3, artistId: "rhyme-lane",  artistName: "Rhyme Lane",  genre: "Hip Hop",   points: 12400, trend: "up",   crownHolder: false },
  { rank: 4, artistId: "echo-vee",    artistName: "Echo Vee",    genre: "Pop",       points: 11900, trend: "down", crownHolder: false },
  { rank: 5, artistId: "lex-royal",   artistName: "Lex Royal",   genre: "EDM",       points: 11200, trend: "up",   crownHolder: false },
  { rank: 6, artistId: "kato-drift",  artistName: "Kato Drift",  genre: "Afrobeats", points: 10800, trend: "same", crownHolder: false },
  { rank: 7, artistId: "juno-arc",    artistName: "Juno Arc",    genre: "R&B",       points: 10300, trend: "up",   crownHolder: false },
  { rank: 8, artistId: "pulse-ray",   artistName: "Pulse Ray",   genre: "Latin",     points:  9900, trend: "same", crownHolder: false },
  { rank: 9, artistId: "vera-cross",  artistName: "Vera Cross",  genre: "Pop",       points:  9400, trend: "down", crownHolder: false },
  { rank: 10, artistId: "dex-milo",   artistName: "Dex Milo",    genre: "EDM",       points:  8800, trend: "up",   crownHolder: false },
];

const LOBBY_ROOMS = ["Cypher Arena", "Live Stage 1", "World Stage", "Battle Ring", "Dance Floor", "Watch Party A"];

const SPONSOR_SLOTS: SponsorImpression[] = [
  { sponsorId: "soundwave-audio",    slotId: "billboard-hero",  impressions: 4820, clicks: 154, ctr: 0.032 },
  { sponsorId: "beatbox-pro",        slotId: "lobby-wall",      impressions: 2910, clicks: 79,  ctr: 0.027 },
  { sponsorId: "urban-pulse-records",slotId: "cypher-banner",   impressions: 1650, clicks: 68,  ctr: 0.041 },
];

// ─── Engine ───────────────────────────────────────────────────────────────────
let _tick = 0;
let _top10 = [...SEED_ARTISTS];
let _sponsors = SPONSOR_SLOTS.map((s) => ({ ...s }));
let _currentScenario: SimulationScenario = "baseline";

export function setScenario(scenario: SimulationScenario) {
  _currentScenario = scenario;
}

export function getCurrentScenario(): SimulationScenario {
  return _currentScenario;
}

/**
 * Advance the simulation by one tick.
 * Call every 5–10 seconds from a server-side cron or client polling interval.
 */
export function advanceTick(totalBots = 115): SimulationTick {
  _tick++;
  const cfg = scenarioConfig[_currentScenario];

  // Bot status distribution
  const streaming = Math.round(totalBots * cfg.streamingRatio);
  const working   = Math.round(totalBots * cfg.workingRatio);
  const browsing  = Math.round(totalBots * cfg.browsingRatio);
  const idle      = totalBots - streaming - working - browsing;

  // Lobby occupancy — distribute streaming bots across rooms
  const lobbyOccupancy: Record<string, number> = {};
  let remaining = streaming;
  LOBBY_ROOMS.forEach((room, i) => {
    const share = i === LOBBY_ROOMS.length - 1
      ? remaining
      : Math.round(remaining * (0.3 - i * 0.04));
    lobbyOccupancy[room] = Math.max(0, share);
    remaining -= lobbyOccupancy[room];
  });

  // Ranking pressure — apply small random deltas based on volatility
  const deltas: RankingDelta[] = [];
  if (Math.random() < cfg.rankingVolatility) {
    const idx = Math.floor(Math.random() * _top10.length);
    const delta = Math.floor(Math.random() * 400 * cfg.rankingVolatility);
    const prev = _top10[idx].points;
    _top10[idx].points += delta;
    _top10[idx].trend = delta > 0 ? "up" : delta < 0 ? "down" : "same";
    deltas.push({ artistId: _top10[idx].artistId, previousRank: idx + 1, newRank: idx + 1, pointsDelta: delta });
  }
  // Re-sort and re-rank
  _top10 = _top10
    .sort((a, b) => b.points - a.points)
    .map((e, i) => ({ ...e, rank: i + 1, crownHolder: i === 0 }));

  // Sponsor impression growth
  _sponsors = _sponsors.map((s) => ({
    ...s,
    impressions: s.impressions + Math.floor(Math.random() * 80 * cfg.sponsorMultiplier),
    clicks: s.clicks + Math.floor(Math.random() * 5 * cfg.sponsorMultiplier),
    get ctr() { return this.clicks / Math.max(1, this.impressions); },
  }));

  return {
    tickId: _tick,
    timestamp: Date.now(),
    activeBots: totalBots,
    streamingBots: streaming,
    workingBots: working,
    browsingBots: browsing,
    idleBots: Math.max(0, idle),
    lobbyOccupancy,
    top10Snapshot: [..._top10],
    sponsorImpressions: [..._sponsors],
    rankingDeltas: deltas,
  };
}

export function getTop10(): Top10Entry[] {
  return [..._top10];
}

export function getLobbyOccupancy(): Record<string, number> {
  const cfg = scenarioConfig[_currentScenario];
  const total = Math.round(115 * cfg.streamingRatio);
  const occ: Record<string, number> = {};
  let rem = total;
  LOBBY_ROOMS.forEach((room, i) => {
    const share = i === LOBBY_ROOMS.length - 1 ? rem : Math.round(rem * (0.3 - i * 0.04));
    occ[room] = Math.max(0, share);
    rem -= occ[room];
  });
  return occ;
}
