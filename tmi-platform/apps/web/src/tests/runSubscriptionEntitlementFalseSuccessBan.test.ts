/**
 * False-success ban: subscription entitlement must not ack success when
 * Prisma User.tier update fails or updates zero rows.
 */

import { readFileSync } from "fs";
import { resolve } from "path";

describe("subscription entitlement false-success ban", () => {
  const webhookPath = resolve(__dirname, "../app/api/stripe/webhook/route.ts");
  const source = readFileSync(webhookPath, "utf8");

  it("grantSubscriptionTier does not swallow Prisma updateMany failures", () => {
    const fnStart = source.indexOf("async function grantSubscriptionTier");
    expect(fnStart).toBeGreaterThan(-1);
    const fnEnd = source.indexOf("\nasync function revokeSubscriptionTier", fnStart);
    const fnSlice = source.slice(fnStart, fnEnd > fnStart ? fnEnd : fnStart + 1600);
    expect(fnSlice).toContain("db.user.updateMany");
    expect(fnSlice).not.toMatch(/\.catch\(\(\)\s*=>\s*\{\}\)/);
    expect(fnSlice).toContain("subscription_entitlement_persist_failed");
    expect(fnSlice).toContain("result.count < 1");
  });

  it("durable Prisma write precedes the in-memory synchronization", () => {
    const fnStart = source.indexOf("async function grantSubscriptionTier");
    const fnSlice = source.slice(fnStart, source.indexOf("\nasync function revokeSubscriptionTier", fnStart));
    const prismaIdx = fnSlice.indexOf("db.user.updateMany");
    const memoryIdx = fnSlice.indexOf("syncPersistedUserTier(");
    expect(prismaIdx).toBeGreaterThan(-1);
    expect(memoryIdx).toBeGreaterThan(prismaIdx);
  });

  it("grantSubscriptionTier and expireGraceAndDowngrade guard post-write cache sync with entitlement epoch ordering", () => {
    const gracePath = resolve(__dirname, "../lib/stripe/billingGraceEngine.ts");
    const graceSource = readFileSync(gracePath, "utf8");
    expect(graceSource).toContain("attachImmediateWriteCacheSync");
    expect(graceSource).toContain("getEntitlementEpoch(");
    expect(source).toContain("attachImmediateWriteCacheSync");
    expect(source).toContain("getEntitlementEpoch(");
  });
});

describe("avatar save false-success ban", () => {
  const persistencePath = resolve(__dirname, "../lib/avatar/avatarPersistence.ts");
  const saveRoutePath = resolve(__dirname, "../app/api/avatar/save/route.ts");
  const equipRoutePath = resolve(__dirname, "../app/api/avatar/equip/route.ts");
  const persistence = readFileSync(persistencePath, "utf8");
  const saveRoute = readFileSync(saveRoutePath, "utf8");
  const equipRoute = readFileSync(equipRoutePath, "utf8");

  it("saveAvatarProfile/loadout do not catch-and-ignore durable failures", () => {
    const profileFn = persistence.slice(
      persistence.indexOf("export async function saveAvatarProfile"),
      persistence.indexOf("export async function saveAvatarInventory"),
    );
    const loadoutFn = persistence.slice(
      persistence.indexOf("export async function saveAvatarLoadout"),
      persistence.indexOf("export async function mintAvatarForUser"),
    );
    expect(profileFn).toContain("tx.avatarProfileRecord.upsert");
    expect(profileFn).not.toMatch(/catch\s*\{[^}]*\}/);
    expect(profileFn).toContain("tx.avatarLoadoutRecord.upsert");
    expect(loadoutFn).toContain("saveAvatarChanges");
    expect(loadoutFn).not.toMatch(/catch\s*\{[^}]*\}/);
  });

  it("POST /api/avatar/save returns 503 when durable persist fails", () => {
    expect(saveRoute).toContain("AVATAR_PERSISTENCE_FAILED");
    expect(saveRoute).toContain("status: 503");
    expect(saveRoute).toContain("durable: false");
    expect(saveRoute).toContain("durable: true");
  });

  it("POST /api/avatar/equip returns 503 when durable persist fails", () => {
    expect(equipRoute).toContain("AVATAR_PERSISTENCE_FAILED");
    expect(equipRoute).toContain("status: 503");
    expect(equipRoute).toContain("durable: false");
    expect(equipRoute).toContain("durable: true");
  });
});

