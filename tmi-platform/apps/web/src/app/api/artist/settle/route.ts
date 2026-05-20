import { NextResponse } from "next/server";

interface LedgerEntry {
  id: string;
  performerId: string;
  sessionId: string;
  grossUSD: number;
  platformFeeUSD: number;
  netUSD: number;
  source: "tips" | "tickets" | "sponsorship" | "beat_sale" | "nft_mint";
  settledAt: string;
  status: "settled" | "pending" | "failed";
}

const ledger: LedgerEntry[] = [];

const PLATFORM_FEE_RATE = 0.15;

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
      source: "tips" | "tickets" | "sponsorship" | "beat_sale" | "nft_mint";
    };

    const { performerId, grossUSD, source } = body;
    if (!performerId || !grossUSD || !source) {
      return NextResponse.json({ error: "performerId, grossUSD, source required" }, { status: 400 });
    }
    if (grossUSD <= 0) {
      return NextResponse.json({ error: "grossUSD must be positive" }, { status: 422 });
    }

    const platformFeeUSD = Math.round(grossUSD * PLATFORM_FEE_RATE * 100) / 100;
    const netUSD = Math.round((grossUSD - platformFeeUSD) * 100) / 100;

    const entry: LedgerEntry = {
      id: `settle_${Date.now()}`,
      performerId,
      sessionId: body.sessionId ?? `session_${Date.now()}`,
      grossUSD,
      platformFeeUSD,
      netUSD,
      source,
      settledAt: new Date().toISOString(),
      status: "settled",
    };

    ledger.push(entry);

    return NextResponse.json({
      success: true,
      settlement: entry,
      message: `$${netUSD.toFixed(2)} settled to performer (${PLATFORM_FEE_RATE * 100}% platform fee applied)`,
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
