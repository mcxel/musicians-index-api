/**
 * SeasonPassSwapEngine
 * Maps the 5-Tier Reward Pyramid to internal XP/Credits.
 */

export const REWARD_PYRAMID = {
  XP: 0.70,
  STORE: 0.20,
  SPONSOR: 0.08,
  CASH: 0.02
};

export interface SeasonPassTierConfig {
  id: 'FREE' | 'RUBY' | 'SILVER' | 'GOLD' | 'PLATINUM';
  xpMultiplier: number;
  benefits: string[];
}

export const SEASON_PASS_CONFIG: Record<string, SeasonPassTierConfig> = {
  FREE:     { id: 'FREE',     xpMultiplier: 1.0, benefits: ['Watch Rooms', 'Vote', 'Basic Chat'] },
  RUBY:     { id: 'RUBY',     xpMultiplier: 1.5, benefits: ['+ Tips', 'Avatar Badge', 'Cypher Entry'] },
  SILVER:   { id: 'SILVER',   xpMultiplier: 2.0, benefits: ['+ Beat Battles', 'VIP Rooms', 'Merch Drops'] },
  GOLD:     { id: 'GOLD',     xpMultiplier: 2.5, benefits: ['+ Booking', 'Season Pass', 'Crown Voting'] },
  PLATINUM: { id: 'PLATINUM', xpMultiplier: 3.0, benefits: ['All Access', 'NFT Drops', 'Stage Slot'] },
};

export type PassInstrument =
  | "guitar"
  | "saxophone"
  | "trumpet"
  | "violin"
  | "drums"
  | "piano"
  | "bass"
  | "producer_pad"
  | "microphone";

export type PassTier = "FREE" | "RUBY" | "SILVER" | "GOLD" | "PLATINUM";

export type SwapStatus = "available" | "locked" | "cooldown" | "maxed";

export interface SeasonPass {
  userId: string;
  tier: PassTier;
  season: string;
  activeInstrument: PassInstrument;
  swapsRemaining: number;
  swapsUsed: number;
  maxSwaps: number;
  cooldownMinutes: number;
  lastSwapAt?: Date;
  unlockedInstruments: PassInstrument[];
  swapHistory: SwapRecord[];
}

export interface SwapRecord {
  from: PassInstrument;
  to: PassInstrument;
  swappedAt: Date;
  season: string;
}

export interface SwapResult {
  success: boolean;
  pass?: SeasonPass;
  error?: string;
  cooldownRemainingMs?: number;
}

export type ArchiveReason = "season_complete" | "manual" | "tier_upgrade";

export interface ArchivedPass {
  pass: SeasonPass;
  archivedAt: Date;
  reason: ArchiveReason;
  nextUnlock?: PassInstrument;
}

const TIER_CONFIG: Record<
  PassTier,
  { maxSwaps: number; cooldownMinutes: number; unlockedCount: number }
> = {
  FREE:     { maxSwaps: 0,  cooldownMinutes: 0,    unlockedCount: 1 },
  RUBY:   { maxSwaps: 2,  cooldownMinutes: 1440, unlockedCount: 2 },
  SILVER:   { maxSwaps: 4,  cooldownMinutes: 720,  unlockedCount: 4 },
  GOLD:     { maxSwaps: 8,  cooldownMinutes: 360,  unlockedCount: 7 },
  PLATINUM: { maxSwaps: 99, cooldownMinutes: 60,   unlockedCount: 9 },
};

const ALL_INSTRUMENTS: PassInstrument[] = [
  "guitar",
  "saxophone",
  "trumpet",
  "violin",
  "drums",
  "piano",
  "bass",
  "producer_pad",
  "microphone",
];

const _passes: Map<string, SeasonPass> = new Map();

export function createPass(
  userId: string,
  tier: PassTier,
  season: string,
  startingInstrument: PassInstrument = "guitar"
): SeasonPass {
  const config = TIER_CONFIG[tier];
  const pass: SeasonPass = {
    userId,
    tier,
    season,
    activeInstrument: startingInstrument,
    swapsRemaining: config.maxSwaps,
    swapsUsed: 0,
    maxSwaps: config.maxSwaps,
    cooldownMinutes: config.cooldownMinutes,
    unlockedInstruments: ALL_INSTRUMENTS.slice(0, config.unlockedCount),
    swapHistory: [],
  };
  _passes.set(userId, pass);
  return pass;
}

export function getPass(userId: string): SeasonPass | undefined {
  return _passes.get(userId);
}

export function getSwapStatus(userId: string): SwapStatus {
  const pass = _passes.get(userId);
  if (!pass) return "locked";
  if (pass.swapsRemaining === 0) return "maxed";
  if (pass.lastSwapAt) {
    const cooldownMs = pass.cooldownMinutes * 60 * 1000;
    if (Date.now() - pass.lastSwapAt.getTime() < cooldownMs) return "cooldown";
  }
  return "available";
}

