/**
 * Structural reconnect gates for Track B revenue paths:
 * EventInventory ↔ /api/tickets/create|purchase|mine + SeatClaimRail + canonical tips.
 * Physical Stripe E2E may remain BLOCKED — this only certifies wiring hops.
 */
import { readFileSync } from "fs";
import path from "path";

const root = path.resolve(__dirname, "../..");

function src(relPath: string): string {
  return readFileSync(path.join(root, relPath), "utf8");
}

describe("revenue tickets/tips/sponsor structural reconnect", () => {
  it("C: /api/tickets/create reserves EventInventory before mint", () => {
    const createSrc = src("app/api/tickets/create/route.ts");
    expect(createSrc).toContain("eventInventory");
    expect(createSrc).toContain("reserveInventoryDB");
    expect(createSrc).toContain('isolationLevel: "Serializable"');
    expect(createSrc).toContain("createTicket");
    expect(createSrc).not.toContain("TODO-PROD");
  });

  it("C: /api/tickets/purchase remains Stripe checkout (no new ticket API)", () => {
    const purchaseSrc = src("app/api/tickets/purchase/route.ts");
    expect(purchaseSrc).toContain("ticket_purchase");
    expect(purchaseSrc).toContain("getStripe");
    expect(purchaseSrc).toContain("checkout.sessions.create");
  });

  it("C: /api/tickets/mine reads Prisma tickets (not memory-only)", () => {
    const mineSrc = src("app/api/tickets/mine/route.ts");
    expect(mineSrc).toContain("prisma.ticket.findMany");
    expect(mineSrc).toContain("ownerUserId");
    expect(mineSrc).toContain("memory_fallback_dev_only");
  });

  it("C: SeatClaimRail is mounted on /seating and calls claim-seat", () => {
    const seatingSrc = src("app/seating/page.tsx");
    const railSrc = src("components/venues/SeatClaimRail.tsx");
    expect(seatingSrc).toContain('import SeatClaimRail from "@/components/venues/SeatClaimRail"');
    expect(seatingSrc).toContain("<SeatClaimRail");
    expect(railSrc).toContain('/api/tickets/claim-seat');
  });

  it("B: TipButton uses canonical /api/tips (tipFulfillment authority)", () => {
    const tipBtn = src("components/common/TipButton.tsx");
    const tipsRoute = src("app/api/tips/route.ts");
    const fulfill = src("lib/tips/tipFulfillment.ts");
    expect(tipBtn).toContain('fetch("/api/tips"');
    expect(tipBtn).not.toContain('product: "TIP"');
    expect(tipsRoute).toContain("resolveTipArtistUserId");
    expect(tipsRoute).toContain('type: "tip"');
    expect(fulfill).toContain("grantTipFromStripeSession");
  });

  it("D/E: Booking vs Shoutout vs Meet&Greet stay on separate routes", () => {
    const booking = src("app/api/booking/create/route.ts");
    const shout = src("app/shoutout/[artistSlug]/page.tsx");
    const meet = src("app/meet/[artistSlug]/page.tsx");
    const commerce = src("app/api/commerce/checkout/route.ts");
    expect(booking).toContain("VenueBookingRegistry");
    expect(shout).toContain("/api/commerce/checkout");
    expect(shout).toContain('type === "SHOUTOUT"');
    expect(meet).toContain("/api/commerce/checkout");
    expect(meet).toContain('type === "MEET_AND_GREET"');
    expect(commerce).toContain('case "SHOUTOUT"');
    expect(commerce).toContain('case "MEET_AND_GREET"');
    expect(commerce).toContain('artist_commerce');
  });

  it("F: Sponsor READY TO SELL requires real paid zone — no fake ACTIVE_SPONSOR_ZONES inventory", () => {
    const registry = src("lib/commerce/SponsorRegistry.ts");
    expect(registry).toContain("ACTIVE_SPONSOR_ZONES");
    // Example-only commented entry is allowed; live paid map must stay empty until real purchase.
    const activeBlock = registry.slice(
      registry.indexOf("export const ACTIVE_SPONSOR_ZONES"),
      registry.indexOf("export function getActiveSponsorForZone"),
    );
    expect(activeBlock).not.toMatch(/^\s*'[^']+'\s*:\s*\{/m);
    expect(registry).toContain("getAdSlotForZone");
  });
});
