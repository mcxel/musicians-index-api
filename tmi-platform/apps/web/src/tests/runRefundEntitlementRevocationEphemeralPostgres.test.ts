/**
 * @jest-environment node
 *
 * Refund revocation on a REAL disposable PostgreSQL (owner-approved 2026-11-18).
 * Synthetic payment refs only; store_item_ownerships / venue_skin_ownerships built from
 * their existing migrations. Runs only against localhost tmi_* via TMI_EPHEMERAL_PG_URL.
 */
import { readFileSync } from "fs";
import { join } from "path";
import { Pool } from "pg";
import type { QueueSql } from "@/lib/live/backstage/ChallengerQueueService";
import { revokeRefundedEntitlements } from "@/lib/commerce/RefundEntitlementRevocation";
import { OwnershipRuntime } from "@/lib/commerce/OwnershipRuntime";
import { storeItemSku, venueSkinSku } from "@/lib/commerce/CommerceCatalogContract";
import {
  assertFulfillmentAllowed,
  createMemorySettlementBackendForTests,
  recordPaymentReversal,
  useCheckoutSettlementBackendForTests,
} from "@/lib/commerce/CheckoutSettlementAuthority";
import { recordCatalogPurchaseFulfillment, listOwnedCatalogItems } from "@/lib/foundry/catalog/FoundryCatalogOwnership";
import { authorizeDesignAssets, resolveDesignForRender } from "@/lib/foundry/catalog/FoundryCatalog";
import { validateVenueDesign } from "@/lib/venue/contracts/TmiVenueRuntimeContract";

const URL_ = process.env.TMI_EPHEMERAL_PG_URL ?? "";
const parsed = URL_ ? new URL(URL_) : null;
const SAFE = Boolean(parsed) && ["localhost", "127.0.0.1"].includes(parsed!.hostname) && /^\/tmi_[a-z0-9_]+$/.test(parsed!.pathname);
const d = SAFE ? describe : describe.skip;

const MIG = (p: string) => readFileSync(join(__dirname, "../../../../packages/db/prisma/migrations", p, "migration.sql"), "utf8");
const noFk = (sql: string) => sql.split(/DO \$\$|-- AddForeignKey|ALTER TABLE "\w+" ADD CONSTRAINT "\w+_userId_fkey"/)[0];

let pool: Pool;
let q: QueueSql;
const rows = async (sql: string, p: unknown[] = []) => (await pool.query(sql, p)).rows;

