/**
 * ArticlePhotoEntitlement.ts — canonical photo-capacity law for the Article
 * Submission Form. REUSES the existing SubscriptionEntitlementEngine
 * `imageSlots` ladder (free=1, pro=3, RUBY=6, silver=8, gold=10, platinum=15,
 * diamond=20) — no invented tier numbers, no scattered constants.
 *
 * Enforcement invariant: FREE = 1 article photo; every paid tier = multi-photo.
 * Enforced server-side in the article write authority; the UI reflects it.
 */

import { resolveEntitlement } from "@/lib/subscriptions/SubscriptionEntitlementEngine";
import type { AccountType, SubscriptionTier } from "@/lib/subscriptions/SubscriptionPricingEngine";

export interface ArticlePhotoCapacity {
  /** Max photos this tier may attach to one article. */
  maxPhotos: number;
  /** True when the account can attach more than one photo. */
  multiPhoto: boolean;
}

/**
 * Resolve the article-photo capacity for an account.
 * `imageSlots` already encodes free=1 / paid>1, so this is a thin read of the
 * canonical entitlement — it never invents its own ladder.
 */
export function resolveArticlePhotoCapacity(
  accountType: AccountType,
  tier: SubscriptionTier,
): ArticlePhotoCapacity {
  const max = resolveEntitlement(accountType, tier).imageSlots;
  return { maxPhotos: Math.max(1, max), multiPhoto: max > 1 };
}

/**
 * True when adding one more photo would stay within entitlement.
 * `currentPhotoCount` is the article's persisted photo count.
 */
export function canAddArticlePhoto(
  accountType: AccountType,
  tier: SubscriptionTier,
  currentPhotoCount: number,
): boolean {
  return currentPhotoCount < resolveArticlePhotoCapacity(accountType, tier).maxPhotos;
}
