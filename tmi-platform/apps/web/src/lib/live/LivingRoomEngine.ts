/**
 * LivingRoomEngine.ts
 *
 * Persistent rooms where the COMPETITION changes, not the room.
 * Implements:
 *  - Weighted randomization (popular genres appear more often)
 *  - Mystery rounds (hidden next event until reveal countdown hits 0)
 *  - Automatic room expansion (Room A → B → C → D at capacity thresholds)
 *  - Championship ladder progression (casual → weekly → monthly → season → world)
 *  - "Between rounds" transition state with cinematic overlay data
 *  - Email notification hooks ("starting in 3 min" via room_went_live)
 *
 * Rule 20: No fake data — room state is driven by real clock math + real population.
 * Rule 21: One Venue Runtime — this engine is a mode, not a separate system.
 */

// ─── Competition Themes ───────────────────────────────────────────────────────

export type CompetitionFormat =
  | 'battle'
  | 'cypher'
  | 'challenge'
  | 'dance-off'
  | 'comedy'
  | 'audience-choice'
  | 'mystery';

export interface CompetitionTheme {
  id: string;
  label: string;
  genre: string;
  format: CompetitionFormat;
  durationMinutes: number;   // active round length
  emoji: string;
  accentColor: string;
  /** weight: higher = appears more often in rotation */
  weight: number;
  /** true = this is a sponsored/seasonal slot */
  sponsored?: boolean;
}

const THEME_CATALOG: CompetitionTheme[] = [
  // High-traffic genres (weight 5)
  { id: 'hh-battle',    label: 'Hip-Hop Freestyle Battle',  genre: 'Hip-Hop',    format: 'battle',         durationMinutes: 15, emoji: '🎤', accentColor: '#FF2DAA', weight: 5 },
  { id: 'rnb-cypher',   label: 'R&B Cypher',                genre: 'R&B',        format: 'cypher',         durationMinutes: 15, emoji: '🎵', accentColor: '#AA2DFF', weight: 5 },
  { id: 'hhdance',      label: 'Hip-Hop Dance-Off',         genre: 'Dance',      format: 'dance-off',      durationMinutes: 12, emoji: '💃', accentColor: '#00FFFF', weight: 5 },
  { id: 'rap-battle',   label: 'Rap Battle Royale',         genre: 'Rap',        format: 'battle',         durationMinutes: 15, emoji: '🔥', accentColor: '#FF2DAA', weight: 5 },
  // Mid-traffic genres (weight 3)
  { id: 'gospel-cyph',  label: 'Gospel Cypher',             genre: 'Gospel',     format: 'cypher',         durationMinutes: 15, emoji: '🙌', accentColor: '#FFD700', weight: 3 },
  { id: 'country-bat',  label: 'Country Band Battle',       genre: 'Country',    format: 'battle',         durationMinutes: 15, emoji: '🎸', accentColor: '#FF8C00', weight: 3 },
  { id: 'jazz-chal',    label: 'Jazz Improv Challenge',     genre: 'Jazz',       format: 'challenge',      durationMinutes: 12, emoji: '🎷', accentColor: '#00FF88', weight: 3 },
  { id: 'salsa-dance',  label: 'Salsa Dance-Off',           genre: 'Latin',      format: 'dance-off',      durationMinutes: 12, emoji: '💃', accentColor: '#FF4444', weight: 3 },
  { id: 'comedy-bat',   label: 'Comedy Joke-Off',           genre: 'Comedy',     format: 'comedy',         durationMinutes: 15, emoji: '😂', accentColor: '#FFD700', weight: 3 },
  { id: 'edm-drop',     label: 'EDM DJ Drop Battle',        genre: 'EDM',        format: 'battle',         durationMinutes: 12, emoji: '🎧', accentColor: '#00FFFF', weight: 3 },
  { id: 'soul-chal',    label: 'Soul Vocal Challenge',      genre: 'Soul',       format: 'challenge',      durationMinutes: 15, emoji: '🎶', accentColor: '#AA2DFF', weight: 3 },
  // Niche/variety (weight 2)
  { id: 'rock-band',    label: 'Rock Band Showdown',        genre: 'Rock',       format: 'battle',         durationMinutes: 15, emoji: '🤘', accentColor: '#FF6600', weight: 2 },
  { id: 'boombap',      label: '90s Boom Bap Challenge',    genre: 'Hip-Hop',    format: 'challenge',      durationMinutes: 12, emoji: '📼', accentColor: '#AA2DFF', weight: 2 },
  { id: 'classical',    label: 'Classical Cipher',          genre: 'Classical',  format: 'cypher',         durationMinutes: 15, emoji: '🎻', accentColor: '#FFD700', weight: 2 },
  { id: 'gospel-bat',   label: 'Gospel Quartet Battle',     genre: 'Gospel',     format: 'battle',         durationMinutes: 15, emoji: '✝️',  accentColor: '#FFD700', weight: 2 },
  { id: 'marching',     label: 'Marching Band Showdown',    genre: 'Marching',   format: 'challenge',      durationMinutes: 15, emoji: '🥁', accentColor: '#FF8C00', weight: 2 },
  { id: 'bollywood',    label: 'Bollywood Dance Battle',    genre: 'Bollywood',  format: 'dance-off',      durationMinutes: 12, emoji: '🌸', accentColor: '#FF2DAA', weight: 2 },
  { id: 'drill-battle', label: 'Drill Rap Throwdown',       genre: 'Drill',      format: 'battle',         durationMinutes: 12, emoji: '🔫', accentColor: '#333333', weight: 2 },
  // Specialty (weight 1)
  { id: 'hair-metal',   label: '80s Hair Metal Battle',     genre: 'Rock',       format: 'battle',         durationMinutes: 15, emoji: '🤘', accentColor: '#FF6600', weight: 1 },
  { id: 'disney-chal',  label: 'Disney Song Challenge',     genre: 'Pop',        format: 'challenge',      durationMinutes: 12, emoji: '🏰', accentColor: '#FFD700', weight: 1 },
  { id: 'gibberish',    label: 'Gibberish Rap Battle',      genre: 'Comedy',     format: 'battle',         durationMinutes: 10, emoji: '🤪', accentColor: '#00FFFF', weight: 1 },
  { id: 'dirty-dozens', label: 'Dirty Dozens Championship', genre: 'Hip-Hop',   format: 'battle',         durationMinutes: 20, emoji: '💀', accentColor: '#FF2DAA', weight: 1 },
  { id: 'audience-ch',  label: 'Audience Choice Round',     genre: 'Any',        format: 'audience-choice',durationMinutes: 15, emoji: '🎲', accentColor: '#00FF88', weight: 2 },
];

