/**
 * SERVER-ONLY. Foundry catalog ownership on the EXISTING store_item_ownerships table
 * (itemId = "foundry:<variantId>", category = "foundry"). No new table, no migration.
 *
 * - claimFreeCatalogItem: FREE + certified + role-eligible items enter the inventory.
 * - recordCatalogPurchaseFulfillment: the ONLY way a PAID item becomes owned. Called by
 *   verified payment fulfilment (not exposed by any route). Paid items currently have no
 *   Stripe price (PRICE_PENDING), so nothing in production calls it yet.
 * - listOwnedCatalogItems: canonical read path; also reads legacy venue_skin_ownerships
 *   (VenueSkinCommerce) through an adapter so one resolver sees both systems.
 */
import { randomUUID } from "crypto";
import type { QueueSql } from "@/lib/live/backstage/ChallengerQueueService";
import { catalogOwnershipItemId, getCatalogVariant, type CatalogSpace } from "./FoundryCatalog";

export type CatalogOwnershipError = "UNKNOWN_ITEM" | "NOT_FREE" | "NOT_PAID_ITEM" | "NOT_CERTIFIED" | "ROLE_NOT_ELIGIBLE" | "PAYMENT_REF_REQUIRED";
export type CatalogOwnershipResult = { ok: true; itemId: string; created: boolean } | { ok: false; error: CatalogOwnershipError };

function roleSpaces(role: string): CatalogSpace[] {
  const r = role.toUpperCase();
  if (r === "ADMIN" || r === "STAFF") return ["PERFORMER_VENUE", "PERFORMER_LOBBY", "FAN_LOBBY", "LOUNGE"];
  if (r === "FAN") return ["FAN_LOBBY"];
  if (["PERFORMER", "BAND", "ARTIST", "VENUE", "PRODUCER"].includes(r)) return ["PERFORMER_VENUE", "PERFORMER_LOBBY", "LOUNGE"];
  return [];
}

async function upsertOwnership(q: QueueSql, userId: string, itemId: string, paymentRef: string | null, cents: number): Promise<boolean> {
  const rows = await q.query<{ id: string }>(
    `INSERT INTO store_item_ownerships ("id", "userId", "itemId", "category", "stripePaymentId", "pricePaidCents", "updatedAt")
     VALUES ($1, $2, $3, 'foundry', $4, $5, NOW())
     ON CONFLICT ("userId", "itemId") DO NOTHING
     RETURNING "id"`,
    [randomUUID(), userId, itemId, paymentRef, cents],
  );
  return rows.length === 1;
}

export async function claimFreeCatalogItem(q: QueueSql, input: { userId: string; role: string; variantId: string }): Promise<CatalogOwnershipResult> {
  const c = getCatalogVariant(input.variantId);
  if (!c) return { ok: false, error: "UNKNOWN_ITEM" };
  if (c.pricing.kind !== "FREE") return { ok: false, error: "NOT_FREE" };
  if (c.certification !== "CERTIFIED") return { ok: false, error: "NOT_CERTIFIED" };
  if (!c.spaces.some((s) => roleSpaces(input.role).includes(s))) return { ok: false, error: "ROLE_NOT_ELIGIBLE" };
  const itemId = catalogOwnershipItemId(c.variantId);
  return { ok: true, itemId, created: await upsertOwnership(q, input.userId, itemId, null, 0) };
}

export async function recordCatalogPurchaseFulfillment(
  q: QueueSql,
  input: { userId: string; role: string; variantId: string; paymentRef: string; pricePaidCents: number },
): Promise<CatalogOwnershipResult> {
  const c = getCatalogVariant(input.variantId);
  if (!c) return { ok: false, error: "UNKNOWN_ITEM" };
  if (c.pricing.kind !== "PAID") return { ok: false, error: "NOT_PAID_ITEM" };
  if (!input.paymentRef) return { ok: false, error: "PAYMENT_REF_REQUIRED" };
  if (!c.spaces.some((s) => roleSpaces(input.role).includes(s))) return { ok: false, error: "ROLE_NOT_ELIGIBLE" };
  const itemId = catalogOwnershipItemId(c.variantId);
  return { ok: true, itemId, created: await upsertOwnership(q, input.userId, itemId, input.paymentRef, Math.max(0, Math.floor(input.pricePaidCents))) };
}

/**
 * Refund/chargeback revocation for Foundry catalog items, keyed by the payment reference
 * recorded at fulfilment. Only removes foundry:* rows for that exact payment. NOT yet
 * called by the Stripe webhook (its charge.refunded branch revokes boosts/YoPho but no
 * store items) — wiring it there is a payment-path change awaiting owner approval.
 */
export async function revokeCatalogOwnershipByPaymentRef(q: QueueSql, paymentRef: string): Promise<{ revoked: number }> {
  if (!paymentRef) return { revoked: 0 };
  const rows = await q.query<{ id: string }>(
    `DELETE FROM store_item_ownerships WHERE "stripePaymentId" = $1 AND "itemId" LIKE 'foundry:%' RETURNING "id"`,
    [paymentRef],
  );
  return { revoked: rows.length };
}

export async function listOwnedCatalogItems(q: QueueSql, userId: string): Promise<Set<string>> {
  const owned = new Set<string>();
  const rows = await q.query<{ itemId: string }>(`SELECT "itemId" FROM store_item_ownerships WHERE "userId" = $1`, [userId]);
  rows.forEach((r) => owned.add(r.itemId));
  // Check existence first: a failed query inside the caller's transaction would abort it.
  const has = await q.query<{ ok: boolean }>(`SELECT to_regclass('venue_skin_ownerships') IS NOT NULL AS ok`);
  if (has[0]?.ok) {
    const legacy = await q.query<{ skinId: string }>(`SELECT "skinId" FROM venue_skin_ownerships WHERE "userId" = $1`, [userId]);
    legacy.forEach((r) => owned.add(`venue-skin:${r.skinId}`));
  }
  return owned;
}
