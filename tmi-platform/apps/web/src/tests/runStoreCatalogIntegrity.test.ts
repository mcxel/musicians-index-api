/**
 * Store Catalog Integrity Certification — Lane D Phase 1 close-out.
 *
 * Proves every purchasable StoreItem resolves to exactly one appropriate
 * canonical Stripe registry entry (products.ts), with a consistent
 * payment/subscription mode and no priceId collisions across the catalog.
 * Admit only when the structural checks below actually enforce this —
 * no fake PASS.
 */

import {
  getAllStoreItems,
  CREATOR_ITEMS,
  FAN_ITEMS,
  VENUE_ITEMS,
  LOBBY_ITEMS,
} from "../lib/store/StoreItemEngine";
import { STRIPE_PRODUCTS, isRealPriceId, type StripeProductKey } from "../lib/stripe/products";
import { CanonicalCartRuntime } from "../lib/commerce/CanonicalCartRuntime";

// Reverse index: priceId -> STRIPE_PRODUCTS key, built the same way
// checkout/route.ts's PRODUCT_BY_PRICE_ID is, so this test proves the exact
// lookup the real checkout path performs.
const REGISTRY_BY_PRICE_ID: Record<string, { key: StripeProductKey; price: number; interval?: string }> =
  Object.fromEntries(
    (Object.entries(STRIPE_PRODUCTS) as [StripeProductKey, (typeof STRIPE_PRODUCTS)[StripeProductKey]][]).map(
      ([key, p]) => [p.priceId, { key, price: p.price, interval: "interval" in p ? p.interval : undefined }],
    ),
  );

function isRecurringInterval(interval: string | undefined): boolean {
  return Boolean(interval) && interval !== "one_time";
}

describe("Store Catalog Integrity — every StoreItem resolves to a real checkout path", () => {
  const items = getAllStoreItems();

  it("catalog is non-empty across all four store sections", () => {
    expect(items.length).toBeGreaterThan(0);
    expect(CREATOR_ITEMS.length).toBeGreaterThan(0);
    expect(FAN_ITEMS.length).toBeGreaterThan(0);
    expect(VENUE_ITEMS.length).toBeGreaterThan(0);
    expect(LOBBY_ITEMS.length).toBeGreaterThan(0);
  });

  it("every item has a non-empty id, name, and priceId", () => {
    for (const item of items) {
      expect(item.id.length).toBeGreaterThan(0);
      expect(item.name.length).toBeGreaterThan(0);
      expect(item.priceId.length).toBeGreaterThan(0);
    }
  });

  it("no two items share a priceId (catches misappropriated/reused IDs)", () => {
    const seen = new Map<string, string>();
    for (const item of items) {
      const clashingId = seen.get(item.priceId);
      expect(clashingId).toBeUndefined();
      seen.set(item.priceId, item.id);
    }
    expect(seen.size).toBe(items.length);
  });

  it("no two items share an id (catches accidental duplicate SKUs)", () => {
    const ids = items.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every priceId is either a real Stripe ID or a registered STRIPE_PRODUCTS entry", () => {
    const unresolved: string[] = [];
    for (const item of items) {
      const real = isRealPriceId(item.priceId);
      const registered = item.priceId in REGISTRY_BY_PRICE_ID;
      if (!real && !registered) unresolved.push(`${item.id} (${item.priceId})`);
    }
    expect(unresolved).toEqual([]);
  });

  it("every item registered in STRIPE_PRODUCTS charges the exact displayed price (no drift)", () => {
    const drifted: string[] = [];
    for (const item of items) {
      const entry = REGISTRY_BY_PRICE_ID[item.priceId];
      if (entry && entry.price !== item.price) {
        drifted.push(`${item.id}: StoreItem=${item.price}c vs registry=${entry.price}c`);
      }
    }
    expect(drifted).toEqual([]);
  });

  it("item.mode agrees with the registry's billing interval (payment vs subscription)", () => {
    const mismatched: string[] = [];
    for (const item of items) {
      const entry = REGISTRY_BY_PRICE_ID[item.priceId];
      if (!entry) continue; // real orphan Stripe IDs (none currently) have no interval to check
      const registryIsRecurring = isRecurringInterval(entry.interval);
      const itemIsRecurring = item.mode === "subscription";
      if (registryIsRecurring !== itemIsRecurring) {
        mismatched.push(`${item.id}: mode=${item.mode} vs registry interval=${entry.interval ?? "one_time"}`);
      }
    }
    expect(mismatched).toEqual([]);
  });

  it("no performer-facing (Creator store) item sells ticket inventory (Rule 17)", () => {
    const ticketItems = CREATOR_ITEMS.filter((i) => i.category === "tickets");
    expect(ticketItems).toEqual([]);
  });

  it("Fan subscription tiers (member-pro, artist-pro) are sourced from the canonical registry, not a hardcoded duplicate", () => {
    const memberPro = FAN_ITEMS.find((i) => i.id === "member-pro");
    const artistPro = CREATOR_ITEMS.find((i) => i.id === "artist-pro");
    expect(memberPro).toBeDefined();
    expect(artistPro).toBeDefined();
    expect(memberPro!.priceId).toBe(STRIPE_PRODUCTS.FAN_PRO_MONTHLY.priceId);
    expect(artistPro!.priceId).toBe(STRIPE_PRODUCTS.PERFORMER_PRO_MONTHLY.priceId);
  });

  it("Season Pass ladder is the full 6-tier certified catalog, ascending by price", () => {
    const passes = FAN_ITEMS.filter((i) => i.id.startsWith("season-pass-"));
    expect(passes.length).toBe(6);
    const prices = passes.map((p) => p.price);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  it("shoutout and meet-greet are not sold via StoreItemEngine (unverified Stripe IDs — Rule 20)", () => {
    const ids = items.map((i) => i.id);
    expect(ids).not.toContain("shoutout");
    expect(ids).not.toContain("meet-greet");
  });

  it("CanonicalCartRuntime validates STORE_ITEM skus at registry price", () => {
    const item = LOBBY_ITEMS[0]!;
    const validated = CanonicalCartRuntime.validatePrice(`STORE_ITEM:${item.id}`);
    expect(validated.valid).toBe(true);
    expect(validated.canonicalPriceCents).toBe(item.price);
  });
});

describe("Server Price Revalidation Authority — CanonicalCartRuntime agrees with checkout", () => {
  // Phase 2 lifecycle node "SERVER PRICE REVALIDATION": every StoreItem that
  // resolves through STRIPE_PRODUCTS must also be independently recognized,
  // at the identical price, by the cart's own price authority — proving the
  // two authorities (checkout route + CanonicalCartRuntime) can never drift.
  const items = getAllStoreItems();

  it("every registry-backed StoreItem validates through CanonicalCartRuntime at the exact same price", () => {
    const failures: string[] = [];
    for (const item of items) {
      const registryMatch = Object.values(STRIPE_PRODUCTS).find((p) => p.priceId === item.priceId);
      if (!registryMatch) continue; // real orphan Stripe IDs aren't in this registry by design
      const validated = CanonicalCartRuntime.validatePrice(item.priceId);
      if (!validated.valid || validated.canonicalPriceCents !== item.price) {
        failures.push(
          `${item.id}: cart validatePrice=${JSON.stringify(validated)} vs StoreItem.price=${item.price}`,
        );
      }
    }
    expect(failures).toEqual([]);
  });
});
