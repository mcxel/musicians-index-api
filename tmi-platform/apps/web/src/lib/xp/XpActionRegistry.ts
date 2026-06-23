/**
 * XpActionRegistry — Rule 9 (Everything Earns XP)
 *
 * Single source of truth for every XP-earning action on TMI.
 * All platform activity feeds one progression engine:
 *   XP → Achievements → Rank → Leaderboards → Crown Eligibility
 *
 * Usage:
 *   import { XP_ACTIONS, getXpValue } from '@/lib/xp/XpActionRegistry';
 *   const xp = getXpValue('read_article');  // → 25
 */

export type XpActionKey =
  // ── Content consumption ────────────────────────────────────────────────────
  | 'read_article'
  | 'watch_stream'
  | 'watch_live_5min'
  | 'watch_live_30min'
  // ── Social engagement ──────────────────────────────────────────────────────
  | 'comment'
  | 'share_article'
  | 'share_performer'
  | 'like_track'
  // ── Financial actions ──────────────────────────────────────────────────────
  | 'send_tip'
  | 'buy_merch'
  | 'buy_ticket'
  | 'book_venue'
  | 'join_fan_club'
  | 'buy_beat_license'
  // ── Competitive actions ────────────────────────────────────────────────────
  | 'enter_battle'
  | 'win_battle'
  | 'enter_cypher'
  | 'win_cypher'
  | 'enter_monthly_idol'
  | 'place_top_3_monthly_idol'
  // ── Performer actions ──────────────────────────────────────────────────────
  | 'go_live'
  | 'reach_100_live_viewers'
  | 'reach_500_live_viewers'
  | 'upload_track'
  | 'upload_video'
  | 'add_merch_item'
  | 'complete_sponsor_set'
  // ── Audience growth ────────────────────────────────────────────────────────
  | 'gain_fan'
  | 'fan_sends_tip'
  | 'fan_joins_fan_club'
  // ── Platform engagement ────────────────────────────────────────────────────
  | 'daily_login'
  | 'complete_profile'
  | 'verify_account'
  | 'refer_new_user'
  // ── Fan engagement ────────────────────────────────────────────────────────
  | 'vote_battle'
  | 'attend_live_room'
  | 'book_performer'
  // ── Magazine / content creation ────────────────────────────────────────────
  | 'article_featured'
  | 'article_gets_1000_reads';

export interface XpAction {
  key: XpActionKey;
  label: string;
  xp: number;
  category: 'consumption' | 'social' | 'financial' | 'competitive' | 'performer' | 'growth' | 'platform' | 'content';
  repeatable: boolean;
  cooldownHours?: number;
  achievementUnlock?: string;
}