export function swapInstrument(userId: string, toInstrument: PassInstrument): SwapResult {
  const pass = _passes.get(userId);
  if (!pass) return { success: false, error: "No active season pass found" };

  if (!pass.unlockedInstruments.includes(toInstrument)) {
    return { success: false, error: `${toInstrument} is not unlocked on this pass tier` };
  }
  if (pass.activeInstrument === toInstrument) {
    return { success: false, error: "Already playing that instrument" };
  }
  if (pass.swapsRemaining === 0) {
    return { success: false, error: "No swaps remaining this season" };
  }
  if (pass.lastSwapAt) {
    const cooldownMs = pass.cooldownMinutes * 60 * 1000;
    const elapsed = Date.now() - pass.lastSwapAt.getTime();
    if (elapsed < cooldownMs) {
      return { success: false, error: "Swap cooldown active", cooldownRemainingMs: cooldownMs - elapsed };
    }
  }

  const record: SwapRecord = {
    from: pass.activeInstrument,
    to: toInstrument,
    swappedAt: new Date(),
    season: pass.season,
  };

  const updated: SeasonPass = {
    ...pass,
    activeInstrument: toInstrument,
    swapsRemaining: pass.swapsRemaining - 1,
    swapsUsed: pass.swapsUsed + 1,
    lastSwapAt: new Date(),
    swapHistory: [...pass.swapHistory, record],
  };
  _passes.set(userId, updated);
  return { success: true, pass: updated };
}

export function resetSwaps(userId: string): boolean {
  const pass = _passes.get(userId);
  if (!pass) return false;
  const config = TIER_CONFIG[pass.tier];
  _passes.set(userId, {
    ...pass,
    swapsRemaining: config.maxSwaps,
    swapsUsed: 0,
    lastSwapAt: undefined,
  });
  return true;
}

export function getAllInstruments(): PassInstrument[] {
  return [...ALL_INSTRUMENTS];
}

export function getUnlockedInstruments(userId: string): PassInstrument[] {
  return _passes.get(userId)?.unlockedInstruments ?? [];
}

// Calculates the exact reward distribution according to the TMI rule: 
// Cash is the rarest output. Status, Store, and XP come first.
export function calculateRewards(battlePrizePool: number) {
  return {
    xp: Math.floor(battlePrizePool * REWARD_PYRAMID.XP),
    storeCredits: Math.floor(battlePrizePool * REWARD_PYRAMID.STORE),
    sponsorPrizeValue: Math.floor(battlePrizePool * REWARD_PYRAMID.SPONSOR),
    cashPayout: Math.floor(battlePrizePool * REWARD_PYRAMID.CASH),
  };
}

// ── Season archive + progression lane ────────────────────────────────────────
// Flow: season complete → archive pass → unlock next instrument
//       → apply new visual shell → reset progression lane

const _archive: Map<string, ArchivedPass[]> = new Map();

export function archivePass(userId: string, reason: ArchiveReason): ArchivedPass | null {
  const pass = _passes.get(userId);
  if (!pass) return null;

  const lockedInstruments = ALL_INSTRUMENTS.filter(
    (i) => !pass.unlockedInstruments.includes(i)
  );
  const nextUnlock = lockedInstruments[0];

  const archived: ArchivedPass = {
    pass,
    archivedAt: new Date(),
    reason,
    nextUnlock,
  };

  const existing = _archive.get(userId) ?? [];
  _archive.set(userId, [...existing, archived]);
  _passes.delete(userId);

  return archived;
}

export function progressToNextSeason(
  userId: string,
  newSeason: string,
  tier?: PassTier
): SeasonPass | null {
  const history = _archive.get(userId);
  if (!history || history.length === 0) return null;

  const last = history[history.length - 1]!;
  const effectiveTier = tier ?? last.pass.tier;
  const config = TIER_CONFIG[effectiveTier];

  const previouslyUnlocked = last.pass.unlockedInstruments;
  const nextUnlock = last.nextUnlock;
  const newUnlocked = nextUnlock
    ? [...new Set([...previouslyUnlocked, nextUnlock])].slice(0, config.unlockedCount)
    : previouslyUnlocked.slice(0, config.unlockedCount);

  const pass: SeasonPass = {
    userId,
    tier: effectiveTier,
    season: newSeason,
    activeInstrument: last.pass.activeInstrument,
    swapsRemaining: config.maxSwaps,
    swapsUsed: 0,
    maxSwaps: config.maxSwaps,
    cooldownMinutes: config.cooldownMinutes,
    unlockedInstruments: newUnlocked,
    swapHistory: [],
  };

  _passes.set(userId, pass);
  return pass;
}

export function getArchive(userId: string): ArchivedPass[] {
  return _archive.get(userId) ?? [];
}

export function getNextUnlock(userId: string): PassInstrument | undefined {
  const pass = _passes.get(userId);
  if (!pass) return undefined;
  return ALL_INSTRUMENTS.find((i) => !pass.unlockedInstruments.includes(i));
}
