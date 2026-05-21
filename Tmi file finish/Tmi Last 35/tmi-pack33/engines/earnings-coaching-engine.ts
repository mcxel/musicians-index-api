// apps/web/src/systems/coaching/earnings-coaching-engine.ts
// Generates contextual coaching notes for artists based on their activity.
// These appear as sticky notes on the dashboard and profile owner view.

export type CoachingNoteType = 
  | 'sponsor_task' | 'sponsor_renewal' | 'local_sponsor' | 'promotion'
  | 'content' | 'live' | 'discovery' | 'earnings' | 'profile';

export interface CoachingNote {
  id: string;
  type: CoachingNoteType;
  headline: string;
  body: string;
  ctaLabel?: string;
  ctaHref?: string;
  priority: number;    // 1 = highest (shown first)
  condition: string;   // when to show this note
  impactLabel: string; // "Impacts: Sponsor Renewal Chance"
}

export const COACHING_NOTES: CoachingNote[] = [
  // ── SPONSOR TASKS ────────────────────────────────────
  {
    id: 'sponsor-thank-week',
    type: 'sponsor_task',
    headline: '⚡ Thank Your Sponsor This Week',
    body: 'Mentioning your sponsor in a post or live session improves renewal chances. Local stores fund artists who show love back.',
    ctaLabel: 'View Sponsor Tasks',
    ctaHref: '/dashboard/artist/sponsor-tasks',
    priority: 1,
    condition: 'has_active_sponsor AND NOT completed_sponsor_thank_this_week',
    impactLabel: 'Impacts: Sponsor Renewal Probability',
  },
  {
    id: 'sponsor-promote-product',
    type: 'sponsor_task',
    headline: '⚡ Promote Your Sponsor's Product',
    body: 'Feature their product in your next post or station broadcast. Artists who promote local sponsors get more funding and higher discovery rankings.',
    ctaLabel: 'Go to Station',
    ctaHref: '/dashboard/artist/station',
    priority: 2,
    condition: 'has_active_sponsor AND sponsor_has_product AND NOT promoted_this_week',
    impactLabel: 'Impacts: Earnings + Local Visibility',
  },
  {
    id: 'local-sponsor-opportunity',
    type: 'local_sponsor',
    headline: '🏪 A Local Business Wants To Sponsor You',
    body: 'The local sponsor loop: a store near you funds artists in your area. Artists who promote local stores help the whole community and earn more. Win-win.',
    ctaLabel: 'View Sponsor Opportunities',
    ctaHref: '/sponsors/opportunities',
    priority: 3,
    condition: 'has_sponsor_match_available AND NOT has_active_sponsor',
    impactLabel: 'Impacts: New Revenue Stream',
  },
  {
    id: 'sponsor-renewal-due',
    type: 'sponsor_renewal',
    headline: '⏰ Sponsor Campaign Ending Soon',
    body: 'Your sponsor campaign ends this week. Complete your remaining promo tasks to maximize renewal chances and keep the funding flowing.',
    ctaLabel: 'Complete Tasks',
    ctaHref: '/dashboard/artist/sponsor-tasks',
    priority: 1,
    condition: 'has_active_sponsor AND sponsor_campaign_ends_in_7_days',
    impactLabel: 'Impacts: Campaign Renewal',
  },

  // ── CONTENT + DISCOVERY ──────────────────────────────
  {
    id: 'article-update-week',
    type: 'content',
    headline: '📰 Update Your Article This Week',
    body: 'Artists who update their article weekly get more sponsor attention and improve their magazine feature rotation. Fresh content = more exposure.',
    ctaLabel: 'Edit Article',
    ctaHref: '/dashboard/artist/profile',
    priority: 4,
    condition: 'has_article AND article_older_than_7_days',
    impactLabel: 'Impacts: Magazine Rotation + Sponsor Attention',
  },
  {
    id: 'go-live-this-week',
    type: 'live',
    headline: '🎤 Go Live This Week',
    body: 'Live sessions boost your Stream & Win score, improve discovery rank, and give fans a reason to keep coming back.',
    ctaLabel: 'Go to Stage',
    ctaHref: '/live/stage',
    priority: 5,
    condition: 'no_live_session_this_week AND can_go_live',
    impactLabel: 'Impacts: Discovery Rank + Stream & Win Score',
  },
  {
    id: 'complete-profile',
    type: 'profile',
    headline: '👤 Complete Your Artist Profile',
    body: 'A complete profile unlocks sponsor opportunities, higher discovery ranking, and magazine feature eligibility.',
    ctaLabel: 'Edit Profile',
    ctaHref: '/profile/create/artist',
    priority: 6,
    condition: 'profile_completeness_below_80_pct',
    impactLabel: 'Impacts: Sponsor Access + Discovery',
  },
  {
    id: 'enter-contest',
    type: 'discovery',
    headline: '🏆 A Contest Is Open — Enter Now',
    body: 'Weekly cyphers and contests are how artists win the Crown and get featured on the homepage. Your rank determines your magazine placement.',
    ctaLabel: 'Browse Contests',
    ctaHref: '/contest',
    priority: 7,
    condition: 'contest_accepting_entries AND NOT entered_this_week',
    impactLabel: 'Impacts: Crown Ranking + Homepage Feature',
  },

  // ── EARNINGS ─────────────────────────────────────────
  {
    id: 'payout-available',
    type: 'earnings',
    headline: '💰 Payout Ready — Withdraw Your Earnings',
    body: 'You have cleared earnings available for withdrawal. Set up your payout account to receive your funds.',
    ctaLabel: 'View Wallet',
    ctaHref: '/wallet',
    priority: 1,
    condition: 'available_balance_above_2000_cents AND payout_account_configured',
    impactLabel: 'Action: Withdraw Earnings',
  },
  {
    id: 'setup-payout-account',
    type: 'earnings',
    headline: '💳 Set Up Your Payout Account',
    body: 'You're earning on TMI but have no payout account connected. Add your Stripe account to receive artist earnings and tips.',
    ctaLabel: 'Connect Payout',
    ctaHref: '/wallet',
    priority: 2,
    condition: 'has_any_earnings AND NOT payout_account_configured',
    impactLabel: 'Action: Unlock Withdrawals',
  },
];

export function getActiveNotesForArtist(
  conditions: Record<string, boolean>,
  maxNotes: number = 3,
): CoachingNote[] {
  return COACHING_NOTES
    .filter(note => {
      // Simple condition matching — in production, parse the condition string
      // For now, check if the condition keyword is in the conditions object
      return conditions[note.condition] === true;
    })
    .sort((a, b) => a.priority - b.priority)
    .slice(0, maxNotes);
}