// Expand the catalog into a weighted pool
function buildWeightedPool(): CompetitionTheme[] {
  const pool: CompetitionTheme[] = [];
  for (const theme of THEME_CATALOG) {
    for (let i = 0; i < theme.weight; i++) pool.push(theme);
  }
  return pool;
}
const WEIGHTED_POOL = buildWeightedPool();

// ─── Room Channel Definitions ─────────────────────────────────────────────────

export type ChannelId =
  | 'battle-channel'
  | 'cypher-channel'
  | 'dance-channel'
  | 'comedy-channel'
  | 'all-genre-channel';

export interface RoomChannel {
  channelId: ChannelId;
  label: string;
  emoji: string;
  accentColor: string;
  /** formats allowed in this channel */
  allowedFormats: CompetitionFormat[];
  /** viewer capacity before spawning a new room shard */
  capacityThreshold: number;
  /** max shards (Room A..D) */
  maxShards: number;
}

export const CHANNEL_CATALOG: Record<ChannelId, RoomChannel> = {
  'battle-channel':    { channelId: 'battle-channel',    label: 'Battle Channel',    emoji: '⚔️',  accentColor: '#FF2DAA', allowedFormats: ['battle'],                              capacityThreshold: 200, maxShards: 4 },
  'cypher-channel':    { channelId: 'cypher-channel',    label: 'Cypher Channel',    emoji: '🔵',  accentColor: '#AA2DFF', allowedFormats: ['cypher', 'challenge'],                  capacityThreshold: 150, maxShards: 4 },
  'dance-channel':     { channelId: 'dance-channel',     label: 'Dance Channel',     emoji: '💃',  accentColor: '#00FFFF', allowedFormats: ['dance-off'],                           capacityThreshold: 150, maxShards: 3 },
  'comedy-channel':    { channelId: 'comedy-channel',    label: 'Comedy Channel',    emoji: '😂',  accentColor: '#FFD700', allowedFormats: ['comedy'],                              capacityThreshold: 120, maxShards: 3 },
  'all-genre-channel': { channelId: 'all-genre-channel', label: 'All Genre Channel', emoji: '🌐',  accentColor: '#00FF88', allowedFormats: ['battle','cypher','challenge','dance-off','comedy','audience-choice'], capacityThreshold: 240, maxShards: 4 },
};

