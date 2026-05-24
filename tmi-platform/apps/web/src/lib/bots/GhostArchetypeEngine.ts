/**
 * GhostArchetypeEngine
 * Bots with named archetypes, goal-directed behavior, self-optimization on failure,
 * and fade-out after repeated misses. Each archetype has a distinct personality
 * that shapes how it interacts with the platform.
 */

export type GhostState = 'ACTIVE' | 'OPTIMIZING' | 'FADING' | 'DORMANT' | 'REVIVED';

export interface GhostArchetype {
  id: string;
  name: string;
  archetype: 'HYPE_FAN' | 'CHILL_SUPPORTER' | 'BATTLE_INSTIGATOR' | 'BEAT_HUNTER' | 'STORY_TELLER' | 'ENERGY_SURGE' | 'SHADOW_JUDGE' | 'VENUE_SCOUT';
  goal: string;
  goalValue: number;
  hitCount: number;
  missCount: number;
  consecutiveMisses: number;
  state: GhostState;
  energyLevel: number;
  lastActionMs: number;
  createdAtMs: number;
  mutationCycle: number;
}

type ArchetypeAction = {
  type: 'energy_bump' | 'chat_drop' | 'vote_cast' | 'beat_highlight' | 'story_share' | 'tip_trigger' | 'challenge_issue' | 'venue_ping';
  payload: Record<string, unknown>;
  surface: string;
};

const ARCHETYPE_GOALS: Record<GhostArchetype['archetype'], string> = {
  HYPE_FAN:           'Bump room energy by +2 every 5 minutes',
  CHILL_SUPPORTER:    'Drop encouraging chat every 8 minutes',
  BATTLE_INSTIGATOR:  'Issue a challenge every 10 minutes during cypher',
  BEAT_HUNTER:        'Highlight a featured beat every 6 minutes',
  STORY_TELLER:       'Share an artist story every 12 minutes',
  ENERGY_SURGE:       'Trigger tip animation every 4 minutes',
  SHADOW_JUDGE:       'Cast a performance vote every 3 minutes',
  VENUE_SCOUT:        'Ping a venue match every 15 minutes',
};

const ARCHETYPE_INTERVALS: Record<GhostArchetype['archetype'], number> = {
  HYPE_FAN:           5 * 60_000,
  CHILL_SUPPORTER:    8 * 60_000,
  BATTLE_INSTIGATOR: 10 * 60_000,
  BEAT_HUNTER:        6 * 60_000,
  STORY_TELLER:      12 * 60_000,
  ENERGY_SURGE:       4 * 60_000,
  SHADOW_JUDGE:       3 * 60_000,
  VENUE_SCOUT:       15 * 60_000,
};

const MAX_CONSECUTIVE_MISSES = 5;
const FADE_MISS_THRESHOLD    = 3;
const DORMANT_ENERGY_FLOOR   = 10;
const REVIVAL_CHECK_INTERVAL = 30 * 60_000;

const ghosts = new Map<string, GhostArchetype>();
const listeners = new Set<(ghost: GhostArchetype) => void>();
let _initialized = false;

// ── Public API ────────────────────────────────────────────────────────────────

export function spawnGhost(
  id: string,
  archetype: GhostArchetype['archetype'],
  name?: string,
): GhostArchetype {
  const ghost: GhostArchetype = {
    id,
    name: name ?? `${archetype.toLowerCase().replace(/_/g, '-')}-${id.slice(-4)}`,
    archetype,
    goal: ARCHETYPE_GOALS[archetype],
    goalValue: ARCHETYPE_INTERVALS[archetype],
    hitCount: 0,
    missCount: 0,
    consecutiveMisses: 0,
    state: 'ACTIVE',
    energyLevel: 100,
    lastActionMs: Date.now(),
    createdAtMs: Date.now(),
    mutationCycle: 0,
  };
  ghosts.set(id, ghost);
  return ghost;
}

export function recordGhostHit(id: string): GhostArchetype | null {
  const ghost = ghosts.get(id);
  if (!ghost) return null;
  ghost.hitCount++;
  ghost.consecutiveMisses = 0;
  ghost.energyLevel = Math.min(100, ghost.energyLevel + 10);
  ghost.lastActionMs = Date.now();
  if (ghost.state === 'FADING' || ghost.state === 'OPTIMIZING') {
    ghost.state = 'ACTIVE';
  }
  _notify(ghost);
  return ghost;
}

export function recordGhostMiss(id: string): GhostArchetype | null {
  const ghost = ghosts.get(id);
  if (!ghost || ghost.state === 'DORMANT') return null;
  ghost.missCount++;
  ghost.consecutiveMisses++;
  ghost.energyLevel = Math.max(0, ghost.energyLevel - 15);

  if (ghost.consecutiveMisses >= MAX_CONSECUTIVE_MISSES) {
    ghost.state = 'DORMANT';
  } else if (ghost.consecutiveMisses >= FADE_MISS_THRESHOLD) {
    ghost.state = ghost.state !== 'FADING' ? 'FADING' : ghost.state;
    _selfOptimize(ghost);
  }
  _notify(ghost);
  return ghost;
}

export function getGhost(id: string): GhostArchetype | undefined {
  return ghosts.get(id);
}

