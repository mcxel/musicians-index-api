/**
 * ButtonActionRegistry
 * Every interactive element on the platform must be registered here.
 * Pattern: { id, label, type, target, requiredTier?, lockedReason? }
 * DeadClickScanner reads this registry to flag unregistered buttons.
 */

import type { SubscriptionTier } from '@/lib/subscriptions/SubscriptionPricingEngine';

export type ButtonActionType =
  | 'navigate'       // href navigation
  | 'modal'          // opens a modal
  | 'api'            // triggers an API call
  | 'external'       // opens external URL
  | 'locked';        // shows upgrade prompt

export type ButtonAction = {
  id: string;
  label: string;
  type: ButtonActionType;
  target: string;              // href, modal id, or api endpoint
  requiredTier?: SubscriptionTier;
  lockedReason?: string;
};

const REGISTRY: ButtonAction[] = [
  // ─── Global Nav ───────────────────────────────────────────────────────────
  { id: 'nav-home', label: 'Home', type: 'navigate', target: '/home/1' },
  { id: 'nav-battles', label: 'Battles', type: 'navigate', target: '/battles' },
  { id: 'nav-cypher', label: 'Cypher', type: 'navigate', target: '/cypher' },
  { id: 'nav-marketplace', label: 'Marketplace', type: 'navigate', target: '/marketplace' },
  { id: 'nav-articles', label: 'Articles', type: 'navigate', target: '/articles' },
  { id: 'nav-live', label: 'Go Live', type: 'navigate', target: '/cypher/live' },
  { id: 'nav-login', label: 'Login', type: 'navigate', target: '/auth/signin' },
  { id: 'nav-signup', label: 'Sign Up', type: 'navigate', target: '/auth/signup' },

  // ─── Home 2 ───────────────────────────────────────────────────────────────
  { id: 'h2-articles-news', label: 'Articles News', type: 'navigate', target: '/articles/news' },
  { id: 'h2-interviews', label: 'Interviews', type: 'navigate', target: '/articles/interview/weekly-feature' },
  { id: 'h2-studio-recaps', label: 'Studio Recaps', type: 'navigate', target: '/articles/recap/studio-week' },
  { id: 'h2-genre-cluster', label: 'Genre Cluster', type: 'navigate', target: '/genres/hip-hop' },
  { id: 'h2-sponsor-spotlight', label: 'Sponsor Spotlight', type: 'navigate', target: '/sponsors' },

  // ─── Home 5 / CBC Arena ───────────────────────────────────────────────────
  { id: 'h5-enter-challenge', label: 'Enter Challenge', type: 'navigate', target: '/challenges' },
  { id: 'h5-enter-battle', label: 'Enter Battle', type: 'navigate', target: '/battles/create', requiredTier: 'gold', lockedReason: 'Battle creation requires Gold membership' },
  { id: 'h5-enter-cypher', label: 'Join Cypher', type: 'navigate', target: '/cypher/live' },
  { id: 'h5-championship', label: 'Championship', type: 'navigate', target: '/championships/battle-of-the-band' },

  // ─── Subscription / Upgrade ──────────────────────────────────────────────
  { id: 'upgrade-pro', label: 'Upgrade to Pro', type: 'navigate', target: '/subscribe?tier=pro' },
  { id: 'upgrade-gold', label: 'Upgrade to Gold', type: 'navigate', target: '/subscribe?tier=gold' },
  { id: 'upgrade-diamond', label: 'Upgrade to Diamond', type: 'navigate', target: '/subscribe?tier=diamond' },

  // ─── Advertiser ──────────────────────────────────────────────────────────
  { id: 'advertiser-placements', label: 'Ad Placements', type: 'navigate', target: '/advertiser/placements' },
  { id: 'advertiser-dashboard', label: 'Advertiser Dashboard', type: 'navigate', target: '/advertiser/dashboard' },

  // ─── Sponsor / Patronage ─────────────────────────────────────────────────
  { id: 'sponsor-artist', label: 'Sponsor Artist', type: 'navigate', target: '/onboarding/sponsor' },

  // ─── Admin ────────────────────────────────────────────────────────────────
  { id: 'admin-owner-dashboard', label: 'Owner Dashboard', type: 'navigate', target: '/admin/owner-dashboard' },
  { id: 'admin-bot-ops', label: 'Bot Operations', type: 'navigate', target: '/admin/bot-operations' },
  { id: 'admin-launch-observatory', label: 'Launch Observatory', type: 'navigate', target: '/admin/launch-observatory' },
];

const INDEX = new Map<string, ButtonAction>(REGISTRY.map((b) => [b.id, b]));

export function getButtonAction(id: string): ButtonAction | undefined {
  return INDEX.get(id);
}

export function listAllActions(): ButtonAction[] {
  return REGISTRY;
}

export function getLockedActions(userTier: SubscriptionTier): ButtonAction[] {
  const TIER_ORDER: SubscriptionTier[] = ['free', 'pro', 'RUBY', 'silver', 'gold', 'platinum', 'diamond'];
  const userIdx = TIER_ORDER.indexOf(userTier);
  return REGISTRY.filter((b) => {
    if (!b.requiredTier) return false;
    return TIER_ORDER.indexOf(b.requiredTier) > userIdx;
  });
}

export function resolveButtonTarget(id: string, userTier: SubscriptionTier): { href: string; locked: boolean; lockedReason?: string } {
  const action = INDEX.get(id);
  if (!action) return { href: '#', locked: false };

  if (action.requiredTier) {
    const TIER_ORDER: SubscriptionTier[] = ['free', 'pro', 'RUBY', 'silver', 'gold', 'platinum', 'diamond'];
    const required = TIER_ORDER.indexOf(action.requiredTier);
    const user = TIER_ORDER.indexOf(userTier);
    if (user < required) {
      return { href: `/subscribe?tier=${action.requiredTier}`, locked: true, lockedReason: action.lockedReason };
    }
  }

  return { href: action.target, locked: false };
}