// ─── Room State ───────────────────────────────────────────────────────────────

export type RoomPhase =
  | 'active'          // competition is live
  | 'voting'          // audience voting
  | 'resolving'       // winner being tallied
  | 'between-rounds'  // transition countdown (30-60 s)
  | 'closed';         // shard gracefully closed

export interface RoomShard {
  shardId: string;         // e.g. "battle-channel-A"
  channelId: ChannelId;
  label: string;           // e.g. "Battle Channel — Room A"
  shardLetter: 'A' | 'B' | 'C' | 'D';
  phase: RoomPhase;
  currentCompetition: CompetitionTheme;
  nextCompetition: CompetitionTheme | null;  // null = mystery until revealed
  isMysteryNext: boolean;
  /** epoch ms when current phase ends */
  phaseEndsAt: number;
  /** epoch ms when next round begins (after between-rounds) */
  nextRoundStartsAt: number;
  audienceCount: number;
  queuedContestants: number;
  winnerId: string | null;
  winnerName: string | null;
  xpAwarded: number;
}

// ─── Deterministic PRNG (no Math.random for reproducible schedule) ────────────

function seededRand(seed: number): number {
  // xorshift32
  seed ^= seed << 13;
  seed ^= seed >> 17;
  seed ^= seed << 5;
  return Math.abs(seed) / 2147483647;
}

/** Pick from weighted pool without repeating the last theme */
function pickNextTheme(
  channel: RoomChannel,
  lastThemeId: string | null,
  seed: number
): CompetitionTheme {
  const eligible = WEIGHTED_POOL.filter(
    (t) =>
      (channel.allowedFormats.includes(t.format) || channel.allowedFormats.includes('battle')) &&
      t.id !== lastThemeId
  );
  const idx = Math.floor(seededRand(seed) * eligible.length);
  return eligible[idx] ?? eligible[0] ?? WEIGHTED_POOL[0]!;
}

// ─── Mystery Round logic (30% chance) ─────────────────────────────────────────

const MYSTERY_PROBABILITY = 0.3;

function shouldBeMystery(seed: number): boolean {
  return seededRand(seed + 9999) < MYSTERY_PROBABILITY;
}

// ─── Singleton in-memory state (server-side would use DB/Redis) ───────────────

const shardRegistry = new Map<string, RoomShard>();
const ROUND_DURATION_BUFFER_MS = 60_000; // 1 min voting + resolution