export function getAllGhosts(): GhostArchetype[] {
  return Array.from(ghosts.values());
}

export function getActiveGhosts(): GhostArchetype[] {
  return Array.from(ghosts.values()).filter((g) => g.state === 'ACTIVE' || g.state === 'OPTIMIZING');
}

export function reviveGhost(id: string): boolean {
  const ghost = ghosts.get(id);
  if (!ghost || ghost.state !== 'DORMANT') return false;
  ghost.state = 'REVIVED';
  ghost.consecutiveMisses = 0;
  ghost.energyLevel = 50;
  ghost.mutationCycle++;
  setTimeout(() => {
    if (ghost.state === 'REVIVED') {
      ghost.state = 'ACTIVE';
      _notify(ghost);
    }
  }, 5000);
  _notify(ghost);
  return true;
}

export function subscribeGhosts(fn: (ghost: GhostArchetype) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function buildGhostAction(ghost: GhostArchetype): ArchetypeAction {
  switch (ghost.archetype) {
    case 'HYPE_FAN':
      return { type: 'energy_bump', payload: { delta: 2, source: ghost.id }, surface: 'ROOMS' };
    case 'CHILL_SUPPORTER':
      return { type: 'chat_drop', payload: { message: _encouragementLine(), source: ghost.id }, surface: 'ROOMS' };
    case 'BATTLE_INSTIGATOR':
      return { type: 'challenge_issue', payload: { challenger: ghost.id, surface: 'CYPHER' }, surface: 'CYPHER' };
    case 'BEAT_HUNTER':
      return { type: 'beat_highlight', payload: { ghost: ghost.id }, surface: 'BEAT_LAB' };
    case 'STORY_TELLER':
      return { type: 'story_share', payload: { ghost: ghost.id }, surface: 'HOME_1' };
    case 'ENERGY_SURGE':
      return { type: 'tip_trigger', payload: { amountUsd: 1, source: ghost.id }, surface: 'STAGE' };
    case 'SHADOW_JUDGE':
      return { type: 'vote_cast', payload: { ghost: ghost.id }, surface: 'PERFORMANCE' };
    case 'VENUE_SCOUT':
      return { type: 'venue_ping', payload: { ghost: ghost.id }, surface: 'BOOKING' };
  }
}

// ── Default ghost population ──────────────────────────────────────────────────

export function initializeGhostArchetypes(): void {
  if (_initialized) return;
  _initialized = true;

  const defaults: Array<[string, GhostArchetype['archetype'], string]> = [
    ['ghost-hype-01',    'HYPE_FAN',           'Hype Machine'],
    ['ghost-hype-02',    'HYPE_FAN',           'Gas Pedal'],
    ['ghost-chill-01',   'CHILL_SUPPORTER',    'Good Vibes Only'],
    ['ghost-chill-02',   'CHILL_SUPPORTER',    'The Encourager'],
    ['ghost-battle-01',  'BATTLE_INSTIGATOR',  'The Provocateur'],
    ['ghost-battle-02',  'BATTLE_INSTIGATOR',  'Bars or Go Home'],
    ['ghost-beat-01',    'BEAT_HUNTER',        'Sample Digger'],
    ['ghost-beat-02',    'BEAT_HUNTER',        'The Crate Digger'],
    ['ghost-story-01',   'STORY_TELLER',       'Origin Story'],
    ['ghost-surge-01',   'ENERGY_SURGE',       'The Catalyst'],
    ['ghost-surge-02',   'ENERGY_SURGE',       'Ignition'],
    ['ghost-judge-01',   'SHADOW_JUDGE',       'Silent Scorekeeper'],
    ['ghost-judge-02',   'SHADOW_JUDGE',       'The Arbiter'],
    ['ghost-venue-01',   'VENUE_SCOUT',        'Location Finder'],
  ];

  for (const [id, archetype, name] of defaults) {
    spawnGhost(id, archetype, name);
  }

  // Revival check loop
  setInterval(() => {
    for (const ghost of ghosts.values()) {
      if (ghost.state === 'DORMANT') {
        const dormantMs = Date.now() - ghost.lastActionMs;
        if (dormantMs > REVIVAL_CHECK_INTERVAL) {
          reviveGhost(ghost.id);
        }
      }
    }
  }, REVIVAL_CHECK_INTERVAL);
}

// ── Internals ─────────────────────────────────────────────────────────────────

function _selfOptimize(ghost: GhostArchetype): void {
  ghost.state = 'OPTIMIZING';
  ghost.mutationCycle++;
  // Slow down interval slightly on optimization to reduce misses
  ghost.goalValue = Math.round(ghost.goalValue * 1.25);
}

function _notify(ghost: GhostArchetype): void {
  for (const fn of listeners) {
    try { fn(ghost); } catch { /* ignore listener errors */ }
  }
}

const ENCOURAGEMENTS = [
  "You sound incredible tonight 🔥",
  "Keep going — this set is legendary",
  "The crowd is feeling every word",
  "Real talent right here 💯",
  "TMI is lucky to have you",
  "This is the one. Don't stop.",
  "The energy in here is unmatched",
];

function _encouragementLine(): string {
  return ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
}