export const XP_ACTIONS: XpAction[] = [
  // ── Content consumption ──────────────────────────────────────────────────
  { key: 'read_article',         label: 'Read an article',                xp: 25,   category: 'consumption', repeatable: true,  cooldownHours: 1 },
  { key: 'watch_stream',         label: 'Watch a stream',                 xp: 10,   category: 'consumption', repeatable: true,  cooldownHours: 0.5 },
  { key: 'watch_live_5min',      label: 'Watch live for 5 min',           xp: 15,   category: 'consumption', repeatable: true,  cooldownHours: 1 },
  { key: 'watch_live_30min',     label: 'Watch live for 30 min',          xp: 50,   category: 'consumption', repeatable: true,  cooldownHours: 4 },

  // ── Social ───────────────────────────────────────────────────────────────
  { key: 'comment',              label: 'Leave a comment',                xp: 5,    category: 'social',      repeatable: true,  cooldownHours: 0.25 },
  { key: 'share_article',        label: 'Share an article',               xp: 20,   category: 'social',      repeatable: true,  cooldownHours: 1 },
  { key: 'share_performer',      label: 'Share a performer page',         xp: 20,   category: 'social',      repeatable: true,  cooldownHours: 1 },
  { key: 'like_track',           label: 'Like a track',                   xp: 5,    category: 'social',      repeatable: true,  cooldownHours: 0.25 },

  // ── Financial ────────────────────────────────────────────────────────────
  { key: 'send_tip',             label: 'Send a tip',                     xp: 100,  category: 'financial',   repeatable: true,  cooldownHours: 0,   achievementUnlock: 'tipper' },
  { key: 'buy_merch',            label: 'Buy merch',                      xp: 150,  category: 'financial',   repeatable: true,  cooldownHours: 0,   achievementUnlock: 'supporter' },
  { key: 'buy_ticket',           label: 'Buy a ticket',                   xp: 200,  category: 'financial',   repeatable: true,  cooldownHours: 0 },
  { key: 'book_venue',           label: 'Book a venue',                   xp: 500,  category: 'financial',   repeatable: true,  cooldownHours: 0 },
  { key: 'join_fan_club',        label: 'Join a fan club',                xp: 300,  category: 'financial',   repeatable: true,  cooldownHours: 0,   achievementUnlock: 'fan-club-member' },
  { key: 'buy_beat_license',     label: 'Buy a beat license',             xp: 250,  category: 'financial',   repeatable: true,  cooldownHours: 0 },

  // ── Competitive ──────────────────────────────────────────────────────────
  { key: 'enter_battle',         label: 'Enter a battle',                 xp: 200,  category: 'competitive', repeatable: true,  cooldownHours: 0 },
  { key: 'win_battle',           label: 'Win a battle',                   xp: 800,  category: 'competitive', repeatable: true,  cooldownHours: 0,   achievementUnlock: 'battle-winner' },
  { key: 'enter_cypher',         label: 'Enter a cypher',                 xp: 100,  category: 'competitive', repeatable: true,  cooldownHours: 0 },
  { key: 'win_cypher',           label: 'Win a cypher',                   xp: 500,  category: 'competitive', repeatable: true,  cooldownHours: 0,   achievementUnlock: 'cypher-champion' },
  { key: 'enter_monthly_idol',   label: 'Enter Monthly Idol',             xp: 300,  category: 'competitive', repeatable: false },
  { key: 'place_top_3_monthly_idol', label: 'Place top 3 in Monthly Idol', xp: 2000, category: 'competitive', repeatable: false, achievementUnlock: 'monthly-idol-finalist' },

  // ── Performer actions ────────────────────────────────────────────────────
  { key: 'go_live',              label: 'Go live',                        xp: 100,  category: 'performer',   repeatable: true,  cooldownHours: 2 },
  { key: 'reach_100_live_viewers', label: 'Reach 100 live viewers',       xp: 500,  category: 'performer',   repeatable: true,  cooldownHours: 24,  achievementUnlock: 'crowd-100' },
  { key: 'reach_500_live_viewers', label: 'Reach 500 live viewers',       xp: 2000, category: 'performer',   repeatable: true,  cooldownHours: 24,  achievementUnlock: 'crowd-500' },
  { key: 'upload_track',         label: 'Upload a track',                 xp: 150,  category: 'performer',   repeatable: true,  cooldownHours: 0 },
  { key: 'upload_video',         label: 'Upload a video',                 xp: 200,  category: 'performer',   repeatable: true,  cooldownHours: 0 },
  { key: 'add_merch_item',       label: 'Add merch item',                 xp: 100,  category: 'performer',   repeatable: true,  cooldownHours: 0 },
  { key: 'complete_sponsor_set', label: 'Complete sponsored set',         xp: 1000, category: 'performer',   repeatable: true,  cooldownHours: 0,   achievementUnlock: 'sponsored-artist' },

  // ── Audience growth ──────────────────────────────────────────────────────
  { key: 'gain_fan',             label: 'Gain a fan',                     xp: 50,   category: 'growth',      repeatable: true,  cooldownHours: 0 },
  { key: 'fan_sends_tip',        label: 'Fan sends you a tip',            xp: 200,  category: 'growth',      repeatable: true,  cooldownHours: 0 },
  { key: 'fan_joins_fan_club',   label: 'Fan joins your fan club',        xp: 400,  category: 'growth',      repeatable: true,  cooldownHours: 0 },

  // ── Platform engagement ──────────────────────────────────────────────────
  { key: 'daily_login',          label: 'Daily login',                    xp: 20,   category: 'platform',    repeatable: true,  cooldownHours: 20 },
  { key: 'complete_profile',     label: 'Complete your profile',          xp: 500,  category: 'platform',    repeatable: false, achievementUnlock: 'profile-complete' },
  { key: 'verify_account',       label: 'Verify your account',            xp: 200,  category: 'platform',    repeatable: false, achievementUnlock: 'verified' },
  { key: 'refer_new_user',       label: 'Refer a new user',               xp: 300,  category: 'platform',    repeatable: true,  cooldownHours: 0,   achievementUnlock: 'recruiter' },

  // ── Content creation ─────────────────────────────────────────────────────
  { key: 'article_featured',     label: 'Get featured in magazine',       xp: 1500, category: 'content',     repeatable: true,  cooldownHours: 0,   achievementUnlock: 'magazine-featured' },
  { key: 'article_gets_1000_reads', label: 'Article reaches 1,000 reads', xp: 2500, category: 'content',    repeatable: true,  cooldownHours: 0,   achievementUnlock: 'viral-article' },

  // ── Fan engagement ───────────────────────────────────────────────────────
  { key: 'vote_battle',          label: 'Vote in a battle',               xp: 15,   category: 'competitive', repeatable: true,  cooldownHours: 0.25 },
  { key: 'attend_live_room',     label: 'Attend a live room',             xp: 20,   category: 'consumption', repeatable: true,  cooldownHours: 1 },
  { key: 'book_performer',       label: 'Book a performer',               xp: 200,  category: 'financial',   repeatable: true,  cooldownHours: 0 },
];

