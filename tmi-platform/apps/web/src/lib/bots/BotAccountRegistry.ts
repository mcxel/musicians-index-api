/**
 * BotAccountRegistry — canonical source of truth for bot performer accounts.
 *
 * These are placeholder ranking-seat holders: real profiles, real routes,
 * clearly labelled [BOT], with a provisional XP score that real users can
 * beat through genuine platform activity (Rule 3, Rule 20, Rule 21).
 *
 * Score cap + decay rules keep bot seats beatable:
 * - provisionalScore = the XP level the bot "holds" the seat at
 * - humanTakeoverThreshold = XP a real user needs to displace the bot
 * - Bots do NOT gain XP after placement; real users always catch up over time
 * - Once displaced, bot status becomes 'DISPLACED' and the seat is human-owned
 */

export type BotTier = 'FREE' | 'PRO' | 'RUBY' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';

export type BotAccountStatus = 'ACTIVE' | 'RETIRED' | 'DISPLACED';

export interface BotAssignment {
  category: string;
  rankPosition: number;
}

export interface BotAccount {
  id: string;
  slug: string;
  /** Always rendered as "[BOT] {displayName}" on any public surface */
  displayName: string;
  label: '[BOT]';
  bio: string;
  profileRoute: string;
  avatarUrl: string;
  genres: string[];
  tier: BotTier;
  /** XP the bot holds its seat at — never increases after placement */
  provisionalScore: number;
  /** XP a real user needs to displace this bot */
  humanTakeoverThreshold: number;
  assignments: BotAssignment[];
  status: BotAccountStatus;
  displacedByUserId?: string;
  displacedAt?: string;
  createdAt: string;
}

