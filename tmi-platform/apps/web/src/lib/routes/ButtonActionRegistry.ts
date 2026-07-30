/**
 * ButtonActionRegistry — TMI Zero-Friction Action Registry
 * Every interactive element on the platform must declare its behavior contract:
 *  - immediate: executes instantly (mic/cam toggle, like, gift, follow, play/pause)
 *  - quick-panel: opens compact overlay panel over current experience
 *  - workspace: opens expandable concierge workspace drawer without changing route
 *  - route: navigates to complete full-page experience
 */

import type { SubscriptionTier } from '@/lib/subscriptions/SubscriptionPricingEngine';

export type TMIActionBehavior = 'immediate' | 'quick-panel' | 'workspace' | 'route';

export type ButtonActionType =
  | 'navigate'       // href navigation
  | 'modal'          // opens a modal
  | 'api'            // triggers an API call
  | 'external'       // opens external URL
  | 'locked';        // shows upgrade prompt

export type TMIAction = {
  id: string;
  label: string;
  behavior: TMIActionBehavior;
  type?: ButtonActionType;
  target: string;              // href, modal id, or api endpoint
  permission?: string[];
  requiredTier?: SubscriptionTier;
  lockedReason?: string;
  optimistic?: boolean;
  preserveContext?: boolean;
};

export type ButtonAction = TMIAction;

const REGISTRY: TMIAction[] = [
  // ─── Immediate Controls ───────────────────────────────────────────────────
  { id: 'ctrl-mic-toggle', label: 'Mic Toggle', behavior: 'immediate', target: 'api:mic-toggle', optimistic: true },
  { id: 'ctrl-cam-toggle', label: 'Cam Toggle', behavior: 'immediate', target: 'api:cam-toggle', optimistic: true },
  { id: 'ctrl-play-pause', label: 'Play/Pause', behavior: 'immediate', target: 'api:media-toggle', optimistic: true },

  // ─── Quick Panels ─────────────────────────────────────────────────────────
  { id: 'panel-playlist', label: 'Playlist', behavior: 'quick-panel', target: 'panel:playlist', preserveContext: true },
  { id: 'panel-memory-wall', label: 'Memory Wall', behavior: 'quick-panel', target: 'panel:memory-wall', preserveContext: true },
  { id: 'panel-inventory', label: 'Inventory', behavior: 'quick-panel', target: 'panel:inventory', preserveContext: true },
  { id: 'panel-go-live', label: 'Go Live', behavior: 'quick-panel', target: 'panel:go-live', preserveContext: true },
  { id: 'panel-profile', label: 'Profile', behavior: 'quick-panel', target: 'panel:profile', preserveContext: true },

  // ─── Workspaces ───────────────────────────────────────────────────────────
  { id: 'ws-analytics', label: 'Analytics Workspace', behavior: 'workspace', target: 'ws:analytics', preserveContext: true },
  { id: 'ws-revenue', label: 'Revenue Workspace', behavior: 'workspace', target: 'ws:revenue', preserveContext: true },
  { id: 'ws-bookings', label: 'Bookings Workspace', behavior: 'workspace', target: 'ws:bookings', preserveContext: true },

  // ─── Full Routes ──────────────────────────────────────────────────────────
  { id: 'nav-home', label: 'Home', behavior: 'route', type: 'navigate', target: '/home/1' },
  { id: 'nav-battles', label: 'Battles', behavior: 'route', type: 'navigate', target: '/battles' },
  { id: 'nav-cypher', label: 'Cypher', behavior: 'route', type: 'navigate', target: '/cypher' },
  { id: 'nav-marketplace', label: 'Marketplace', behavior: 'route', type: 'navigate', target: '/marketplace' },
  { id: 'nav-articles', label: 'Articles', behavior: 'route', type: 'navigate', target: '/articles' },
];

const INDEX = new Map<string, TMIAction>(REGISTRY.map((b) => [b.id, b]));

export function getButtonAction(id: string): TMIAction | undefined {
  return INDEX.get(id);
}

export function listAllActions(): TMIAction[] {
  return REGISTRY;
}

export function getLockedActions(userTier: SubscriptionTier): TMIAction[] {
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
