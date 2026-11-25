/**
 * Canonical checkout settlement authority for tip / boost / YoPho fulfillment.
 *
 * Webhook delivery ≠ settled money. Grants require:
 * - Correct event lifecycle (completed / async_payment_succeeded)
 * - session.payment_status === 'paid' (or async success path)
 * - No durable REFUNDED / DISPUTED / BLOCKED mark for the payment refs
 * - Exact catalog binding where a product is purchased (YoPho)
 *
 * Durability: production writes Postgres table `checkout_payment_lifecycle`
 * (ensure-DDL, same pattern as paid_surface_entitlements). State is monotonic
 * (REFUNDED wins over SETTLED) so refund-before-grant survives restarts and
 * multi-instance webhook delivery. Process-local Maps are never the source of truth.
 */

import type Stripe from "stripe";
import { STRIPE_PRODUCTS } from "@/lib/stripe/products";
import {
  getBoostProduct,
  type DiscoveryBoostTarget,
  type DiscoveryBoostTier,
} from "@/lib/discovery/DiscoveryBoostEngine";
import { YOPHO_SKIN_CATALOG, YOPHO_FREE_SKIN_IDS } from "@/lib/yopho/YoPhoSkinRegistry";

export type SettlementLifecycleState =
  | "OPEN"
  | "SETTLED"
  | "REFUNDED"
  | "DISPUTED"
  | "BLOCKED";

export type SettlementDecision = {
  ok: boolean;
  reason: string;
  state: SettlementLifecycleState;
  paymentStatus: string | null;
  checkoutSessionId: string | null;
  paymentIntentId: string | null;
};

export type YoPhoCatalogBinding = {
  ok: boolean;
  reason: string;
  itemId: string | null;
  itemKind: "skin_099" | "prop_pack_299" | null;
  expectedPriceCents: number | null;
  catalogPriceId: string | null;
  catalogProductId: string | null;
  purchaserUserId: string | null;
};

type LifecycleRecord = {
  refKey: string;
  checkoutSessionId: string | null;
  paymentIntentId: string | null;
  state: SettlementLifecycleState;
  stateRank: number;
  amountCents: number | null;
  currency: string | null;
  updatedAtMs: number;
  lastEventId: string | null;
};

type SettlementBackend = {
  ensure(): Promise<void>;
  readByKeys(keys: string[]): Promise<LifecycleRecord[]>;
  upsert(records: LifecycleRecord[]): Promise<LifecycleRecord[]>;
  clearAll(): Promise<void>;
};

const STATE_RANK: Record<SettlementLifecycleState, number> = {
  OPEN: 0,
  SETTLED: 1,
  BLOCKED: 2,
  DISPUTED: 3,
  REFUNDED: 4,
};

function isTestRuntime(): boolean {
  return process.env.NODE_ENV === "test" || Boolean(process.env.JEST_WORKER_ID);
}

function refsToKeys(input: {
  checkoutSessionId?: string | null;
  paymentIntentId?: string | null;
}): string[] {
  const keys: string[] = [];
  if (input.checkoutSessionId?.trim()) keys.push(`cs:${input.checkoutSessionId.trim()}`);
  if (input.paymentIntentId?.trim()) keys.push(`pi:${input.paymentIntentId.trim()}`);
  return keys;
}

function paymentIntentFromSession(session: Stripe.Checkout.Session): string | null {
  if (typeof session.payment_intent === "string") return session.payment_intent;
  return session.payment_intent?.id ?? null;
}

function mergeState(
  current: SettlementLifecycleState | undefined,
  next: SettlementLifecycleState,
): SettlementLifecycleState {
  if (!current) return next;
  return STATE_RANK[next] >= STATE_RANK[current] ? next : current;
}

function strongestState(records: LifecycleRecord[]): SettlementLifecycleState {
  let strongest: SettlementLifecycleState = "OPEN";
  for (const rec of records) strongest = mergeState(strongest, rec.state);
  return strongest;
}

// ─── Durable backends ───────────────────────────────────────────────────────

