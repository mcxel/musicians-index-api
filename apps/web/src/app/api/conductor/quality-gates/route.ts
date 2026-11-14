export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";

/**
 * Conductor quality gates — honesty quarantine (2026-09-16).
 * GREEN requires current certification provenance. Hardcoded "62/62 GREEN"
 * and similar claims are forbidden. Overseer local 41/41 is a separate lane
 * and is NOT represented here as production GREEN.
 */
type GateStatus = "UNCERTIFIED" | "UNKNOWN" | "NOT_CURRENTLY_VERIFIED" | "YELLOW" | "RED";

const GATES: Array<{
  id: string;
  name: string;
  status: GateStatus;
  description: string;
  lastCheck: string | null;
  provenance: string;
}> = [
  {
    id: "qg-auth",
    name: "Auth Flow",
    status: "NOT_CURRENTLY_VERIFIED",
    description: "No continuous cert provenance attached to this conductor surface",
    lastCheck: null,
    provenance: "none",
  },
  {
    id: "qg-stripe",
    name: "Stripe Checkout",
    status: "NOT_CURRENTLY_VERIFIED",
    description: "Fan/Performer checkout exists in source; this gate has no live cert feed",
    lastCheck: null,
    provenance: "none",
  },
  {
    id: "qg-email",
    name: "Email Delivery",
    status: "UNKNOWN",
    description: "Delivery health not wired to this API",
    lastCheck: null,
    provenance: "none",
  },
  {
    id: "qg-live",
    name: "Live Rooms",
    status: "NOT_CURRENTLY_VERIFIED",
    description: "WebRTC/live fabric requires physical/network cert — not claimed GREEN here",
    lastCheck: null,
    provenance: "none",
  },
  {
    id: "qg-bots",
    name: "Bot System",
    status: "UNCERTIFIED",
    description:
      "Bot duty registry exists; claimed full-swarm active health is NOT verified on this surface",
    lastCheck: null,
    provenance: "honesty_quarantine_removed_fake_62_green",
  },
  {
    id: "qg-magazine",
    name: "Magazine CMS",
    status: "NOT_CURRENTLY_VERIFIED",
    description: "Magazine reader exists; conductor gate has no physical cert feed",
    lastCheck: null,
    provenance: "none",
  },
  {
    id: "qg-tickets",
    name: "Ticket System",
    status: "NOT_CURRENTLY_VERIFIED",
    description: "Ticket Trust Phase2 source+cert is separate; not auto-GREEN here",
    lastCheck: null,
    provenance: "none",
  },
  {
    id: "qg-nft",
    name: "NFT Lab",
    status: "UNCERTIFIED",
    description: "NFT path includes honest stubs — not certified GREEN",
    lastCheck: null,
    provenance: "none",
  },
];

export async function GET() {
  const green = GATES.filter((g) => (g.status as string) === "GREEN").length;
  const yellow = GATES.filter((g) => g.status === "YELLOW" || g.status === "NOT_CURRENTLY_VERIFIED").length;
  const red = GATES.filter((g) => g.status === "RED").length;
  const uncertified = GATES.filter(
    (g) => g.status === "UNCERTIFIED" || g.status === "UNKNOWN" || g.status === "NOT_CURRENTLY_VERIFIED",
  ).length;
  return NextResponse.json({
    gates: GATES,
    summary: {
      green,
      yellow,
      red,
      uncertified,
      total: GATES.length,
      note: "GREEN requires provenance. Fake 62/62 GREEN removed 2026-09-16.",
    },
  });
}