export const BOT_ACCOUNT_REGISTRY: BotAccount[] = [
  // ─── HIP-HOP ────────────────────────────────────────────────────────────────
  {
    id: 'bot-hiphop-001',
    slug: 'bot-hiphop-001',
    displayName: 'Lex Voltaire',
    label: '[BOT]',
    bio: 'Placeholder seat holder for Hip-Hop #1. Earn more XP to claim this crown.',
    profileRoute: '/bots/bot-hiphop-001',
    avatarUrl: '/tmi-curated/bot-avatar-01.png',
    genres: ['Hip-Hop'],
    tier: 'GOLD',
    provisionalScore: 8500,
    humanTakeoverThreshold: 9000,
    assignments: [{ category: 'hip-hop', rankPosition: 1 }],
    status: 'ACTIVE',
    createdAt: '2026-06-23',
  },
  {
    id: 'bot-hiphop-002',
    slug: 'bot-hiphop-002',
    displayName: 'Rhyme Diesel',
    label: '[BOT]',
    bio: 'Placeholder seat holder for Hip-Hop #2.',
    profileRoute: '/bots/bot-hiphop-002',
    avatarUrl: '/tmi-curated/bot-avatar-02.png',
    genres: ['Hip-Hop'],
    tier: 'SILVER',
    provisionalScore: 6200,
    humanTakeoverThreshold: 6500,
    assignments: [{ category: 'hip-hop', rankPosition: 2 }],
    status: 'ACTIVE',
    createdAt: '2026-06-23',
  },
  // ─── R&B / SOUL ────────────────────────────────────────────────────────────
  {
    id: 'bot-rnb-001',
    slug: 'bot-rnb-001',
    displayName: 'Velvet Monroe',
    label: '[BOT]',
    bio: 'Placeholder seat holder for R&B #1. Out-earn this bot to take the throne.',
    profileRoute: '/bots/bot-rnb-001',
    avatarUrl: '/tmi-curated/bot-avatar-03.png',
    genres: ['R&B', 'Soul'],
    tier: 'GOLD',
    provisionalScore: 8100,
    humanTakeoverThreshold: 8500,
    assignments: [{ category: 'rnb', rankPosition: 1 }],
    status: 'ACTIVE',
    createdAt: '2026-06-23',
  },
  {
    id: 'bot-rnb-002',
    slug: 'bot-rnb-002',
    displayName: 'Neo Silk',
    label: '[BOT]',
    bio: 'Placeholder seat holder for R&B #2.',
    profileRoute: '/bots/bot-rnb-002',
    avatarUrl: '/tmi-curated/bot-avatar-04.png',
    genres: ['R&B'],
    tier: 'SILVER',
    provisionalScore: 5800,
    humanTakeoverThreshold: 6200,
    assignments: [{ category: 'rnb', rankPosition: 2 }],
    status: 'ACTIVE',
    createdAt: '2026-06-23',
  },
  // ─── POP ───────────────────────────────────────────────────────────────────
  {
    id: 'bot-pop-001',
    slug: 'bot-pop-001',
    displayName: 'Aria Novela',
    label: '[BOT]',
    bio: 'Placeholder seat holder for Pop #1.',
    profileRoute: '/bots/bot-pop-001',
    avatarUrl: '/tmi-curated/bot-avatar-05.png',
    genres: ['Pop'],
    tier: 'GOLD',
    provisionalScore: 7900,
    humanTakeoverThreshold: 8300,
    assignments: [{ category: 'pop', rankPosition: 1 }],
    status: 'ACTIVE',
    createdAt: '2026-06-23',
  },
  // ─── ROCK ──────────────────────────────────────────────────────────────────
  {
    id: 'bot-rock-001',
    slug: 'bot-rock-001',
    displayName: 'Ivan Static',
    label: '[BOT]',
    bio: 'Placeholder seat holder for Rock #1.',
    profileRoute: '/bots/bot-rock-001',
    avatarUrl: '/tmi-curated/bot-avatar-06.png',
    genres: ['Rock'],
    tier: 'GOLD',
    provisionalScore: 7400,
    humanTakeoverThreshold: 7800,
    assignments: [{ category: 'rock', rankPosition: 1 }],
    status: 'ACTIVE',
    createdAt: '2026-06-23',
  },
  // ─── COUNTRY ───────────────────────────────────────────────────────────────
  {
    id: 'bot-country-001',
    slug: 'bot-country-001',
    displayName: 'Dusty Wren',
    label: '[BOT]',
    bio: 'Placeholder seat holder for Country #1.',
    profileRoute: '/bots/bot-country-001',
    avatarUrl: '/tmi-curated/bot-avatar-07.png',
    genres: ['Country'],
    tier: 'SILVER',
    provisionalScore: 6800,
    humanTakeoverThreshold: 7200,
    assignments: [{ category: 'country', rankPosition: 1 }],
    status: 'ACTIVE',
    createdAt: '2026-06-23',
  },
  // ─── GOSPEL ────────────────────────────────────────────────────────────────
  {
    id: 'bot-gospel-001',
    slug: 'bot-gospel-001',
    displayName: 'Grace Everly',
    label: '[BOT]',
    bio: 'Placeholder seat holder for Gospel #1.',
    profileRoute: '/bots/bot-gospel-001',
    avatarUrl: '/tmi-curated/bot-avatar-08.png',
    genres: ['Gospel'],
    tier: 'SILVER',
    provisionalScore: 6100,
    humanTakeoverThreshold: 6500,
    assignments: [{ category: 'gospel', rankPosition: 1 }],
    status: 'ACTIVE',
    createdAt: '2026-06-23',
  },
  // ─── EDM / DJ ──────────────────────────────────────────────────────────────
  {
    id: 'bot-edm-001',
    slug: 'bot-edm-001',
    displayName: 'Bass Phantom',
    label: '[BOT]',
    bio: 'Placeholder seat holder for EDM/DJ #1.',
    profileRoute: '/bots/bot-edm-001',
    avatarUrl: '/tmi-curated/bot-avatar-09.png',
    genres: ['EDM', 'DJ'],
    tier: 'GOLD',
    provisionalScore: 7700,
    humanTakeoverThreshold: 8100,
    assignments: [{ category: 'edm', rankPosition: 1 }],
    status: 'ACTIVE',
    createdAt: '2026-06-23',
  },
  // ─── JAZZ / BLUES ──────────────────────────────────────────────────────────
  {
    id: 'bot-jazz-001',
    slug: 'bot-jazz-001',
    displayName: 'Miles Copeland',
    label: '[BOT]',
    bio: 'Placeholder seat holder for Jazz/Blues #1.',
    profileRoute: '/bots/bot-jazz-001',
    avatarUrl: '/tmi-curated/bot-avatar-10.png',
    genres: ['Jazz', 'Blues'],
    tier: 'SILVER',
    provisionalScore: 5500,
    humanTakeoverThreshold: 5900,
    assignments: [{ category: 'jazz', rankPosition: 1 }],
    status: 'ACTIVE',
    createdAt: '2026-06-23',
  },
  // ─── COMEDY ────────────────────────────────────────────────────────────────
  {
    id: 'bot-comedy-001',
    slug: 'bot-comedy-001',
    displayName: 'Punchline Waverly',
    label: '[BOT]',
    bio: 'Placeholder seat holder for Comedy #1.',
    profileRoute: '/bots/bot-comedy-001',
    avatarUrl: '/tmi-curated/bot-avatar-11.png',
    genres: ['Comedy'],
    tier: 'SILVER',
    provisionalScore: 5900,
    humanTakeoverThreshold: 6300,
    assignments: [{ category: 'comedy', rankPosition: 1 }],
    status: 'ACTIVE',
    createdAt: '2026-06-23',
  },
  // ─── DANCE ─────────────────────────────────────────────────────────────────
  {
    id: 'bot-dance-001',
    slug: 'bot-dance-001',
    displayName: 'Nova Steppe',
    label: '[BOT]',
    bio: 'Placeholder seat holder for Dance #1.',
    profileRoute: '/bots/bot-dance-001',
    avatarUrl: '/tmi-curated/bot-avatar-12.png',
    genres: ['Dance'],
    tier: 'SILVER',
    provisionalScore: 6300,
    humanTakeoverThreshold: 6700,
    assignments: [{ category: 'dance', rankPosition: 1 }],
    status: 'ACTIVE',
    createdAt: '2026-06-23',
  },
  // ─── PRODUCER ──────────────────────────────────────────────────────────────
  {
    id: 'bot-producer-001',
    slug: 'bot-producer-001',
    displayName: 'Circuit Knox',
    label: '[BOT]',
    bio: 'Placeholder seat holder for Producer #1.',
    profileRoute: '/bots/bot-producer-001',
    avatarUrl: '/tmi-curated/bot-avatar-13.png',
    genres: ['Producer'],
    tier: 'GOLD',
    provisionalScore: 7200,
    humanTakeoverThreshold: 7600,
    assignments: [{ category: 'producer', rankPosition: 1 }],
    status: 'ACTIVE',
    createdAt: '2026-06-23',
  },
  // ─── LATIN / WORLD ─────────────────────────────────────────────────────────
  {
    id: 'bot-latin-001',
    slug: 'bot-latin-001',
    displayName: 'Sol Reyes',
    label: '[BOT]',
    bio: 'Placeholder seat holder for Latin/World #1.',
    profileRoute: '/bots/bot-latin-001',
    avatarUrl: '/tmi-curated/bot-avatar-14.png',
    genres: ['Latin', 'World'],
    tier: 'SILVER',
    provisionalScore: 6000,
    humanTakeoverThreshold: 6400,
    assignments: [{ category: 'latin', rankPosition: 1 }],
    status: 'ACTIVE',
    createdAt: '2026-06-23',
  },
  // ─── OVERALL #1 (all-genre crown) ──────────────────────────────────────────
  {
    id: 'bot-overall-001',
    slug: 'bot-overall-001',
    displayName: 'The Placeholder King',
    label: '[BOT]',
    bio: 'Holding the Overall #1 crown until a real artist earns it. Reach the top across all genres to claim this seat.',
    profileRoute: '/bots/bot-overall-001',
    avatarUrl: '/tmi-curated/bot-avatar-15.png',
    genres: ['All Genres'],
    tier: 'PLATINUM',
    provisionalScore: 12000,
    humanTakeoverThreshold: 13000,
    assignments: [{ category: 'overall', rankPosition: 1 }],
    status: 'ACTIVE',
    createdAt: '2026-06-23',
  },
];

