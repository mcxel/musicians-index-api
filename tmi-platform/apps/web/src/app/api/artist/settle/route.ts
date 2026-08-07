import { NextResponse } from "next/server";
import {
  calculateCreatorCommerceSplit,
  describeCreatorCommerceFee,
  normalizeCommerceTier,
} from "@/lib/commerce/RevenueSplitEngine";
import { resolveSellerCommerceTier } from "@/lib/commerce/resolveSellerTier";

interface LedgerEntry {
  id: string;
  performerId: string;
  sessionId: string;
  grossUSD: number;
  platformFeeUSD: number;
  netUSD: number;
  sellerTier: string;
  source: "tips" | "tickets" | "sponsorship" | "beat_sale" | "nft_mint" | "merch";
  settledAt: string;
  status: "settled" | "pending" | "failed";
}

const ledger: LedgerEntry[] = [];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const performerId = searchParams.get("performerId");
  const entries = performerId ? ledger.filter(e => e.performerId === performerId) : ledger;
  const totalNet = entries.filter(e => e.status === "settled").reduce((s, e) => s + e.netUSD, 0);
  return NextResponse.json({ entries, totalNetUSD: totalNet, count: entries.length });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      performerId: string;
      sessionId?: string;
      grossUSD: number;
      source: "tips" | "tickets" | "sponsorship" | "beat_sale" | "nft_mint" | "merch";
      sellerTier?: string;
    };

    const { performerId, grossUSD, source } = body;
    if (!performerId || !grossUSD || !source) {
      return NextResponse.json({ error: "performerId, grossUSD, source required" }, { status: 400 });
    }
    if (grossUSD <= 0) {
      return NextResponse.json({ error: "grossUSD must be positive" }, { status: 422 });
    }

    // Tickets / sponsorship keep non-creator paths; creator sources use tier ladder.
    const creatorSources = new Set(["tips", "beat_sale", "nft_mint", "merch"]);
    let platformFeeUSD: number;
    let netUSD: number;
    let sellerTier = "N/A";

    if (creatorSources.has(source)) {
      const tier = body.sellerTier
        ? normalizeCommerceTier(body.sellerTier)
        : await resolveSellerCommerceTier(performerId);
      sellerTier = tier;
      const cents = Math.round(grossUSD * 100);
      const split = calculateCreatorCommerceSplit(cents, 0, tier);
      platformFeeUSD = Math.round((split.splits.platform.cents / 100) * 100) / 100;
      netUSD = Math.round((split.splits.artist.cents / 100) * 100) / 100;
    } else {
      // Non-creator (tickets/sponsorship) — keep prior 15% settle stub
      platformFeeUSD = Math.round(grossUSD * 0.15 * 100) / 100;
      netUSD = Math.round((grossUSD - platformFeeUSD) * 100) / 100;
    }

    const entry: LedgerEntry = {
      id: `settle_${Date.now()}`,
      performerId,
      sessionId: body.sessionId ?? `session_${Date.now()}`,
      grossUSD,
      platformFeeUSD,
      netUSD,
      sellerTier,
      source,
      settledAt: new Date().toISOString(),
      status: "settled",
    };

    ledger.push(entry);

    return NextResponse.json({
      success: true,
      settlement: entry,
      message: creatorSources.has(source)
        ? `$${netUSD.toFixed(2)} settled · ${describeCreatorCommerceFee(sellerTier)}`
        : `$${netUSD.toFixed(2)} settled to performer (15% platform fee applied)`,
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
