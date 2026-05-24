/**
 * GiveawayEngine — canonical giveaway/prize pipeline for TMI.
 * Unified engine covering both sponsor giveaways and event-based drops.
 */

// ─── New canonical types ─────────────────────────────────────────────────────

export type GiveawayStatus = 'active' | 'ended' | 'drawing' | 'announced';
export type GiveawayTier   = 'open'   | 'member' | 'diamond';

export interface Giveaway {
  id: string;
  title: string;
  sponsorId: string;
  sponsorName: string;
  prize: string;
  prizeValueCents: number;
  entryDeadline: number; // unix ms
  status: GiveawayStatus;
  tier: GiveawayTier;
  totalEntries: number;
  winnerId?: string;
  winnerName?: string;
  imageUrl?: string;
  contestId?: string;
}

export interface GiveawayEntry {
  userId: string;
  giveawayId: string;
  enteredAt: number;
  source: 'organic' | 'sponsor-gift' | 'contest-win' | 'achievement';
}

export interface RecentWinner {
  winnerName: string;
  prize: string;
  sponsorName: string;
  announcedAt: number;
  giveawayId: string;
}

// ─── In-memory stores ────────────────────────────────────────────────────────

const _giveaways = new Map<string, Giveaway>();
const _entries   = new Map<string, GiveawayEntry[]>(); // keyed by giveawayId
const _byUser    = new Map<string, GiveawayEntry[]>(); // keyed by userId

// ─── Seed data ───────────────────────────────────────────────────────────────

export const SEED_GIVEAWAYS: Giveaway[] = [
  {
    id: 'gw-2025-001',
    title: 'BeatGear Pro Studio Bundle',
    sponsorId: 'sponsor-beatgear',
    sponsorName: 'BeatGear Co',
    prize: 'Pro Studio Bundle — Interface + Headphones + 12-Month Beat License',
    prizeValueCents: 89900,
    entryDeadline: Date.now() + 1000 * 60 * 60 * 47,
    status: 'active',
    tier: 'open',
    totalEntries: 1247,
    contestId: 'monday-cypher-s1-ep12',
  },
  {
    id: 'gw-2025-002',
    title: 'TMI VIP Season Pass + $500 Cash',
    sponsorId: 'sponsor-primewave',
    sponsorName: 'Prime Wave',
    prize: 'VIP Season Pass + $500 Sponsor Gift Card',
    prizeValueCents: 149900,
    entryDeadline: Date.now() + 1000 * 60 * 60 * 72,
    status: 'active',
    tier: 'member',
    totalEntries: 3812,
  },
  {
    id: 'gw-2025-003',
    title: 'Diamond Fan Club Lifetime Access',
    sponsorId: 'sponsor-freshthreads',
    sponsorName: 'FreshThreads NYC',
    prize: 'Lifetime Diamond Fan Club + Exclusive Merch Drop',
    prizeValueCents: 49900,
    entryDeadline: Date.now() + 1000 * 60 * 60 * 120,
    status: 'active',
    tier: 'diamond',
    totalEntries: 588,
  },
];

export const RECENT_WINNERS: RecentWinner[] = [
  {
    winnerName: 'KingWave_95',
    prize: 'Exclusive Beat Pack — 20 Tracks',
    sponsorName: 'Neon Vibe Records',
    announcedAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    giveawayId: 'gw-2025-000',
  },
  {
    winnerName: 'TiaMelody',
    prize: '$250 Studio Session Credit',
    sponsorName: 'AudioForge Labs',
    announcedAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
    giveawayId: 'gw-2025-prev-2',
  },
  {
    winnerName: 'FluxDrummer',
    prize: 'Roland TR-8S Drum Machine',
    sponsorName: 'BeatGear Co',
    announcedAt: Date.now() - 1000 * 60 * 60 * 24 * 9,
    giveawayId: 'gw-2025-prev-3',
  },
];

// Prime stores with seed data
for (const g of SEED_GIVEAWAYS) {
  _giveaways.set(g.id, { ...g });
  _entries.set(g.id, []);
}