// ─── SECOND WAVE — doubles roster so simulations have enough density ───────

const SECOND_WAVE: BotAccount[] = [
  // Hip-Hop #3-4
  {
    id: 'bot-hiphop-003', slug: 'bot-hiphop-003', displayName: 'Cannon Watts', label: '[BOT]',
    bio: 'Hip-Hop #3 placeholder. Earn XP to claim this seat.',
    profileRoute: '/bots/bot-hiphop-003', avatarUrl: '/tmi-curated/bot-avatar-16.png',
    genres: ['Hip-Hop'], tier: 'RUBY', provisionalScore: 4100, humanTakeoverThreshold: 4400,
    assignments: [{ category: 'hip-hop', rankPosition: 3 }], status: 'ACTIVE', createdAt: '2026-06-23',
  },
  {
    id: 'bot-hiphop-004', slug: 'bot-hiphop-004', displayName: 'Verse Phantom', label: '[BOT]',
    bio: 'Hip-Hop #4 placeholder.',
    profileRoute: '/bots/bot-hiphop-004', avatarUrl: '/tmi-curated/bot-avatar-17.png',
    genres: ['Hip-Hop'], tier: 'PRO', provisionalScore: 2800, humanTakeoverThreshold: 3100,
    assignments: [{ category: 'hip-hop', rankPosition: 4 }], status: 'ACTIVE', createdAt: '2026-06-23',
  },
  // R&B #3
  {
    id: 'bot-rnb-003', slug: 'bot-rnb-003', displayName: 'Satin Rivers', label: '[BOT]',
    bio: 'R&B #3 placeholder.',
    profileRoute: '/bots/bot-rnb-003', avatarUrl: '/tmi-curated/bot-avatar-18.png',
    genres: ['R&B', 'Soul'], tier: 'RUBY', provisionalScore: 3900, humanTakeoverThreshold: 4200,
    assignments: [{ category: 'rnb', rankPosition: 3 }], status: 'ACTIVE', createdAt: '2026-06-23',
  },
  // Pop #2-3
  {
    id: 'bot-pop-002', slug: 'bot-pop-002', displayName: 'Echo Voss', label: '[BOT]',
    bio: 'Pop #2 placeholder.',
    profileRoute: '/bots/bot-pop-002', avatarUrl: '/tmi-curated/bot-avatar-19.png',
    genres: ['Pop'], tier: 'SILVER', provisionalScore: 5600, humanTakeoverThreshold: 6000,
    assignments: [{ category: 'pop', rankPosition: 2 }], status: 'ACTIVE', createdAt: '2026-06-23',
  },
  {
    id: 'bot-pop-003', slug: 'bot-pop-003', displayName: 'Prism Lake', label: '[BOT]',
    bio: 'Pop #3 placeholder.',
    profileRoute: '/bots/bot-pop-003', avatarUrl: '/tmi-curated/bot-avatar-20.png',
    genres: ['Pop'], tier: 'RUBY', provisionalScore: 3700, humanTakeoverThreshold: 4000,
    assignments: [{ category: 'pop', rankPosition: 3 }], status: 'ACTIVE', createdAt: '2026-06-23',
  },
  // Rock #2
  {
    id: 'bot-rock-002', slug: 'bot-rock-002', displayName: 'Feral Chord', label: '[BOT]',
    bio: 'Rock #2 placeholder.',
    profileRoute: '/bots/bot-rock-002', avatarUrl: '/tmi-curated/bot-avatar-21.png',
    genres: ['Rock'], tier: 'SILVER', provisionalScore: 5300, humanTakeoverThreshold: 5700,
    assignments: [{ category: 'rock', rankPosition: 2 }], status: 'ACTIVE', createdAt: '2026-06-23',
  },
  // Country #2
  {
    id: 'bot-country-002', slug: 'bot-country-002', displayName: 'Sage Hollis', label: '[BOT]',
    bio: 'Country #2 placeholder.',
    profileRoute: '/bots/bot-country-002', avatarUrl: '/tmi-curated/bot-avatar-22.png',
    genres: ['Country'], tier: 'RUBY', provisionalScore: 4500, humanTakeoverThreshold: 4900,
    assignments: [{ category: 'country', rankPosition: 2 }], status: 'ACTIVE', createdAt: '2026-06-23',
  },
  // Gospel #2
  {
    id: 'bot-gospel-002', slug: 'bot-gospel-002', displayName: 'Zion Harps', label: '[BOT]',
    bio: 'Gospel #2 placeholder.',
    profileRoute: '/bots/bot-gospel-002', avatarUrl: '/tmi-curated/bot-avatar-23.png',
    genres: ['Gospel'], tier: 'RUBY', provisionalScore: 4200, humanTakeoverThreshold: 4600,
    assignments: [{ category: 'gospel', rankPosition: 2 }], status: 'ACTIVE', createdAt: '2026-06-23',
  },
  // EDM #2
  {
    id: 'bot-edm-002', slug: 'bot-edm-002', displayName: 'Pulse Array', label: '[BOT]',
    bio: 'EDM/DJ #2 placeholder.',
    profileRoute: '/bots/bot-edm-002', avatarUrl: '/tmi-curated/bot-avatar-24.png',
    genres: ['EDM', 'DJ'], tier: 'SILVER', provisionalScore: 5900, humanTakeoverThreshold: 6300,
    assignments: [{ category: 'edm', rankPosition: 2 }], status: 'ACTIVE', createdAt: '2026-06-23',
  },
  // Jazz #2
  {
    id: 'bot-jazz-002', slug: 'bot-jazz-002', displayName: 'Indigo Frame', label: '[BOT]',
    bio: 'Jazz/Blues #2 placeholder.',
    profileRoute: '/bots/bot-jazz-002', avatarUrl: '/tmi-curated/bot-avatar-25.png',
    genres: ['Jazz', 'Blues'], tier: 'RUBY', provisionalScore: 3800, humanTakeoverThreshold: 4100,
    assignments: [{ category: 'jazz', rankPosition: 2 }], status: 'ACTIVE', createdAt: '2026-06-23',
  },
  // Comedy #2
  {
    id: 'bot-comedy-002', slug: 'bot-comedy-002', displayName: 'Rim Shot Riley', label: '[BOT]',
    bio: 'Comedy #2 placeholder.',
    profileRoute: '/bots/bot-comedy-002', avatarUrl: '/tmi-curated/bot-avatar-26.png',
    genres: ['Comedy'], tier: 'RUBY', provisionalScore: 4000, humanTakeoverThreshold: 4400,
    assignments: [{ category: 'comedy', rankPosition: 2 }], status: 'ACTIVE', createdAt: '2026-06-23',
  },
  // Dance #2
  {
    id: 'bot-dance-002', slug: 'bot-dance-002', displayName: 'Kinetic Roux', label: '[BOT]',
    bio: 'Dance #2 placeholder.',
    profileRoute: '/bots/bot-dance-002', avatarUrl: '/tmi-curated/bot-avatar-27.png',
    genres: ['Dance'], tier: 'RUBY', provisionalScore: 4300, humanTakeoverThreshold: 4700,
    assignments: [{ category: 'dance', rankPosition: 2 }], status: 'ACTIVE', createdAt: '2026-06-23',
  },
  // Producer #2
  {
    id: 'bot-producer-002', slug: 'bot-producer-002', displayName: 'Sample Verse', label: '[BOT]',
    bio: 'Producer #2 placeholder.',
    profileRoute: '/bots/bot-producer-002', avatarUrl: '/tmi-curated/bot-avatar-28.png',
    genres: ['Producer'], tier: 'SILVER', provisionalScore: 5600, humanTakeoverThreshold: 6000,
    assignments: [{ category: 'producer', rankPosition: 2 }], status: 'ACTIVE', createdAt: '2026-06-23',
  },
  // Latin #2
  {
    id: 'bot-latin-002', slug: 'bot-latin-002', displayName: 'Caliente Cruz', label: '[BOT]',
    bio: 'Latin/World #2 placeholder.',
    profileRoute: '/bots/bot-latin-002', avatarUrl: '/tmi-curated/bot-avatar-29.png',
    genres: ['Latin', 'World'], tier: 'RUBY', provisionalScore: 4000, humanTakeoverThreshold: 4400,
    assignments: [{ category: 'latin', rankPosition: 2 }], status: 'ACTIVE', createdAt: '2026-06-23',
  },
  // Overall #2
  {
    id: 'bot-overall-002', slug: 'bot-overall-002', displayName: 'The Runner-Up', label: '[BOT]',
    bio: 'Overall #2 — second-place crown holder. Beat both this bot and #1 to challenge for the throne.',
    profileRoute: '/bots/bot-overall-002', avatarUrl: '/tmi-curated/bot-avatar-30.png',
    genres: ['All Genres'], tier: 'GOLD', provisionalScore: 9500, humanTakeoverThreshold: 10000,
    assignments: [{ category: 'overall', rankPosition: 2 }], status: 'ACTIVE', createdAt: '2026-06-23',
  },
];