// ── Lookup helpers ────────────────────────────────────────────────────────────

const _byKey = new Map(XP_ACTIONS.map(a => [a.key, a]));

export function getXpValue(key: XpActionKey): number {
  return _byKey.get(key)?.xp ?? 0;
}

export function getXpAction(key: XpActionKey): XpAction | null {
  return _byKey.get(key) ?? null;
}

export function getXpActionsByCategory(category: XpAction['category']): XpAction[] {
  return XP_ACTIONS.filter(a => a.category === category);
}

/** Total XP a user would earn if they completed every non-repeatable action once */
export const PROFILE_COMPLETION_XP = XP_ACTIONS
  .filter(a => !a.repeatable)
  .reduce((sum, a) => sum + a.xp, 0);

/** XP tiers — mirrors PerformerTier progression */
export const XP_TIER_THRESHOLDS = {
  FREE:     0,
  PRO:      5_000,
  RUBY:     15_000,
  Silver:   30_000,
  Gold:     55_000,
  Platinum: 85_000,
  Diamond:  130_000,
} as const;

export type TierName = keyof typeof XP_TIER_THRESHOLDS;

export function getTierFromXp(xp: number): TierName {
  const tiers = Object.entries(XP_TIER_THRESHOLDS).reverse() as [TierName, number][];
  return tiers.find(([, threshold]) => xp >= threshold)?.[0] ?? 'FREE';
}

export function getNextTier(current: TierName): TierName | 'APEX' {
  const order: (TierName | 'APEX')[] = ['FREE', 'PRO', 'RUBY', 'Silver', 'Gold', 'Platinum', 'Diamond', 'APEX'];
  const idx = order.indexOf(current);
  return idx >= 0 && idx < order.length - 1 ? order[idx + 1]! : 'APEX';
}

export function getXpToNextTier(xp: number): number {
  const tier = getTierFromXp(xp);
  const order = Object.keys(XP_TIER_THRESHOLDS) as TierName[];
  const next = order[order.indexOf(tier) + 1];
  if (!next) return 0;
  return XP_TIER_THRESHOLDS[next] - xp;
}