describe("billing grace false-success ban", () => {
  const gracePath = resolve(__dirname, "../lib/stripe/billingGraceEngine.ts");
  const source = readFileSync(gracePath, "utf8");

  it("does not swallow Prisma updateMany failures on grace/downgrade", () => {
    expect(source).not.toMatch(/\.catch\(\(\)\s*=>\s*\{\}\)/);
    expect(source).toContain("billing_grace_enter_persist_failed");
    expect(source).toContain("billing_grace_clear_persist_failed");
    expect(source).toContain("subscription_downgrade_persist_failed");
  });

  it("expireGraceAndDowngrade writes Prisma before in-memory FREE", () => {
    const fnStart = source.indexOf("export async function expireGraceAndDowngrade");
    const fnEnd = source.indexOf("\nexport async function expireGraceIfDue", fnStart);
    const fnSlice = source.slice(fnStart, fnEnd > fnStart ? fnEnd : fnStart + 3600);
    const prismaIdx = fnSlice.indexOf("db.user.updateMany");
    const memoryIdx = fnSlice.indexOf("syncPersistedUserTier(");
    expect(prismaIdx).toBeGreaterThan(-1);
    expect(memoryIdx).toBeGreaterThan(prismaIdx);
  });

  it("expireGraceIfDue atomically conditions downgrade on past_due, expired deadline, and observed stripeSubscriptionId (including null)", () => {
    expect(source).toContain("billingStatus: 'past_due'");
    expect(source).toContain("billingGraceEndsAt: { lt: now }");
    expect(source).toContain("observedSubscriptionId: user.stripeSubscriptionId ?? null");
    expect(source).toContain("return expireGraceAndDowngrade(");
  });

  it("reverse ordering: a delayed post-grant read does not overwrite a newer revocation in the warm cache", async () => {
    const email = "reverse-race@themusiciansindex.test";
    const {
      bumpEntitlementEpoch,
      getEntitlementEpoch,
      attachImmediateWriteCacheSync,
    } = await import("../lib/stripe/billingGraceEngine");
    let cachedTier = "FREE";
    const fakeState = {
      tier: "FREE",
      stripeSubscriptionId: null as string | null,
      stripePriceId: null as string | null,
    };
    let releaseGrantRead!: () => void;
    let signalGrantReadStarted!: () => void;
    const grantReadStarted = new Promise<void>((resolve) => {
      signalGrantReadStarted = resolve;
    });
    const resumeGrantRead = new Promise<void>((resolve) => {
      releaseGrantRead = resolve;
    });
    const fakeDb = {
      user: {
        updateMany: async ({ data }: { data: Record<string, unknown> }) => {
          Object.assign(fakeState, data);
          return { count: 1 };
        },
        findFirst: async () => {
          const snapshot = { ...fakeState };
          signalGrantReadStarted();
          await resumeGrantRead;
          return snapshot;
        },
      },
    };
    const simulateGrantWithDelayedRead = async () => {
      const writeEpoch = bumpEntitlementEpoch(email);
      attachImmediateWriteCacheSync(fakeDb as never, email, "PRO");
      await fakeDb.user.updateMany({
        data: { tier: "PRO", stripeSubscriptionId: "sub_granted", stripePriceId: "price_pro" },
      });
      cachedTier = "PRO";
      const postWrite = await fakeDb.user.findFirst();
      if (postWrite.tier === "PRO" && getEntitlementEpoch(email) === writeEpoch) {
        cachedTier = "PRO";
      }
    };
    const grantPromise = simulateGrantWithDelayedRead();
    await grantReadStarted;
    // Concurrent revocation occurs while the grant's post-write read is still in flight
    bumpEntitlementEpoch(email);
    Object.assign(fakeState, { tier: "FREE", stripeSubscriptionId: null, stripePriceId: null });
    cachedTier = "FREE";
    releaseGrantRead();
    await grantPromise;
    expect(fakeState.tier).toBe("FREE");
    expect(cachedTier).toBe("FREE");
  });
});
