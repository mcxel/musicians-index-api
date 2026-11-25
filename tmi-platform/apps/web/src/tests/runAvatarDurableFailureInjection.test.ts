import { NextRequest } from "next/server";
import { POST as save } from "@/app/api/avatar/save/route";
import { POST as equip } from "@/app/api/avatar/equip/route";
import { GET as load } from "@/app/api/avatar/load/route";
import { clearAvatarPersistenceWarmCache, getAvatarProfile } from "@/lib/avatar/avatarPersistence";
import { prisma } from "@/lib/prisma";

jest.mock("@/lib/avatar/requireFanAvatarSession", () => ({
  requireFanAvatarSession: jest.fn(async () => ({ user: { id: "p0-test", role: "FAN" } })),
}));
jest.mock("@/lib/prisma", () => ({
  prisma: {
    avatarProfileRecord: { findUnique: jest.fn() },
    avatarLoadoutRecord: { findUnique: jest.fn() },
    avatarInventoryItemRecord: { findMany: jest.fn(), createMany: jest.fn() },
    $transaction: jest.fn(),
  },
}));

const db = prisma as jest.Mocked<typeof prisma>;
const profileRead = db.avatarProfileRecord.findUnique as jest.Mock;
const loadoutRead = db.avatarLoadoutRecord.findUnique as jest.Mock;
const inventoryRead = db.avatarInventoryItemRecord.findMany as jest.Mock;
const transaction = db.$transaction as jest.Mock;
const profileUpsert = jest.fn();
const loadoutUpsert = jest.fn();
const inventoryUpdate = jest.fn();
const request = (body: object) => ({ json: async () => body }) as NextRequest;

beforeEach(() => {
  jest.clearAllMocks();
  clearAvatarPersistenceWarmCache("p0-test");
  profileRead.mockResolvedValue(null);
  loadoutRead.mockResolvedValue(null);
  inventoryRead.mockResolvedValue([{
    userId: "p0-test", itemId: "hat", category: "hats", name: "Hat",
    rarity: "free", owned: true, equipped: false, mintable: false,
    tradeable: false, sponsorLocked: false, tierLocked: false,
    createdAt: new Date(), updatedAt: new Date(),
  }]);
  profileUpsert.mockResolvedValue({});
  loadoutUpsert.mockResolvedValue({});
  inventoryUpdate.mockResolvedValue({ count: 1 });
  transaction.mockImplementation(async (run: (tx: object) => Promise<unknown>) => run({
    avatarProfileRecord: { upsert: profileUpsert },
    avatarLoadoutRecord: { upsert: loadoutUpsert },
    avatarInventoryItemRecord: { updateMany: inventoryUpdate },
  }));
});

it("AVATAR-01: an unavailable database fails the save", async () => {
  profileRead.mockRejectedValue(new Error("database unavailable"));
  const response = await save(request({ profile: { displayName: "Changed" } }));
  expect(response.status).toBe(503);
  expect((await response.json()).ok).toBe(false);
  expect(transaction).not.toHaveBeenCalled();
});

it("an unavailable database fails the load instead of returning defaults", async () => {
  profileRead.mockRejectedValue(new Error("database unavailable"));
  const response = await load(request({}));
  expect(response.status).toBe(503);
  expect((await response.json()).ok).toBe(false);
});

it("AVATAR-02: a failed upsert never returns ok", async () => {
  profileUpsert.mockRejectedValue(new Error("upsert failed"));
  const response = await save(request({ profile: { displayName: "Changed" } }));
  expect(response.status).toBe(503);
  expect((await response.json()).ok).toBe(false);
});

it("AVATAR-03: profile and loadout are written in one transaction", async () => {
  let committed = false;
  loadoutUpsert.mockRejectedValue(new Error("loadout failed"));
  transaction.mockImplementation(async (run: (tx: object) => Promise<unknown>) => {
    const result = await run({
      avatarProfileRecord: { upsert: profileUpsert },
      avatarLoadoutRecord: { upsert: loadoutUpsert },
    });
    committed = true;
    return result;
  });
  const response = await save(request({ profile: { displayName: "Changed" }, loadout: { outfit: "new" } }));
  expect(response.status).toBe(503);
  expect(profileUpsert).toHaveBeenCalledTimes(1);
  expect(loadoutUpsert).toHaveBeenCalledTimes(1);
  expect(committed).toBe(false);
});

it("AVATAR-04: failed writes never update the cache, including after clearing it", async () => {
  profileUpsert.mockRejectedValue(new Error("upsert failed"));
  await save(request({ profile: { displayName: "Phantom" } }));
  expect((await getAvatarProfile("p0-test")).displayName).not.toBe("Phantom");
  clearAvatarPersistenceWarmCache("p0-test");
  expect((await getAvatarProfile("p0-test")).displayName).not.toBe("Phantom");
});

it("AVATAR-05: equip failure returns an error and does not commit inventory", async () => {
  let committed = false;
  loadoutUpsert.mockRejectedValue(new Error("loadout failed"));
  transaction.mockImplementation(async (run: (tx: object) => Promise<unknown>) => {
    const result = await run({
      avatarInventoryItemRecord: { updateMany: inventoryUpdate },
      avatarLoadoutRecord: { upsert: loadoutUpsert },
    });
    committed = true;
    return result;
  });
  const response = await equip(request({ itemId: "hat", slot: "accessory" }));
  expect(response.status).toBe(503);
  expect((await response.json()).ok).toBe(false);
  expect(inventoryUpdate).toHaveBeenCalled();
  expect(committed).toBe(false);
});

it("returns the saved profile and loadout after the transaction commits", async () => {
  const response = await save(request({ profile: { displayName: "Fan" }, loadout: { outfit: "coat" } }));
  const body = await response.json();
  expect(response.status).toBe(200);
  expect(body.ok).toBe(true);
  expect(body.AvatarProfile.displayName).toBe("Fan");
  expect(body.AvatarLoadout.slots.outfit).toBe("coat");
});

it("rejects malformed saves and invalid equip slots before writing", async () => {
  expect((await save(request({ loadout: { outfit: 12 } }))).status).toBe(400);
  expect((await equip(request({ itemId: "hat", slot: "invalid" }))).status).toBe(400);
  expect(transaction).not.toHaveBeenCalled();
});
