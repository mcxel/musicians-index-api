/**
 * Idempotent Stripe catalog sync for CanonicalPricingRegistry.
 * - NEVER deletes Stripe products/prices.
 * - Reuses existing price_1* IDs already mapped in STRIPE_PRODUCTS.
 * - Creates missing products/prices ONLY when STRIPE_SECRET_KEY is sk_test_*.
 * - Without test credentials: reports STRIPE_SYNC_PENDING and exits 0.
 *
 * Usage: pnpm exec tsx scripts/sync-stripe-pricing-catalog.ts
 */

import { buildPricingSyncLedger } from "../src/lib/commerce/CanonicalPricingRegistry";
import { STRIPE_PRODUCTS, isRealPriceId, type StripeProductKey } from "../src/lib/stripe/products";

type SyncResult = {
  catalogId: string;
  stripeProductKey: StripeProductKey;
  action: "REUSED" | "CREATED" | "STRIPE_SYNC_PENDING" | "SKIPPED_LIVE_KEY" | "PRICE_WITHOUT_PLACEMENT";
  priceId: string;
};

function hasTestStripeKey(): boolean {
  const raw = process.env.STRIPE_SECRET_KEY?.trim() ?? "";
  return raw.startsWith("sk_test_");
}

function hasLiveStripeKey(): boolean {
  const raw = process.env.STRIPE_SECRET_KEY?.trim() ?? "";
  return raw.startsWith("sk_live_");
}

async function ensureTestPrice(
  stripe: import("stripe").default,
  key: StripeProductKey,
  catalogId: string,
): Promise<{ priceId: string; created: boolean }> {
  const product = STRIPE_PRODUCTS[key];
  if (isRealPriceId(product.priceId)) {
    return { priceId: product.priceId, created: false };
  }

  // Idempotent lookup by metadata — never create duplicates.
  const existing = await stripe.prices.search({
    query: `metadata['tmi_catalog_key']:'${catalogId}' AND active:'true'`,
    limit: 1,
  });
  if (existing.data[0]) {
    return { priceId: existing.data[0].id, created: false };
  }

  const products = await stripe.products.search({
    query: `metadata['tmi_stripe_product_key']:'${key}' AND active:'true'`,
    limit: 1,
  });
  let stripeProductId = products.data[0]?.id;
  if (!stripeProductId) {
    const createdProduct = await stripe.products.create({
      name: product.name,
      metadata: {
        tmi_stripe_product_key: key,
        tmi_catalog_key: catalogId,
      },
    });
    stripeProductId = createdProduct.id;
  }

  const interval =
    "interval" in product && product.interval && product.interval !== "one_time"
      ? product.interval
      : null;

  const createdPrice = await stripe.prices.create({
    product: stripeProductId,
    currency: "usd",
    unit_amount: product.price,
    ...(interval
      ? { recurring: { interval: interval as "day" | "week" | "month" } }
      : {}),
    metadata: {
      tmi_catalog_key: catalogId,
      tmi_stripe_product_key: key,
    },
  });

  return { priceId: createdPrice.id, created: true };
}

async function main(): Promise<void> {
  const ledger = buildPricingSyncLedger();
  const results: SyncResult[] = [];

  for (const e of ledger.mapped) {
    results.push({
      catalogId: e.catalogId,
      stripeProductKey: e.stripeProductKey,
      action: "REUSED",
      priceId: e.priceId,
    });
  }

  for (const e of ledger.priceWithoutPlacement) {
    results.push({
      catalogId: e.catalogId,
      stripeProductKey: e.stripeProductKey,
      action: "PRICE_WITHOUT_PLACEMENT",
      priceId: e.priceId,
    });
  }

  if (!hasTestStripeKey()) {
    for (const e of ledger.stripeSyncPending) {
      results.push({
        catalogId: e.catalogId,
        stripeProductKey: e.stripeProductKey,
        action: hasLiveStripeKey() ? "SKIPPED_LIVE_KEY" : "STRIPE_SYNC_PENDING",
        priceId: e.priceId,
      });
    }

    const summary = {
      reused: results.filter((r) => r.action === "REUSED").length,
      created: 0,
      stripeSyncPending: results.filter((r) => r.action === "STRIPE_SYNC_PENDING").length,
      skippedLiveKey: results.filter((r) => r.action === "SKIPPED_LIVE_KEY").length,
      priceWithoutPlacement: results.filter((r) => r.action === "PRICE_WITHOUT_PLACEMENT").length,
      blocker: hasLiveStripeKey()
        ? "Live Stripe key present — refusing create (test-only). Set sk_test_ locally to sync pending SKUs."
        : "No Stripe TEST credentials locally — pending SKUs remain STRIPE_SYNC_PENDING (price_data checkout still works).",
    };

    console.log(JSON.stringify({ ok: true, summary, results }, null, 2));
    return;
  }

  const { default: Stripe } = await import("stripe");
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!.trim(), {
    apiVersion: "2026-02-25.clover",
  });

  let created = 0;
  for (const e of ledger.stripeSyncPending) {
    try {
      const ensured = await ensureTestPrice(stripe, e.stripeProductKey, e.catalogId);
      if (ensured.created) created += 1;
      results.push({
        catalogId: e.catalogId,
        stripeProductKey: e.stripeProductKey,
        action: ensured.created ? "CREATED" : "REUSED",
        priceId: ensured.priceId,
      });
    } catch (err) {
      results.push({
        catalogId: e.catalogId,
        stripeProductKey: e.stripeProductKey,
        action: "STRIPE_SYNC_PENDING",
        priceId: e.priceId,
      });
      console.error(`sync failed for ${e.catalogId}:`, err);
    }
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        summary: {
          reused: results.filter((r) => r.action === "REUSED").length,
          created,
          stripeSyncPending: results.filter((r) => r.action === "STRIPE_SYNC_PENDING").length,
          priceWithoutPlacement: results.filter((r) => r.action === "PRICE_WITHOUT_PLACEMENT").length,
        },
        results,
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
