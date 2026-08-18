/**
 * Canonical Ownership & Entitlement Runtime Engine.
 *
 * Laws:
 *   1. Stripe proves payment; OwnershipRuntime grants and records canonical platform access.
 *   2. Every owned item retains provenance (PURCHASED, SUBSCRIPTION, WON_DEAL_OR_FEUD, EARNED, SEASON_PASS, SPONSOR_REWARD).
 *   3. Prevents duplicate purchases for non-stackable digital items.
 */

export type EntitlementProvenance =
  | "PURCHASED"
  | "SUBSCRIPTION"
  | "WON_DEAL_OR_FEUD"
  | "EARNED"
  | "SEASON_PASS"
  | "SPONSOR_REWARD";

export interface UserEntitlement {
  id: string;
  userId: string;
  skuId: string;
  title: string;
  category: "cosmetic" | "skin" | "chassis" | "pass" | "reward";
  provenance: EntitlementProvenance;
  pricePaidCents: number;
  obtainedAt: number;
  equipped: boolean;
  orderId?: string;
}

const userEntitlements = new Map<string, UserEntitlement[]>(); // key: userId

class OwnershipRuntimeImpl {
  grantEntitlement(input: {
    userId: string;
    skuId: string;
    title: string;
    category: UserEntitlement["category"];
    provenance: EntitlementProvenance;
    pricePaidCents?: number;
    orderId?: string;
  }): UserEntitlement {
    const list = userEntitlements.get(input.userId) ?? [];

    const existing = list.find((e) => e.skuId === input.skuId);
    if (existing) {
      return existing;
    }

    const newEntitlement: UserEntitlement = {
      id: `ent-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: input.userId,
      skuId: input.skuId,
      title: input.title,
      category: input.category,
      provenance: input.provenance,
      pricePaidCents: input.pricePaidCents ?? 0,
      obtainedAt: Date.now(),
      equipped: false,
      orderId: input.orderId,
    };

    list.push(newEntitlement);
    userEntitlements.set(input.userId, list);
    return newEntitlement;
  }

  getUserEntitlements(userId: string, provenanceFilter?: EntitlementProvenance): UserEntitlement[] {
    const list = userEntitlements.get(userId) ?? [];
    if (!provenanceFilter) return list;
    return list.filter((e) => e.provenance === provenanceFilter);
  }

  hasEntitlement(userId: string, skuId: string): boolean {
    const list = userEntitlements.get(userId) ?? [];
    return list.some((e) => e.skuId === skuId);
  }

  equipItem(userId: string, skuId: string): boolean {
    const list = userEntitlements.get(userId) ?? [];
    let found = false;
    list.forEach((e) => {
      if (e.category === "cosmetic" || e.category === "skin") {
        if (e.skuId === skuId) {
          e.equipped = true;
          found = true;
        }
      }
    });
    return found;
  }
}

export const OwnershipRuntime = new OwnershipRuntimeImpl();
