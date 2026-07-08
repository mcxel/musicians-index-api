import { NextResponse } from "next/server";
import { createSubmission } from "@/lib/submissions/SubmissionEngine";
import { STRIPE_PRODUCTS } from "@/lib/stripe/products";

const XP_COST = 500;

/** In-memory XP ledger — keyed by performerId. Real DB integration pending. */
const xpLedger = new Map<string, number>();

function getXP(id: string): number {
  return xpLedger.get(id) ?? 1000; // seed with 1000 so new performers can submit
}
function deductXP(id: string, amount: number): boolean {
  const current = getXP(id);
  if (current < amount) return false;
  xpLedger.set(id, current - amount);
  return true;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  const method: "xp" | "paid" = body.method === "paid" ? "paid" : "xp";
  const performerId: string = typeof body.performerId === "string" ? body.performerId : "guest-performer";
  const title: string       = typeof body.title       === "string" ? body.title.trim()  : "";
  const artist: string      = typeof body.artist      === "string" ? body.artist.trim() : "";
  const genre: string       = typeof body.genre       === "string" ? body.genre.trim()  : "General";
  const bpm: number | null  = typeof body.bpm         === "number" ? body.bpm           : null;

  if (!title || !artist) {
    return NextResponse.json({ ok: false, error: "title and artist required" }, { status: 400 });
  }

  if (method === "xp") {
    const ok = deductXP(performerId, XP_COST);
    if (!ok) {
      return NextResponse.json({ ok: false, error: "insufficient_xp", needed: XP_COST, current: getXP(performerId) }, { status: 402 });
    }
  }

  // For paid path: trust that caller confirmed payment (Stripe success_url redirect)
  // Webhook can mark status → "approved" once payment clears.

  const result = await createSubmission({
    submitterId: performerId,
    title: `${title} — ${artist}`,
    type: "track",
    url: `/rooms/world-dance-party`,
    genre,
    description: `World Dance Party DJ submission via ${method === "xp" ? `${XP_COST} XP` : "$4.99"}`,
    bpm: bpm ?? undefined,
    tags: ["world-dance-party", "dj", genre.toLowerCase()],
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 409 });
  }

  return NextResponse.json({
    ok: true,
    submissionId: result.submission!.id,
    method,
    xpRemaining: method === "xp" ? getXP(performerId) : null,
    shareUrl: result.shareUrl,
  });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const performerId = url.searchParams.get("performerId") ?? "guest-performer";
  return NextResponse.json({
    xp: getXP(performerId),
    xpCost: XP_COST,
    paidPrice: STRIPE_PRODUCTS.DJ_SUBMISSION.price,
    priceId: STRIPE_PRODUCTS.DJ_SUBMISSION.priceId,
  });
}
