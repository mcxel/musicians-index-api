/**
 * TMI AdSense configuration.
 * Replace PUBLISHER_ID and slot IDs with real values from Google AdSense dashboard.
 * Slot placement rules per tier:
 *   free    → all slots visible
 *   pro     → leaderboard + sidebar only (no in-content)
 *   gold    → sidebar only
 *   diamond → no ads
 *   (no session / unknown) → treat as free
 */

export const ADSENSE_PUBLISHER_ID = "ca-pub-4088577529436039";

export type AdPlacement =
  | "leaderboard"    // 728×90 — top of page, high CPM
  | "sidebar"        // 300×250 — right column
  | "in-content"     // 320×100 — between content blocks
  | "footer-banner"  // 468×60 — bottom of page
  | "mobile-banner"; // 320×50 — mobile sticky bottom

export type UserTier = "diamond" | "gold" | "pro" | "free" | "unknown";

export interface AdSlotConfig {
  slotId: string;
  placement: AdPlacement;
  width: number;
  height: number;
  label: string; // human label for admin/debug
}

// Replace slot IDs with real values from AdSense → Ads → By ad unit
export const AD_SLOTS: Record<AdPlacement, AdSlotConfig> = {
  leaderboard: {
    slotId: "1234567890",
    placement: "leaderboard",
    width: 728,
    height: 90,
    label: "Leaderboard 728×90",
  },
  sidebar: {
    slotId: "2345678901",
    placement: "sidebar",
    width: 300,
    height: 250,
    label: "Sidebar 300×250",
  },
  "in-content": {
    slotId: "3456789012",
    placement: "in-content",
    width: 320,
    height: 100,
    label: "In-Content 320×100",
  },
  "footer-banner": {
    slotId: "4567890123",
    placement: "footer-banner",
    width: 468,
    height: 60,
    label: "Footer Banner 468×60",
  },
  "mobile-banner": {
    slotId: "5678901234",
    placement: "mobile-banner",
    width: 320,
    height: 50,
    label: "Mobile Sticky 320×50",
  },
};

/**
 * Returns true if a user of the given tier should see ads at this placement.
 * Diamond pays to remove all ads. Gold removes in-content noise. Pro removes footer/mobile.
 */
export function shouldShowAd(tier: UserTier, placement: AdPlacement): boolean {
  if (tier === "diamond") return false;
  if (tier === "gold") return placement === "sidebar" || placement === "leaderboard";
  if (tier === "pro") return placement === "leaderboard" || placement === "sidebar" || placement === "in-content";
  // free or unknown → show everything
  return true;
}

/**
 * Returns the number of in-content ad breaks for a given tier.
 * Diamond: 0, Gold: 0, Pro: 1, Free: 3
 */
export function inContentAdCount(tier: UserTier): number {
  if (tier === "diamond" || tier === "gold") return 0;
  if (tier === "pro") return 1;
  return 3;
}