// Merge into the main registry
BOT_ACCOUNT_REGISTRY.push(...SECOND_WAVE);

export function getBotById(id: string): BotAccount | undefined {
  return BOT_ACCOUNT_REGISTRY.find((b) => b.id === id);
}

export function getBotsByCategory(category: string): BotAccount[] {
  return BOT_ACCOUNT_REGISTRY.filter(
    (b) => b.status === 'ACTIVE' && b.assignments.some((a) => a.category === category)
  );
}

export function getActiveBots(): BotAccount[] {
  return BOT_ACCOUNT_REGISTRY.filter((b) => b.status === 'ACTIVE');
}

export function getDisplacedBots(): BotAccount[] {
  return BOT_ACCOUNT_REGISTRY.filter((b) => b.status === 'DISPLACED');
}

/** Returns the bot holding a specific rank seat, or undefined if a human already holds it. */
export function getBotForSeat(category: string, position: number): BotAccount | undefined {
  return BOT_ACCOUNT_REGISTRY.find(
    (b) =>
      b.status === 'ACTIVE' &&
      b.assignments.some((a) => a.category === category && a.rankPosition === position)
  );
}

/**
 * Displaces a bot from its seat when a real user's XP exceeds humanTakeoverThreshold.
 * Mutates in-memory state only — in production this would write to DB.
 */
export function displaceBotFromSeat(botId: string, humanUserId: string): boolean {
  const bot = BOT_ACCOUNT_REGISTRY.find((b) => b.id === botId);
  if (!bot || bot.status !== 'ACTIVE') return false;
  bot.status = 'DISPLACED';
  bot.displacedByUserId = humanUserId;
  bot.displacedAt = new Date().toISOString();
  return true;
}
