const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "src");
const r = (p) => fs.readFileSync(path.join(root, p), "utf8");
const checks = [];
function ok(name, cond) {
  checks.push({ name, pass: !!cond });
  console.log((cond ? "PASS" : "FAIL") + " " + name);
}

const create = r("app/api/tickets/create/route.ts");
ok(
  "create EventInventory",
  create.includes("eventInventory") &&
    create.includes("reserveInventoryDB") &&
    create.includes("Serializable"),
);

const purchase = r("app/api/tickets/purchase/route.ts");
ok(
  "purchase stripe",
  purchase.includes("ticket_purchase") && purchase.includes("getStripe"),
);

const mine = r("app/api/tickets/mine/route.ts");
ok(
  "mine prisma",
  mine.includes("prisma.ticket.findMany") &&
    mine.includes("memory_fallback_dev_only"),
);

const seating = r("app/seating/page.tsx");
const rail = r("components/venues/SeatClaimRail.tsx");
ok(
  "SeatClaimRail mounted",
  seating.includes("SeatClaimRail") && rail.includes("/api/tickets/claim-seat"),
);

const tip = r("components/common/TipButton.tsx");
ok(
  "TipButton /api/tips",
  tip.includes('fetch("/api/tips"') && !tip.includes('product: "TIP"'),
);

const tips = r("app/api/tips/route.ts");
const fulfill = r("lib/tips/tipFulfillment.ts");
ok(
  "tip authority",
  tips.includes("resolveTipArtistUserId") &&
    fulfill.includes("grantTipFromStripeSession"),
);

const shout = r("app/shoutout/[artistSlug]/page.tsx");
const meet = r("app/meet/[artistSlug]/page.tsx");
const booking = r("app/api/booking/create/route.ts");
ok(
  "booking vs shout vs meet",
  booking.includes("VenueBookingRegistry") &&
    shout.includes("SHOUTOUT") &&
    meet.includes("MEET_AND_GREET"),
);

const reg = r("lib/commerce/SponsorRegistry.ts");
const block = reg.slice(
  reg.indexOf("export const ACTIVE_SPONSOR_ZONES"),
  reg.indexOf("export function getActiveSponsorForZone"),
);
ok("sponsor no fake live zones", !/^\s*'[^']+'\s*:\s*\{/m.test(block));

const failed = checks.filter((c) => !c.pass);
console.log("RESULT", `${checks.length - failed.length}/${checks.length}`);
process.exit(failed.length ? 1 : 0);