// ─── Public API ──────────────────────────────────────────────────────────────

/** Create and store a new giveaway. */
export function createGiveaway(
  data: Omit<Giveaway, 'totalEntries'> & { totalEntries?: number }
): Giveaway {
  const giveaway: Giveaway = { totalEntries: 0, ...data };
  _giveaways.set(giveaway.id, giveaway);
  if (!_entries.has(giveaway.id)) _entries.set(giveaway.id, []);
  return giveaway;
}

/** Enter a user into a giveaway. Prevents duplicate entries. */
export function enterGiveaway(
  userId: string,
  giveawayId: string,
  source: GiveawayEntry['source'] = 'organic'
): { success: boolean; error?: string } {
  const g = _giveaways.get(giveawayId);
  if (!g) return { success: false, error: 'Giveaway not found.' };
  if (g.status !== 'active') return { success: false, error: 'Giveaway is not currently active.' };
  if (Date.now() > g.entryDeadline) return { success: false, error: 'Entry deadline has passed.' };

  const gEntries = _entries.get(giveawayId) ?? [];
  if (gEntries.some(e => e.userId === userId)) {
    return { success: false, error: 'You have already entered this giveaway.' };
  }

  const entry: GiveawayEntry = { userId, giveawayId, enteredAt: Date.now(), source };
  gEntries.push(entry);
  _entries.set(giveawayId, gEntries);

  const uEntries = _byUser.get(userId) ?? [];
  uEntries.push(entry);
  _byUser.set(userId, uEntries);

  g.totalEntries += 1;
  return { success: true };
}

/** Randomly draw a winner from all entries. Updates status to 'announced'. */
export function drawWinner(giveawayId: string): { winnerId: string } | { error: string } {
  const g = _giveaways.get(giveawayId);
  if (!g) return { error: 'Giveaway not found.' };
  if (g.status === 'announced') return { error: 'Winner already announced.' };

  const entries = _entries.get(giveawayId) ?? [];
  if (entries.length === 0) return { error: 'No entries to draw from.' };

  g.status = 'drawing';
  const winner = entries[Math.floor(Math.random() * entries.length)];
  g.winnerId = winner.userId;
  g.status = 'announced';
  return { winnerId: winner.userId };
}

/** Return all giveaways currently active and before deadline. */
export function getActiveGiveaways(): Giveaway[] {
  const now = Date.now();
  return [..._giveaways.values()].filter(
    g => g.status === 'active' && g.entryDeadline > now
  );
}

/** Return all entries for a user across all giveaways. */
export function getUserEntries(userId: string): GiveawayEntry[] {
  return _byUser.get(userId) ?? [];
}

/** Check if a user has already entered a specific giveaway. */
export function hasEnteredGiveaway(userId: string, giveawayId: string): boolean {
  return (_entries.get(giveawayId) ?? []).some(e => e.userId === userId);
}

/** Return all giveaways. */
export function getAllGiveaways(): Giveaway[] {
  return [..._giveaways.values()];
}

/** Lookup a single giveaway by id. */
export function getGiveaway(id: string): Giveaway | undefined {
  return _giveaways.get(id);
}

// ─── Formatting helpers ───────────────────────────────────────────────────────

/** Format cents to a dollar display string. */
export function formatPrizeValue(cents: number): string {
  return '$' + (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

/** Return ms remaining until deadline (floor 0). */
export function getDeadlineMs(entryDeadline: number): number {
  return Math.max(0, entryDeadline - Date.now());
}

/** Format a ms duration into a human-readable countdown string. */
export function formatCountdown(ms: number): string {
  if (ms <= 0) return 'Ended';
  const totalSec = Math.floor(ms / 1000);
  const d = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (d > 0) return d + 'd ' + h + 'h ' + m + 'm';
  if (h > 0) return h + 'h ' + m + 'm ' + s + 's';
  if (m > 0) return m + 'm ' + s + 's';
  return s + 's';
}

/** Format time remaining from an endAt timestamp (legacy compat). */
export function getTimeRemaining(endAt: number): string {
  return formatCountdown(getDeadlineMs(endAt));
}
