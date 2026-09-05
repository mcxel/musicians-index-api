/**
 * Universal Cart — physical persistence certification (Lane D Phase 2).
 *
 * Proves CartService is genuinely server-authoritative and Postgres-backed
 * — the property CanonicalCartRuntime's in-memory Map never had (a cart
 * built in a "use client" component lives in the browser tab's own JS
 * realm, not a shared server; it can't survive a reload or reach a second
 * device). No mocks — real production Postgres, via the real QA fixture
 * qa-fan-free@themusiciansindex.test.
 *
 * Run with `--forceExit` (see runStoreItemOwnershipPersistence.test.ts).
 */
import prisma from "../lib/prisma";
import { LOBBY_ITEMS, FAN_ITEMS } from "../lib/store/StoreItemEngine";
import {
  getCart,
  addItem,
  setQuantity,
  removeItem,
  removePurchasedItems,
  revalidateForCheckout,
} from "../lib/commerce/CartService";

const QA_EMAIL = "qa-fan-free@themusiciansindex.test";
const ITEM_A = LOBBY_ITEMS.find((i) => i.id === "lobby-neon")!;
const ITEM_B = FAN_ITEMS.find((i) => i.id === "tip-small")!;

describe("Universal Cart — real Postgres persistence, not browser memory", () => {
  let qaUserId: string;

  beforeAll(async () => {
    const qa = await prisma.user.findFirst({ where: { email: QA_EMAIL }, select: { id: true } });
    if (!qa) throw new Error("QA fixture user not found");
    qaUserId = qa.id;
    // Start from a clean slate for this specific user's cart.
    const cart = await prisma.cart.findUnique({ where: { userId: qaUserId } });
    if (cart) await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  }, 30000);

  afterAll(async () => {
    const cart = await prisma.cart.findUnique({ where: { userId: qaUserId } });
    if (cart) await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    await prisma.$disconnect();
  }, 15000);

  it("addItem persists a real row — verified via an independent Prisma query, not the returned value", async () => {
    const view = await addItem(qaUserId, ITEM_A.id, 1);
    expect(view.itemCount).toBe(1);
    expect(view.subtotalCents).toBe(ITEM_A.price);

    // Independent read — proves durability, not just an in-memory echo.
    const cart = await prisma.cart.findUnique({ where: { userId: qaUserId }, include: { items: true } });
    expect(cart).not.toBeNull();
    expect(cart!.items.length).toBe(1);
    expect(cart!.items[0]!.itemId).toBe(ITEM_A.id);
    expect(cart!.items[0]!.quantity).toBe(1);
  }, 30000);

  it("adding the same item again accumulates quantity rather than duplicating the row", async () => {
    const view = await addItem(qaUserId, ITEM_A.id, 2);
    expect(view.items.find((i) => i.itemId === ITEM_A.id)?.quantity).toBe(3);

    const cart = await prisma.cart.findUnique({ where: { userId: qaUserId }, include: { items: true } });
    const rows = cart!.items.filter((i) => i.itemId === ITEM_A.id);
    expect(rows.length).toBe(1); // still one row, not two
    expect(rows[0]!.quantity).toBe(3);
  }, 30000);

  it("a second, independent getCart() call sees the exact same state — this is shared server truth, not a per-caller copy", async () => {
    await addItem(qaUserId, ITEM_B.id, 1);
    const first = await getCart(qaUserId);
    const second = await getCart(qaUserId);
    expect(second.itemCount).toBe(first.itemCount);
    expect(second.items.map((i) => i.itemId).sort()).toEqual(first.items.map((i) => i.itemId).sort());
  }, 30000);

  it("setQuantity updates the persisted row", async () => {
    const view = await setQuantity(qaUserId, ITEM_A.id, 5);
    expect(view.items.find((i) => i.itemId === ITEM_A.id)?.quantity).toBe(5);
    const cart = await prisma.cart.findUnique({ where: { userId: qaUserId }, include: { items: true } });
    expect(cart!.items.find((i) => i.itemId === ITEM_A.id)?.quantity).toBe(5);
  }, 30000);

  it("setQuantity to 0 removes the row entirely (not just zeroes it)", async () => {
    await setQuantity(qaUserId, ITEM_A.id, 0);
    const cart = await prisma.cart.findUnique({ where: { userId: qaUserId }, include: { items: true } });
    expect(cart!.items.find((i) => i.itemId === ITEM_A.id)).toBeUndefined();
  }, 30000);

  it("removeItem removes a specific line without touching the rest of the cart", async () => {
    await addItem(qaUserId, ITEM_A.id, 1);
    const before = await getCart(qaUserId);
    expect(before.items.length).toBe(2); // ITEM_A + ITEM_B from earlier

    await removeItem(qaUserId, ITEM_A.id);
    const after = await getCart(qaUserId);
    expect(after.items.find((i) => i.itemId === ITEM_A.id)).toBeUndefined();
    expect(after.items.find((i) => i.itemId === ITEM_B.id)).toBeDefined();
  }, 30000);

  it("revalidateForCheckout detects a stale price snapshot and refuses to silently charge it", async () => {
    const cart = await prisma.cart.findUnique({ where: { userId: qaUserId }, include: { items: true } });
    const row = cart!.items.find((i) => i.itemId === ITEM_B.id)!;
    // Simulate a price that has since changed by corrupting the stored
    // snapshot directly — revalidateForCheckout must catch this against the
    // live catalog, not trust what's stored.
    await prisma.cartItem.update({ where: { id: row.id }, data: { unitPriceCents: row.unitPriceCents + 12345 } });

    const revalidation = await revalidateForCheckout(qaUserId);
    expect(revalidation.changed.length).toBeGreaterThan(0);
    expect(revalidation.changed[0]!.itemId).toBe(ITEM_B.id);
    expect(revalidation.changed[0]!.newPriceCents).toBe(ITEM_B.price); // the real canonical price, not the corrupted one
  }, 30000);

  it("removePurchasedItems clears exactly the purchased lines, leaving the rest of the cart intact", async () => {
    await addItem(qaUserId, ITEM_A.id, 1); // cart now has ITEM_A + ITEM_B
    const before = await getCart(qaUserId);
    expect(before.items.length).toBe(2);

    await removePurchasedItems(qaUserId, [ITEM_B.id]);
    const after = await getCart(qaUserId);
    expect(after.items.find((i) => i.itemId === ITEM_B.id)).toBeUndefined();
    expect(after.items.find((i) => i.itemId === ITEM_A.id)).toBeDefined();
  }, 30000);

  it("an unknown/retired item id is rejected, never silently added at a fabricated price", async () => {
    await expect(addItem(qaUserId, "not-a-real-item-id", 1)).rejects.toThrow("unknown_item:not-a-real-item-id");
  }, 30000);

  it("a subscription-mode item is rejected from the one-time cart", async () => {
    const subscriptionItem = FAN_ITEMS.find((i) => i.mode === "subscription")!;
    await expect(addItem(qaUserId, subscriptionItem.id, 1)).rejects.toThrow("subscription_items_not_cart_eligible");
  }, 30000);
});
