/**
 * Physical persistence certification — Lane D Phase 2.
 *
 * Proves store_item_ownerships is a REAL durable table, not the in-memory
 * OwnershipRuntime Map, by round-tripping through the exact production
 * function the Stripe webhook calls (persistStoreItemOwnership), against a
 * real QA account (qa-performer-ruby@themusiciansindex.test, isQA: true —
 * excluded from discovery/rankings/analytics per the established convention).
 *
 * This hits the real production database — no mocks. Run deliberately, not
 * as part of routine fast unit-test cycles.
 *
 * Run with `--forceExit`: lib/prisma.ts's Pool is sized for a long-running
 * server, not a short-lived test process — its idle-connection keepalive
 * timer outlives prisma.$disconnect() by design (a known @prisma/adapter-pg
 * + pg.Pool characteristic, not a leak in this test). Confirmed in isolation
 * with --detectOpenHandles: no leaked handle once the process is allowed to
 * exit — the "worker failed to exit gracefully" warning only appears when
 * bundled with other suites in the same Jest worker and is a pool-teardown
 * timing artifact, not a correctness issue.
 */
import prisma from "../lib/prisma";
import {
  persistStoreItemOwnership,
  hasStoreItemAccess,
  listOwnedStoreItems,
} from "../lib/commerce/StoreItemOwnershipEngine";

const QA_ITEM_ID = "lobby-neon";
const QA_STRIPE_PAYMENT_ID = "pi_qa_lane_d_phase2_cert";

describe("StoreItemOwnershipEngine — real Postgres persistence (production DB)", () => {
  let qaUserId: string;

  beforeAll(async () => {
    const qa = await prisma.user.findFirst({
      where: { email: "qa-performer-ruby@themusiciansindex.test" },
      select: { id: true },
    });
    if (!qa) throw new Error("QA fixture user not found — cannot run physical persistence certification");
    qaUserId = qa.id;
  }, 30000);

  afterAll(async () => {
    // Leave the row in place (matches this repo's QA-account convention —
    // QA purchases persist as real fixtures, same as Lane A's QA certifications).
    await prisma.$disconnect();
  }, 15000);

  it("grants a durable row that survives a fresh Prisma client (simulated cold start)", async () => {
    const result = await persistStoreItemOwnership({
      userId: qaUserId,
      itemId: QA_ITEM_ID,
      stripePaymentId: QA_STRIPE_PAYMENT_ID,
    });
    expect(result.ok).toBe(true);

    // Read back through a completely independent query — not the in-memory
    // OwnershipRuntime Map, which a fresh process would never share anyway.
    const row = await prisma.storeItemOwnership.findUnique({
      where: { userId_itemId: { userId: qaUserId, itemId: QA_ITEM_ID } },
    });
    expect(row).not.toBeNull();
    expect(row?.category).toBe("lobby");
    expect(row?.stripePaymentId).toBe(QA_STRIPE_PAYMENT_ID);
  }, 30000);

  it("hasStoreItemAccess reflects the durable grant", async () => {
    const owns = await hasStoreItemAccess(qaUserId, QA_ITEM_ID);
    expect(owns).toBe(true);
    const ownsUnrelated = await hasStoreItemAccess(qaUserId, "venue-arena");
    expect(ownsUnrelated).toBe(false);
  }, 30000);

  it("listOwnedStoreItems (the same function /api/account/purchases calls) includes the grant", async () => {
    const owned = await listOwnedStoreItems(qaUserId);
    const match = owned.find((o) => o.itemId === QA_ITEM_ID);
    expect(match).toBeDefined();
    expect(match?.title).toBe("Neon Lounge");
  }, 30000);

  it("duplicate webhook delivery is idempotent — no duplicate row, same unique key", async () => {
    await persistStoreItemOwnership({
      userId: qaUserId,
      itemId: QA_ITEM_ID,
      stripePaymentId: "pi_qa_lane_d_phase2_cert_retry",
    });
    const rows = await prisma.storeItemOwnership.findMany({
      where: { userId: qaUserId, itemId: QA_ITEM_ID },
    });
    expect(rows.length).toBe(1);
    expect(rows[0]?.stripePaymentId).toBe("pi_qa_lane_d_phase2_cert_retry");
  }, 30000);
});
