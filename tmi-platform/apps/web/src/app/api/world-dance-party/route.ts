import { NextRequest, NextResponse } from "next/server";
import { getWorldDancePartyWindow } from "@/lib/dance/WorldDancePartyShowtime";
import {
  getPoolStatus,
  submitToWorldDancePool,
  WDP_SUBMIT_COIN_RESERVE,
} from "@/lib/dance/WorldDancePartyRotationPool";
import { participationEconomyEngine } from "@/lib/economy/ParticipationEconomyEngine";
import { getStripe } from "@/lib/stripe/client";
import { STRIPE_PRODUCTS } from "@/lib/stripe/products";

export const dynamic = "force-dynamic";

async function resolveUserId(req: NextRequest): Promise<string | null> {
  const email = req.cookies.get("tmi_user_email")?.value;
  if (email) return email;
  const sid = req.cookies.get("tmi_session_id")?.value;
  return sid ? sid.slice(0, 32) : null;
}

export async function GET() {
  const schedule = getWorldDancePartyWindow();
  const pool = getPoolStatus(schedule.weekKey);
  const walletHint = pool.entries[0]?.submitterId
    ? participationEconomyEngine.getWallet(pool.entries[0].submitterId)
    : null;
  const stripeConfigured = Boolean(getStripe());
  const boostProduct = STRIPE_PRODUCTS.LOBBY_WALL_BOOST_24H;
  return NextResponse.json({
    ok: true,
    schedule,
    capacity: pool.capacity,
    entries: pool.entries.map((e) => ({
      id: e.id,
      artistName: e.artistName,
      title: e.title,
      status: e.status,
      queuePosition: e.queuePosition,
      scheduledEstimate: e.scheduledEstimate,
      voteDownCount: e.voteDownCount,
      genre: e.genre,
    })),
    nowPlaying: pool.nowPlaying,
    fees: {
      submitCoinReserve: WDP_SUBMIT_COIN_RESERVE,
      chargePolicy: "finalize_on_play",
      voteDownCoins: 5,
      paidBoostAvailable: stripeConfigured,
      paidBoostPriceUsd: (boostProduct.price / 100).toFixed(2),
      paidBoostPriceId: boostProduct.priceId,
      paidBoostProductKey: "LOBBY_WALL_BOOST_24H",
      paidBoostNote: stripeConfigured
        ? `Optional $${(boostProduct.price / 100).toFixed(2)} paid boost — priority band, not guaranteed play`
        : "Paid boost unavailable until Stripe is configured",
    },
    walletSample: walletHint ? { coins: walletHint.coins, xp: walletHint.xp } : null,
  });
}

export async function POST(req: NextRequest) {
  const userId = await resolveUserId(req);
  if (!userId) {
    return NextResponse.json({ ok: false, error: "authentication_required" }, { status: 401 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const title = typeof body.title === "string" ? body.title : "";
  const artistName = typeof body.artistName === "string" ? body.artistName : userId;
  const audioUrl = typeof body.audioUrl === "string" ? body.audioUrl : "";
  const url = typeof body.url === "string" ? body.url : audioUrl;

  if (!title.trim() || !url.trim()) {
    return NextResponse.json({ ok: false, error: "title_and_url_required" }, { status: 400 });
  }

  const result = submitToWorldDancePool({
    submitterId: userId,
    artistName,
    title,
    audioUrl: url,
    genre: typeof body.genre === "string" ? body.genre : undefined,
    bpm: typeof body.bpm === "number" ? body.bpm : null,
    durationMs: typeof body.durationMs === "number" ? body.durationMs : undefined,
    creditLine: typeof body.creditLine === "string" ? body.creditLine : undefined,
    tags: ["world-dance-party"],
  });

  if (!result.ok) {
    const status =
      result.error === "insufficient_coins"
        ? 402
        : result.error === "submit_window_closed"
          ? 403
          : 400;
    return NextResponse.json({ ok: false, error: result.error, capacity: result.capacity }, { status });
  }

  return NextResponse.json({
    ok: true,
    entry: result.entry,
    capacity: result.capacity,
    message:
      result.entry?.scheduledEstimate ??
      "Queued for Friday World Dance Party — points charged only if your track plays",
  });
}