/** Test-only durable store — survives "process restart" simulation; not used in production. */
function createMemoryDurableBackend(): SettlementBackend {
  const rows = new Map<string, LifecycleRecord>();
  return {
    async ensure() {
      /* no-op */
    },
    async readByKeys(keys) {
      return keys.map((k) => rows.get(k)).filter(Boolean) as LifecycleRecord[];
    },
    async upsert(records) {
      const out: LifecycleRecord[] = [];
      for (const incoming of records) {
        const prev = rows.get(incoming.refKey);
        const state = mergeState(prev?.state, incoming.state);
        const merged: LifecycleRecord = {
          refKey: incoming.refKey,
          checkoutSessionId: incoming.checkoutSessionId ?? prev?.checkoutSessionId ?? null,
          paymentIntentId: incoming.paymentIntentId ?? prev?.paymentIntentId ?? null,
          state,
          stateRank: STATE_RANK[state],
          amountCents: incoming.amountCents ?? prev?.amountCents ?? null,
          currency: incoming.currency ?? prev?.currency ?? null,
          updatedAtMs: incoming.updatedAtMs,
          lastEventId: incoming.lastEventId ?? prev?.lastEventId ?? null,
        };
        rows.set(incoming.refKey, merged);
        out.push(merged);
      }
      return out;
    },
    async clearAll() {
      rows.clear();
    },
  };
}

type PgRow = {
  ref_key: string;
  checkout_session_id: string | null;
  payment_intent_id: string | null;
  state: string;
  state_rank: number;
  amount_cents: number | null;
  currency: string | null;
  updated_at_ms: string | number | bigint;
  last_event_id: string | null;
};

function mapPgRow(row: PgRow): LifecycleRecord {
  return {
    refKey: row.ref_key,
    checkoutSessionId: row.checkout_session_id,
    paymentIntentId: row.payment_intent_id,
    state: row.state as SettlementLifecycleState,
    stateRank: Number(row.state_rank),
    amountCents: row.amount_cents,
    currency: row.currency,
    updatedAtMs: Number(row.updated_at_ms),
    lastEventId: row.last_event_id,
  };
}

