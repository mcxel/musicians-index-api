import { NextRequest, NextResponse } from "next/server";
import {
  getQueueSnapshot,
  joinQueue,
  boostPerformer,
  advanceQueue,
  removeFromQueue,
  pauseQueue,
  resumeQueue,
} from "@/lib/live/queueEngine";

export async function GET(req: NextRequest) {
  const venue = req.nextUrl.searchParams.get("venue") ?? "default";
  return NextResponse.json(getQueueSnapshot(venue));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, venueSlug, performerId, performerName, priority } = body as {
      action: string;
      venueSlug: string;
      performerId?: string;
      performerName?: string;
      priority?: number;
    };

    if (!venueSlug) return NextResponse.json({ error: "venueSlug required" }, { status: 400 });

    switch (action) {
      case "join":
        if (!performerId || !performerName) return NextResponse.json({ error: "performerId and performerName required" }, { status: 400 });
        return NextResponse.json(joinQueue(venueSlug, performerId, performerName, priority));
      case "boost":
        if (!performerId) return NextResponse.json({ error: "performerId required" }, { status: 400 });
        return NextResponse.json(boostPerformer(venueSlug, performerId));
      case "advance":
        return NextResponse.json(advanceQueue(venueSlug));
      case "remove":
        if (!performerId) return NextResponse.json({ error: "performerId required" }, { status: 400 });
        removeFromQueue(venueSlug, performerId);
        return NextResponse.json({ ok: true });
      case "pause":
        pauseQueue(venueSlug);
        return NextResponse.json({ ok: true });
      case "resume":
        resumeQueue(venueSlug);
        return NextResponse.json({ ok: true });
      default:
        return NextResponse.json({ error: "unknown action" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }
}