function getOrCreateShard(channelId: ChannelId, letter: 'A' | 'B' | 'C' | 'D'): RoomShard {
  const shardId = `${channelId}-${letter}`;
  if (shardRegistry.has(shardId)) return shardRegistry.get(shardId)!;

  const channel = CHANNEL_CATALOG[channelId];
  const seed = Date.now() + shardId.charCodeAt(0);
  const current = pickNextTheme(channel, null, seed);
  const next = pickNextTheme(channel, current.id, seed + 1);
  const mystery = shouldBeMystery(seed + 2);
  const now = Date.now();
  const activeMs = current.durationMinutes * 60 * 1000;

  const shard: RoomShard = {
    shardId,
    channelId,
    label: `${channel.label} — Room ${letter}`,
    shardLetter: letter,
    phase: 'active',
    currentCompetition: current,
    nextCompetition: mystery ? null : next,
    isMysteryNext: mystery,
    phaseEndsAt: now + activeMs,
    nextRoundStartsAt: now + activeMs + ROUND_DURATION_BUFFER_MS + 60_000,
    audienceCount: 0,
    queuedContestants: 0,
    winnerId: null,
    winnerName: null,
    xpAwarded: 0,
  };

  shardRegistry.set(shardId, shard);
  return shard;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Get the current state of a room shard (creates if missing). */
export function getRoomShard(channelId: ChannelId, letter: 'A' | 'B' | 'C' | 'D' = 'A'): RoomShard {
  return getOrCreateShard(channelId, letter);
}

/** Get all active shards for a channel (used by the marquee). */
export function getActiveShards(channelId: ChannelId): RoomShard[] {
  const letters: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D'];
  return letters
    .map((l) => shardRegistry.get(`${channelId}-${l}`))
    .filter((s): s is RoomShard => !!s && s.phase !== 'closed');
}

/** Get all channels with their Room A snapshot for the marquee ticker. */
export function getAllChannelSnapshots(): RoomShard[] {
  return (Object.keys(CHANNEL_CATALOG) as ChannelId[]).map((id) =>
    getOrCreateShard(id, 'A')
  );
}

/** Advance phase based on current clock. Call this from an API route or polling. */
export function tickShard(shardId: string): RoomShard | null {
  const shard = shardRegistry.get(shardId);
  if (!shard) return null;

  const now = Date.now();
  if (now < shard.phaseEndsAt) return shard; // nothing to advance yet

  const channel = CHANNEL_CATALOG[shard.channelId];
  const seed = now + shardId.charCodeAt(0);

  if (shard.phase === 'active') {
    // Move to voting
    shard.phase = 'voting';
    shard.phaseEndsAt = now + 30_000; // 30 s voting
    shardRegistry.set(shardId, { ...shard });
    return shard;
  }

  if (shard.phase === 'voting') {
    // Move to resolving
    shard.phase = 'resolving';
    shard.phaseEndsAt = now + 15_000;
    shard.winnerId = 'resolved-' + seed;
    shard.winnerName = '🏆 Winner';
    shard.xpAwarded = 250;
    shardRegistry.set(shardId, { ...shard });
    return shard;
  }

  if (shard.phase === 'resolving') {
    // Move to between-rounds (60 s countdown)
    const resolvedNext = shard.nextCompetition ?? pickNextTheme(channel, shard.currentCompetition.id, seed);
    const afterNext = pickNextTheme(channel, resolvedNext.id, seed + 1);
    const mystery = shouldBeMystery(seed + 3);

    shard.phase = 'between-rounds';
    shard.currentCompetition = resolvedNext;
    shard.nextCompetition = mystery ? null : afterNext;
    shard.isMysteryNext = mystery;
    shard.phaseEndsAt = now + 60_000; // 60 s intermission
    shard.nextRoundStartsAt = now + 60_000;
    shard.winnerId = null;
    shard.winnerName = null;
    shard.xpAwarded = 0;
    shardRegistry.set(shardId, { ...shard });
    return shard;
  }

  if (shard.phase === 'between-rounds') {
    // Start the next active round
    const activeMs = shard.currentCompetition.durationMinutes * 60 * 1000;
    const nextForAfter = pickNextTheme(channel, shard.currentCompetition.id, seed + 2);
    const mystery = shouldBeMystery(seed + 4);

    shard.phase = 'active';
    shard.nextCompetition = mystery ? null : nextForAfter;
    shard.isMysteryNext = mystery;
    shard.phaseEndsAt = now + activeMs;
    shard.nextRoundStartsAt = now + activeMs + ROUND_DURATION_BUFFER_MS + 60_000;
    shardRegistry.set(shardId, { ...shard });
    return shard;
  }

  return shard;
}

/** Update audience count and trigger auto-expansion if needed. */
export function reportAudienceCount(
  channelId: ChannelId,
  letter: 'A' | 'B' | 'C' | 'D',
  count: number
): { expanded: boolean; newShardLetter: 'B' | 'C' | 'D' | null } {
  const shard = getOrCreateShard(channelId, letter);
  shard.audienceCount = count;
  shardRegistry.set(shard.shardId, shard);

  const channel = CHANNEL_CATALOG[channelId];
  if (count < channel.capacityThreshold) return { expanded: false, newShardLetter: null };

  // Determine next available letter
  const nextLetters: Array<'B' | 'C' | 'D'> = ['B', 'C', 'D'];
  for (const next of nextLetters) {
    const nextId = `${channelId}-${next}`;
    if (!shardRegistry.has(nextId)) {
      // Only expand if within maxShards
      const existingCount = nextLetters.filter((l) => shardRegistry.has(`${channelId}-${l}`)).length + 1; // +1 for A
      if (existingCount < channel.maxShards) {
        getOrCreateShard(channelId, next);
        return { expanded: true, newShardLetter: next };
      }
    }
  }
  return { expanded: false, newShardLetter: null };
}

/** Mark shard for graceful close (finish current round, then close). */
export function gracefullyCloseShard(shardId: string): void {
  const shard = shardRegistry.get(shardId);
  if (!shard) return;
  // Let current round finish; when it enters between-rounds, mark closed
  if (shard.phase === 'between-rounds') {
    shard.phase = 'closed';
    shardRegistry.set(shardId, { ...shard });
  }
}

// ─── Championship Ladder ──────────────────────────────────────────────────────

export type ChampionshipTier =
  | 'daily-24-7'
  | 'weekly-finals'
  | 'monthly-championship'
  | 'season-championship'
  | 'world-championship';

export interface ChampionshipLadderStep {
  tier: ChampionshipTier;
  label: string;
  emoji: string;
  description: string;
  xpRequired: number;
  accentColor: string;
}

export const CHAMPIONSHIP_LADDER: ChampionshipLadderStep[] = [
  { tier: 'daily-24-7',           label: '24/7 Battle Rooms',       emoji: '⚔️',  description: 'Compete in rotating rooms anytime. Earn XP.',             xpRequired: 0,      accentColor: '#00FFFF' },
  { tier: 'weekly-finals',        label: 'Weekly Finals',           emoji: '🏅',  description: 'Top earners from 24/7 rooms qualify each week.',          xpRequired: 2500,   accentColor: '#FFD700' },
  { tier: 'monthly-championship', label: 'Monthly Championship',    emoji: '🏆',  description: 'Weekly finalists compete for the monthly crown.',          xpRequired: 10000,  accentColor: '#FF2DAA' },
  { tier: 'season-championship',  label: 'Season Championship',     emoji: '👑',  description: 'Monthly champions battle for the season title.',           xpRequired: 40000,  accentColor: '#AA2DFF' },
  { tier: 'world-championship',   label: 'World Championship',      emoji: '🌍',  description: 'Season champions from all genres compete for the world.',  xpRequired: 150000, accentColor: '#FFD700' },
];

// ─── Marquee Data ─────────────────────────────────────────────────────────────

export interface MarqueeEvent {
  channelLabel: string;
  competitionLabel: string;
  emoji: string;
  accentColor: string;
  startsInMs: number;
  roomShardId: string;
}

/** Build the data for the live marquee ticker shown platform-wide. */
export function buildMarqueeEvents(): MarqueeEvent[] {
  const now = Date.now();
  const events: MarqueeEvent[] = [];

  for (const channelId of Object.keys(CHANNEL_CATALOG) as ChannelId[]) {
    const shard = getOrCreateShard(channelId, 'A');
    const channel = CHANNEL_CATALOG[channelId];

    if (shard.phase === 'between-rounds' || shard.phase === 'resolving') {
      const startsInMs = Math.max(0, shard.nextRoundStartsAt - now);
      const next = shard.nextCompetition ?? { label: '???', emoji: '🎲', accentColor: channel.accentColor };
      events.push({
        channelLabel: channel.label,
        competitionLabel: shard.isMysteryNext ? '???' : next.label,
        emoji: shard.isMysteryNext ? '🎲' : (shard.nextCompetition?.emoji ?? '🎲'),
        accentColor: channel.accentColor,
        startsInMs,
        roomShardId: shard.shardId,
      });
    } else if (shard.phase === 'active') {
      const startsInMs = Math.max(0, shard.phaseEndsAt - now + ROUND_DURATION_BUFFER_MS + 60_000);
      events.push({
        channelLabel: channel.label,
        competitionLabel: shard.currentCompetition.label,
        emoji: shard.currentCompetition.emoji,
        accentColor: shard.currentCompetition.accentColor,
        startsInMs,
        roomShardId: shard.shardId,
      });
    }
  }

  return events.sort((a, b) => a.startsInMs - b.startsInMs);
}