function createPostgresBackend(): SettlementBackend {
  let schemaReady: Promise<void> | null = null;
  return {
    async ensure() {
      if (process.env.TMI_FORBID_SCHEMA_HEAL === "1") return;
      if (!schemaReady) {
        schemaReady = (async () => {
          const { default: prisma } = await import("@/lib/prisma");
          await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS checkout_payment_lifecycle (
              ref_key TEXT PRIMARY KEY,
              checkout_session_id TEXT,
              payment_intent_id TEXT,
              state TEXT NOT NULL,
              state_rank INTEGER NOT NULL,
              amount_cents INTEGER,
              currency TEXT,
              last_event_id TEXT,
              updated_at_ms BIGINT NOT NULL,
              created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
          `);
          await prisma.$executeRawUnsafe(`
            CREATE INDEX IF NOT EXISTS checkout_payment_lifecycle_cs_idx
              ON checkout_payment_lifecycle (checkout_session_id)
              WHERE checkout_session_id IS NOT NULL;
          `);
          await prisma.$executeRawUnsafe(`
            CREATE INDEX IF NOT EXISTS checkout_payment_lifecycle_pi_idx
              ON checkout_payment_lifecycle (payment_intent_id)
              WHERE payment_intent_id IS NOT NULL;
          `);
        })().catch((err) => {
          schemaReady = null;
          throw err;
        });
      }
      await schemaReady;
    },
    async readByKeys(keys) {
      if (keys.length === 0) return [];
      await this.ensure();
      const { default: prisma } = await import("@/lib/prisma");
      const rows = await prisma.$queryRawUnsafe<PgRow[]>(
        `SELECT * FROM checkout_payment_lifecycle WHERE ref_key = ANY($1::text[])`,
        keys,
      );
      return rows.map(mapPgRow);
    },
    async upsert(records) {
      if (records.length === 0) return [];
      await this.ensure();
      const { default: prisma } = await import("@/lib/prisma");
      const out: LifecycleRecord[] = [];
      // Transactional monotonic merge — concurrent refunds cannot lose to SETTLED.
      await prisma.$transaction(async (tx) => {
        for (const incoming of records) {
          const rows = await tx.$queryRawUnsafe<PgRow[]>(
            `INSERT INTO checkout_payment_lifecycle
              (ref_key, checkout_session_id, payment_intent_id, state, state_rank,
               amount_cents, currency, last_event_id, updated_at_ms)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
             ON CONFLICT (ref_key) DO UPDATE SET
               checkout_session_id = COALESCE(EXCLUDED.checkout_session_id, checkout_payment_lifecycle.checkout_session_id),
               payment_intent_id = COALESCE(EXCLUDED.payment_intent_id, checkout_payment_lifecycle.payment_intent_id),
               state = CASE
                 WHEN EXCLUDED.state_rank >= checkout_payment_lifecycle.state_rank THEN EXCLUDED.state
                 ELSE checkout_payment_lifecycle.state
               END,
               state_rank = GREATEST(EXCLUDED.state_rank, checkout_payment_lifecycle.state_rank),
               amount_cents = COALESCE(EXCLUDED.amount_cents, checkout_payment_lifecycle.amount_cents),
               currency = COALESCE(EXCLUDED.currency, checkout_payment_lifecycle.currency),
               last_event_id = COALESCE(EXCLUDED.last_event_id, checkout_payment_lifecycle.last_event_id),
               updated_at_ms = EXCLUDED.updated_at_ms
             RETURNING *`,
            incoming.refKey,
            incoming.checkoutSessionId,
            incoming.paymentIntentId,
            incoming.state,
            incoming.stateRank,
            incoming.amountCents,
            incoming.currency,
            incoming.lastEventId,
            incoming.updatedAtMs,
          );
          if (rows[0]) out.push(mapPgRow(rows[0]));
        }
      });
      return out;
    },
    async clearAll() {
      await this.ensure();
      const { default: prisma } = await import("@/lib/prisma");
      await prisma.$executeRawUnsafe(`DELETE FROM checkout_payment_lifecycle`);
    },
  };
}

const memoryDurableBackend = createMemoryDurableBackend();
const postgresBackend = createPostgresBackend();

let backendOverride: SettlementBackend | null = null;

function getBackend(): SettlementBackend {
  if (backendOverride) return backendOverride;
  // Production / Preview / Development → Postgres. Tests default to durable memory
  // unless TMI_SETTLEMENT_FORCE_POSTGRES=1 (integration).
  if (isTestRuntime() && process.env.TMI_SETTLEMENT_FORCE_POSTGRES !== "1") {
    return memoryDurableBackend;
  }
  return postgresBackend;
}

/** Test helper: swap backend (e.g. force postgres). */
export function useCheckoutSettlementBackendForTests(backend: SettlementBackend | null): void {
  if (!isTestRuntime()) {
    throw new Error("useCheckoutSettlementBackendForTests refused outside test runtime");
  }
  backendOverride = backend;
}

export function createMemorySettlementBackendForTests(): SettlementBackend {
  if (!isTestRuntime()) {
    throw new Error("createMemorySettlementBackendForTests refused outside test runtime");
  }
  return createMemoryDurableBackend();
}

async function writeLifecycle(input: {
  checkoutSessionId?: string | null;
  paymentIntentId?: string | null;
  state: SettlementLifecycleState;
  amountCents?: number | null;
  currency?: string | null;
  eventId?: string | null;
}): Promise<SettlementLifecycleState> {
  const keys = refsToKeys(input);
  if (keys.length === 0) return input.state;
  const now = Date.now();
  const records: LifecycleRecord[] = keys.map((refKey) => ({
    refKey,
    checkoutSessionId: input.checkoutSessionId ?? null,
    paymentIntentId: input.paymentIntentId ?? null,
    state: input.state,
    stateRank: STATE_RANK[input.state],
    amountCents: input.amountCents ?? null,
    currency: input.currency ?? null,
    updatedAtMs: now,
    lastEventId: input.eventId ?? null,
  }));
  // Cross-link both refs onto every row so either key finds the pair.
  if (input.checkoutSessionId && input.paymentIntentId) {
    for (const rec of records) {
      rec.checkoutSessionId = input.checkoutSessionId;
      rec.paymentIntentId = input.paymentIntentId;
    }
  }
  const written = await getBackend().upsert(records);
  return strongestState(written.length ? written : records);
}

export async function getPaymentLifecycleState(input: {
  checkoutSessionId?: string | null;
  paymentIntentId?: string | null;
}): Promise<SettlementLifecycleState> {
  const keys = refsToKeys(input);
  if (keys.length === 0) return "OPEN";
  const rows = await getBackend().readByKeys(keys);
  return strongestState(rows);
}

/** Persist refund/dispute/block independently of entitlement rows. */
export async function recordPaymentReversal(input: {
  checkoutSessionId?: string | null;
  paymentIntentId?: string | null;
  kind: "REFUNDED" | "DISPUTED" | "BLOCKED";
  amountCents?: number | null;
  currency?: string | null;
  eventId?: string | null;
}): Promise<SettlementLifecycleState> {
  return writeLifecycle({
    checkoutSessionId: input.checkoutSessionId,
    paymentIntentId: input.paymentIntentId,
    state: input.kind,
    amountCents: input.amountCents,
    currency: input.currency,
    eventId: input.eventId,
  });
}

export async function recordPaymentSettled(input: {
  checkoutSessionId?: string | null;
  paymentIntentId?: string | null;
  amountCents?: number | null;
  currency?: string | null;
  eventId?: string | null;
}): Promise<SettlementLifecycleState> {
  return writeLifecycle({
    ...input,
    state: "SETTLED",
  });
}

/**
 * Evaluate whether a Checkout Session event may fulfill benefits.
 * Does not grant — callers must still run product-specific binding.
 */
export async function evaluateCheckoutSettlement(input: {
  eventType: string;
  session: Pick<
    Stripe.Checkout.Session,
    "id" | "mode" | "payment_status" | "amount_total" | "currency" | "payment_intent" | "livemode"
  >;
  eventId?: string | null;
  requireModePayment?: boolean;
}): Promise<SettlementDecision> {
  const session = input.session;
  const checkoutSessionId = session.id ?? null;
  const paymentIntentId = paymentIntentFromSession(session as Stripe.Checkout.Session);
  const paymentStatus = session.payment_status ?? null;
  const lifecycle = await getPaymentLifecycleState({ checkoutSessionId, paymentIntentId });

  if (lifecycle === "REFUNDED" || lifecycle === "DISPUTED" || lifecycle === "BLOCKED") {
    return {
      ok: false,
      reason: `PAYMENT_LIFECYCLE_${lifecycle}`,
      state: lifecycle,
      paymentStatus,
      checkoutSessionId,
      paymentIntentId,
    };
  }

  const successEvents = new Set([
    "checkout.session.completed",
    "checkout.session.async_payment_succeeded",
  ]);
  if (!successEvents.has(input.eventType)) {
    return {
      ok: false,
      reason: "EVENT_NOT_SETTLEMENT_SUCCESS",
      state: lifecycle,
      paymentStatus,
      checkoutSessionId,
      paymentIntentId,
    };
  }

  if (input.eventType === "checkout.session.completed" && paymentStatus === "unpaid") {
    return {
      ok: false,
      reason: "PAYMENT_PENDING_ASYNC",
      state: lifecycle,
      paymentStatus,
      checkoutSessionId,
      paymentIntentId,
    };
  }

  if (paymentStatus !== "paid") {
    return {
      ok: false,
      reason: `PAYMENT_STATUS_${String(paymentStatus || "missing").toUpperCase()}`,
      state: lifecycle,
      paymentStatus,
      checkoutSessionId,
      paymentIntentId,
    };
  }

  if (input.requireModePayment !== false && session.mode && session.mode !== "payment") {
    return {
      ok: false,
      reason: "CHECKOUT_MODE_NOT_PAYMENT",
      state: lifecycle,
      paymentStatus,
      checkoutSessionId,
      paymentIntentId,
    };
  }

  if (!checkoutSessionId) {
    return {
      ok: false,
      reason: "MISSING_CHECKOUT_SESSION_ID",
      state: lifecycle,
      paymentStatus,
      checkoutSessionId,
      paymentIntentId,
    };
  }

  const state = await recordPaymentSettled({
    checkoutSessionId,
    paymentIntentId,
    amountCents: session.amount_total ?? null,
    currency: session.currency ?? null,
    eventId: input.eventId,
  });

  const after = await getPaymentLifecycleState({ checkoutSessionId, paymentIntentId });
  if (after === "REFUNDED" || after === "DISPUTED" || after === "BLOCKED") {
    return {
      ok: false,
      reason: `PAYMENT_LIFECYCLE_${after}`,
      state: after,
      paymentStatus,
      checkoutSessionId,
      paymentIntentId,
    };
  }

  return {
    ok: true,
    reason: "SETTLED",
    state,
    paymentStatus,
    checkoutSessionId,
    paymentIntentId,
  };
}

export async function assertFulfillmentAllowed(input: {
  checkoutSessionId?: string | null;
  paymentIntentId?: string | null;
}): Promise<SettlementDecision> {
  const state = await getPaymentLifecycleState(input);
  if (state === "REFUNDED" || state === "DISPUTED" || state === "BLOCKED") {
    return {
      ok: false,
      reason: `PAYMENT_LIFECYCLE_${state}`,
      state,
      paymentStatus: null,
      checkoutSessionId: input.checkoutSessionId ?? null,
      paymentIntentId: input.paymentIntentId ?? null,
    };
  }
  return {
    ok: true,
    reason: "FULFILLMENT_ALLOWED",
    state,
    paymentStatus: null,
    checkoutSessionId: input.checkoutSessionId ?? null,
    paymentIntentId: input.paymentIntentId ?? null,
  };
}

/** Exact YoPho catalog binding — metadata is untrusted. */
export function resolveYoPhoCatalogBinding(input: {
  metadata: Record<string, string | undefined>;
  amountTotal: number | null | undefined;
  currency: string | null | undefined;
}): YoPhoCatalogBinding {
  const metadata = input.metadata || {};
  const type = metadata.type || "";
  if (!["yopho_commerce", "yopho_skin", "yopho_prop_pack"].includes(type)) {
    return {
      ok: false,
      reason: "YOPHO_TYPE_INVALID",
      itemId: null,
      itemKind: null,
      expectedPriceCents: null,
      catalogPriceId: null,
      catalogProductId: null,
      purchaserUserId: null,
    };
  }

  const itemId = (metadata.itemId || metadata.skinId || metadata.propPackId || "").trim();
  const purchaserUserId = (metadata.buyerId || metadata.userId || "").trim() || null;
  if (!itemId) {
    return {
      ok: false,
      reason: "YOPHO_ITEM_MISSING",
      itemId: null,
      itemKind: null,
      expectedPriceCents: null,
      catalogPriceId: null,
      catalogProductId: null,
      purchaserUserId,
    };
  }
  if (metadata.buyerId && metadata.userId && metadata.buyerId !== metadata.userId) {
    return {
      ok: false,
      reason: "YOPHO_PURCHASER_MISMATCH",
      itemId,
      itemKind: null,
      expectedPriceCents: null,
      catalogPriceId: null,
      catalogProductId: null,
      purchaserUserId,
    };
  }
  if (!purchaserUserId) {
    return {
      ok: false,
      reason: "YOPHO_PURCHASER_MISSING",
      itemId,
      itemKind: null,
      expectedPriceCents: null,
      catalogPriceId: null,
      catalogProductId: null,
      purchaserUserId: null,
    };
  }

  const isPropPack = type === "yopho_prop_pack";
  const catalog = isPropPack ? STRIPE_PRODUCTS.YOPHO_PROP_PACK_299 : STRIPE_PRODUCTS.YOPHO_SKIN_099;
  const itemKind: "skin_099" | "prop_pack_299" = isPropPack ? "prop_pack_299" : "skin_099";

  const snapshotCents = metadata.expectedPriceCents
    ? Number.parseInt(metadata.expectedPriceCents, 10)
    : NaN;
  const expectedPriceCents = Number.isFinite(snapshotCents) ? snapshotCents : catalog.price;
  const catalogPriceId = metadata.catalogPriceId || catalog.priceId;
  const catalogProductId = metadata.catalogProductId || catalog.productId;

  if (!isPropPack) {
    const skin = YOPHO_SKIN_CATALOG.find((s) => s.id === itemId);
    if (!skin) {
      return {
        ok: false,
        reason: "YOPHO_ITEM_NOT_IN_CATALOG",
        itemId,
        itemKind,
        expectedPriceCents,
        catalogPriceId,
        catalogProductId,
        purchaserUserId,
      };
    }
    if (YOPHO_FREE_SKIN_IDS.includes(itemId) || skin.priceUsd <= 0) {
      return {
        ok: false,
        reason: "YOPHO_ITEM_NOT_PAID_PRODUCT",
        itemId,
        itemKind,
        expectedPriceCents,
        catalogPriceId,
        catalogProductId,
        purchaserUserId,
      };
    }
  }

  const amountTotal = input.amountTotal ?? null;
  const currency = (input.currency || "").toLowerCase();
  if (currency !== "usd") {
    return {
      ok: false,
      reason: "YOPHO_CURRENCY_MISMATCH",
      itemId,
      itemKind,
      expectedPriceCents,
      catalogPriceId,
      catalogProductId,
      purchaserUserId,
    };
  }
  if (amountTotal == null || amountTotal !== expectedPriceCents) {
    return {
      ok: false,
      reason: "YOPHO_AMOUNT_MISMATCH",
      itemId,
      itemKind,
      expectedPriceCents,
      catalogPriceId,
      catalogProductId,
      purchaserUserId,
    };
  }
  if (metadata.catalogPriceId && metadata.catalogPriceId !== catalog.priceId) {
    if (metadata.catalogProductId && metadata.catalogProductId !== catalog.productId) {
      return {
        ok: false,
        reason: "YOPHO_PRICE_ID_MISMATCH",
        itemId,
        itemKind,
        expectedPriceCents,
        catalogPriceId,
        catalogProductId,
        purchaserUserId,
      };
    }
  }

  return {
    ok: true,
    reason: "YOPHO_CATALOG_BOUND",
    itemId,
    itemKind,
    expectedPriceCents,
    catalogPriceId,
    catalogProductId,
    purchaserUserId,
  };
}

export function resolveDiscoveryBoostExpectedCents(
  tier: DiscoveryBoostTier,
  _target?: DiscoveryBoostTarget,
): number {
  return getBoostProduct(tier).priceCents;
}

export function evaluateBoostSettlementAmount(input: {
  amountTotal: number | null | undefined;
  currency: string | null | undefined;
  expectedPriceCents: number;
}): { ok: boolean; reason: string } {
  if ((input.currency || "").toLowerCase() !== "usd") {
    return { ok: false, reason: "BOOST_CURRENCY_MISMATCH" };
  }
  if (input.amountTotal == null || input.amountTotal !== input.expectedPriceCents) {
    return { ok: false, reason: "BOOST_AMOUNT_MISMATCH" };
  }
  return { ok: true, reason: "BOOST_AMOUNT_OK" };
}

/**
 * Simulate multi-instance / process restart: drop any backend override L1 and
 * re-bind to a fresh memory durable copy only when tests explicitly replace
 * the backend. For the default memory durable backend, restart is a no-op on
 * data (proving durability). For postgres, no process cache exists.
 */
export async function simulateSettlementProcessRestartForTests(): Promise<void> {
  if (!isTestRuntime()) {
    throw new Error("simulateSettlementProcessRestartForTests refused outside test runtime");
  }
  // No process-local settlement cache remains — durability is the backend itself.
  // Re-read path is always via getBackend().readByKeys.
}

export async function resetCheckoutSettlementForTests(): Promise<void> {
  if (!isTestRuntime()) {
    throw new Error("resetCheckoutSettlementForTests refused outside test runtime");
  }
  backendOverride = null;
  await memoryDurableBackend.clearAll();
  if (process.env.TMI_SETTLEMENT_FORCE_POSTGRES === "1") {
    await postgresBackend.clearAll();
  }
}
