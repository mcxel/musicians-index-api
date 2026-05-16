export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import {
  getBillboardSnapshot,
  addSponsorSlot,
  rotateToNextBillboard,
  recordBillboardClick,
  addPreviewWindow,
} from "@/lib/live/billboardRuntimeEngine";

export async function GET(req: NextRequest) {
  const venue = req.nextUrl.searchParams.get("venue") ?? "default";
  return NextResponse.json(getBillboardSnapshot(venue));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, venueSlug, slot, embedUrl } = body as {
      action: string;
      venueSlug: string;
      slot?: {
        sponsorId: string;
        sponsorName: string;
        message: string;
        imageUrl: string | null;
        ctaLabel: string;
        ctaUrl: string;
        displayDurationSec: number;
        priority: number;
      };
      embedUrl?: string;
    };

    if (!venueSlug) return NextResponse.json({ error: "venueSlug required" }, { status: 400 });

    switch (action) {
      case "add-sponsor":
        if (!slot) return NextResponse.json({ error: "slot required" }, { status: 400 });
        return NextResponse.json(addSponsorSlot(venueSlug, slot));
      case "rotate":
        return NextResponse.json(rotateToNextBillboard(venueSlug));
      case "click":
        recordBillboardClick(venueSlug);
        return NextResponse.json({ ok: true });
      case "add-preview":
        if (!embedUrl) return NextResponse.json({ error: "embedUrl required" }, { status: 400 });
        addPreviewWindow(venueSlug, embedUrl);
        return NextResponse.json({ ok: true });
      default:
        return NextResponse.json({ error: "unknown action" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }
}
