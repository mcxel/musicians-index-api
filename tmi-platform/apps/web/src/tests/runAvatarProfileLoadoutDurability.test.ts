/**
 * CUR-01 — Durable AvatarProfile + AvatarLoadout persistence.
 * Proves SAVE → clear warm cache → LOAD reads Prisma (not globalThis alone).
 * False-success ban: save MUST throw when durable Prisma write fails.
 * Does not run production migrate deploy (PRODUCTION_DB_MUTATIONS=NO).
 */

import {
  clearAvatarPersistenceWarmCache,
  getAvatarLoadout,
  getAvatarProfile,
  saveAvatarLoadout,
  saveAvatarProfile,
} from "@/lib/avatar/avatarPersistence";

const url = process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL) : null;
const isolatedDatabase = process.env.TMI_ALLOW_REAL_DB_PERSISTENCE_TEST === "1" &&
  url !== null && ["localhost", "127.0.0.1", "::1"].includes(url.hostname) &&
  url.pathname.includes("test");

describe("CUR-01 AvatarProfile + AvatarLoadout durable persistence", () => {
  const userId = `cur01-durability-${Date.now()}`;

  afterAll(() => {
    clearAvatarPersistenceWarmCache(userId);
  });

  it("exports async save/load and warm-cache clear helper", () => {
    expect(typeof saveAvatarProfile).toBe("function");
    expect(typeof saveAvatarLoadout).toBe("function");
    expect(typeof getAvatarProfile).toBe("function");
    expect(typeof getAvatarLoadout).toBe("function");
    expect(typeof clearAvatarPersistenceWarmCache).toBe("function");
  });

  (isolatedDatabase ? it : it.skip)("SAVE → clear warm cache → LOAD returns exact profile + loadout in an isolated database", async () => {
    const profilePatch = {
      displayName: "CUR01 Durable Fan",
      skinTone: "#c07848",
      hairStyle: "Locs",
      eyeStyle: "Emerald",
    };
    const loadoutPatch = {
      outfit: "street_fit",
      prop: "mic",
      hair: "hair_locs_v1",
    } as const;

    await saveAvatarProfile(userId, profilePatch);
    await saveAvatarLoadout(userId, { ...loadoutPatch });

    clearAvatarPersistenceWarmCache(userId);

    const profile = await getAvatarProfile(userId);
    const loadout = await getAvatarLoadout(userId);

    expect(profile.displayName).toBe(profilePatch.displayName);
    expect(profile.skinTone).toBe(profilePatch.skinTone);
    expect(profile.hairStyle).toBe(profilePatch.hairStyle);
    expect(profile.eyeStyle).toBe(profilePatch.eyeStyle);
    expect(loadout.slots.outfit).toBe(loadoutPatch.outfit);
    expect(loadout.slots.prop).toBe(loadoutPatch.prop);
    expect(loadout.slots.hair).toBe(loadoutPatch.hair);
  }, 30_000);
});