d("Refund entitlement revocation on real PostgreSQL 16", () => {
  beforeAll(async () => {
    pool = new Pool({ connectionString: URL_, max: 4 });
    await pool.query(`DROP TABLE IF EXISTS store_item_ownerships, venue_skin_ownerships CASCADE`);
    await pool.query(noFk(MIG("20260901000000_add_store_item_ownership")));
    await pool.query(noFk(MIG("20260719000000_add_venue_skin_ownership")));
    q = { query: async (s, p) => (await pool.query(s, p ?? [])).rows };
    useCheckoutSettlementBackendForTests(createMemorySettlementBackendForTests());
  });
  afterAll(async () => {
    useCheckoutSettlementBackendForTests(null);
    await pool?.end();
  });

  const seed = async () => {
    await pool.query(`TRUNCATE store_item_ownerships, venue_skin_ownerships`);
    // purchase A (pi_A / cs_A): a lobby skin store item, a Foundry floor, a venue skin
    await pool.query(`INSERT INTO store_item_ownerships ("id","userId","itemId","category","stripePaymentId","pricePaidCents","updatedAt") VALUES ('s1','buyer','lobby-neon','lobby','pi_A',299,NOW())`);
    await recordCatalogPurchaseFulfillment(q, { userId: "buyer", role: "PERFORMER", variantId: "floor_marble_black_gold_v1", paymentRef: "pi_A", pricePaidCents: 199 });
    await pool.query(`INSERT INTO venue_skin_ownerships ("id","userId","skinId","unlockedVia","stripePaymentId","updatedAt") VALUES ('v1','buyer','neon-club','purchase','cs_A',NOW())`);
    // separate valid purchase B (pi_B) and a season-pass skin that happens to share cs_A — must survive
    await pool.query(`INSERT INTO store_item_ownerships ("id","userId","itemId","category","stripePaymentId","pricePaidCents","updatedAt") VALUES ('s2','buyer','lobby-chill','lobby','pi_B',299,NOW())`);
    await pool.query(`INSERT INTO venue_skin_ownerships ("id","userId","skinId","unlockedVia","stripePaymentId","updatedAt") VALUES ('v2','buyer','gold-vip','season_pass','cs_A',NOW())`);
    OwnershipRuntime.grantEntitlement({ userId: "buyer", skuId: storeItemSku("lobby-neon"), title: "x", category: "skin", provenance: "PURCHASED", pricePaidCents: 299, orderId: "pi_A" });
    OwnershipRuntime.grantEntitlement({ userId: "buyer", skuId: venueSkinSku("neon-club"), title: "x", category: "skin", provenance: "PURCHASED", pricePaidCents: 299, orderId: "cs_A" });
  };

  it("full refund revokes exactly that payment's store item, Foundry item and purchased skin — not purchase B, not the season-pass skin", async () => {
    await seed();
    const r = await revokeRefundedEntitlements(q, { paymentIntentId: "pi_A", checkoutSessionIds: ["cs_A"], fullyRefunded: true });
    expect(r).toMatchObject({ status: "REVOKED", storeItems: 2, venueSkins: 1 });
    expect((await rows(`SELECT "itemId" FROM store_item_ownerships ORDER BY "itemId"`)).map((x) => x.itemId)).toEqual(["lobby-chill"]);
    expect((await rows(`SELECT "skinId", "unlockedVia" FROM venue_skin_ownerships`))).toEqual([{ skinId: "gold-vip", unlockedVia: "season_pass" }]);
    // in-memory fallback no longer grants the refunded items
    expect(OwnershipRuntime.hasEntitlement("buyer", storeItemSku("lobby-neon"))).toBe(false);
    expect(OwnershipRuntime.hasEntitlement("buyer", venueSkinSku("neon-club"))).toBe(false);
  });

  it("duplicate refund delivery is harmless (idempotent)", async () => {
    await seed();
    await revokeRefundedEntitlements(q, { paymentIntentId: "pi_A", checkoutSessionIds: ["cs_A"], fullyRefunded: true });
    expect(await revokeRefundedEntitlements(q, { paymentIntentId: "pi_A", checkoutSessionIds: ["cs_A"], fullyRefunded: true }))
      .toMatchObject({ status: "REVOKED", storeItems: 0, venueSkins: 0 });
  });

  it("partial refund revokes nothing automatically (no item-level data) and says so", async () => {
    await seed();
    expect(await revokeRefundedEntitlements(q, { paymentIntentId: "pi_A", checkoutSessionIds: ["cs_A"], fullyRefunded: false }))
      .toEqual({ status: "PARTIAL_REFUND_NOT_REVOKED", refs: ["pi_A", "cs_A"] });
    expect(Number((await rows(`SELECT COUNT(*)::int AS c FROM store_item_ownerships`))[0].c)).toBe(3);
  });

  it("refunded Foundry item can no longer be published or shown to the live audience", async () => {
    await seed();
    await revokeRefundedEntitlements(q, { paymentIntentId: "pi_A", checkoutSessionIds: ["cs_A"], fullyRefunded: true });
    const owned = await listOwnedCatalogItems(q, "buyer");
    const v = validateVenueDesign({ blueprintId: "monday-night-stage-arch-v2", surfaces: {}, lighting: { presetId: "house", accentColor: "#ffffff", intensity: 0.5 },
      placements: [{ placementId: "p0", kitAssetId: "floor_marble_black_gold_v1", position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] }] });
    if (!v.ok) throw new Error("design");
    expect(authorizeDesignAssets({ design: v.design, role: "PERFORMER", owned })).toMatchObject({ ok: false, issues: [{ code: "ITEM_NOT_OWNED" }] });
    expect(resolveDesignForRender(v.design, owned, "LIVE").design.placements).toEqual([]);
  });

  it("refund arriving BEFORE fulfilment blocks the later grant (out-of-order events)", async () => {
    expect((await assertFulfillmentAllowed({ checkoutSessionId: "cs_C", paymentIntentId: "pi_C" })).ok).toBe(true);
    await recordPaymentReversal({ paymentIntentId: "pi_C", kind: "REFUNDED", eventId: "evt_refund_C" });
    expect(await assertFulfillmentAllowed({ checkoutSessionId: "cs_C", paymentIntentId: "pi_C" })).toMatchObject({ ok: false, reason: "PAYMENT_LIFECYCLE_REFUNDED" });
  });

  it("no payment reference → nothing touched", async () => {
    await seed();
    expect(await revokeRefundedEntitlements(q, { paymentIntentId: null, checkoutSessionIds: [], fullyRefunded: true })).toEqual({ status: "NO_PAYMENT_REF", refs: [] });
    expect(Number((await rows(`SELECT COUNT(*)::int AS c FROM store_item_ownerships`))[0].c)).toBe(3);
  });
});

// Wiring guard (no DB): the Stripe webhook must call the revocation on charge.refunded and
// gate venue-skin + store fulfilment on the settlement lifecycle (refund-before-grant).
it("webhook wiring: charge.refunded revokes store items/skins; skin + store grants are refund-gated", () => {
  const src = readFileSync(join(__dirname, "../app/api/stripe/webhook/route.ts"), "utf8");
  const refund = src.slice(src.indexOf("if (event.type === 'charge.refunded')"));
  expect(refund).toContain("revokeRefundedEntitlements(");
  expect(refund).toContain("fullyRefunded: charge.refunded === true");
  expect(refund.indexOf("recordPaymentReversal(")).toBeLessThan(refund.indexOf("revokeRefundedEntitlements("));
  expect(src).toMatch(/skinSettlement = metadata\.type === 'venue_skin'\s*\?\s*await assertFulfillmentAllowed/);
  expect(src).toMatch(/storeSettlement = await assertFulfillmentAllowed/);
  expect(src).toMatch(/if \(storeSettlement\.ok && purchasedItems\.length > 0/);
});
