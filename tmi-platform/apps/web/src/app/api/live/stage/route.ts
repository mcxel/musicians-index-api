import { NextRequest, NextResponse } from "next/server";
import {
  getStageState,
  activateStage,
  deactivateStage,
  addPerformerToQueue,
  rotateToNextPerformer,
  toggleHostMic,
  listStageStates,
} from "@/lib/live/liveStageEngine";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const venue = searchParams.get("venue");
  if (venue) {
    return NextResponse.json(getStageState(venue));
  }
  return NextResponse.json(listStageStates());
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, venueSlug, performer } = body as {
      action: string;
      venueSlug: string;
      performer?: { id: string; name: string; genre: string; slotDurationSec: number };
    };

    if (!venueSlug) return NextResponse.json({ error: "venueSlug required" }, { status: 400 });

    switch (action) {
      case "activate":
        return NextResponse.json(activateStage(venueSlug));
      case "deactivate":
        return NextResponse.json(deactivateStage(venueSlug));
      case "add-performer":
        if (!performer) return NextResponse.json({ error: "performer required" }, { status: 400 });
        return NextResponse.json(addPerformerToQueue(venueSlug, performer));
      case "rotate":
        return NextResponse.json(rotateToNextPerformer(venueSlug));
      case "toggle-host-mic":
        return NextResponse.json({ hostMicHot: toggleHostMic(venueSlug) });
      default:
        return NextResponse.json({ error: "unknown action" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }
}
