export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import {
  registerHost,
  getHostState,
  activateHostMic,
  deactivateHostMic,
  queueCue,
  triggerNextCue,
  completeCue,
  makeAnnouncement,
  triggerEmergency,
} from "@/lib/live/hostRuntimeEngine";
import type { CueType } from "@/lib/live/hostRuntimeEngine";

export async function GET(req: NextRequest) {
  const venue = req.nextUrl.searchParams.get("venue") ?? "default";
  const state = getHostState(venue);
  if (!state) return NextResponse.json({ error: "no host registered for venue" }, { status: 404 });
  return NextResponse.json(state);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, venueSlug, hostId, hostName, cueType, script, cueId, text } = body as {
      action: string;
      venueSlug: string;
      hostId?: string;
      hostName?: string;
      cueType?: CueType;
      script?: string;
      cueId?: string;
      text?: string;
    };

    if (!venueSlug) return NextResponse.json({ error: "venueSlug required" }, { status: 400 });

    switch (action) {
      case "register":
        if (!hostId || !hostName) return NextResponse.json({ error: "hostId and hostName required" }, { status: 400 });
        return NextResponse.json(registerHost(venueSlug, hostId, hostName));
      case "activate-mic":
        return NextResponse.json(activateHostMic(venueSlug));
      case "deactivate-mic":
        return NextResponse.json(deactivateHostMic(venueSlug));
      case "queue-cue":
        if (!cueType || !script) return NextResponse.json({ error: "cueType and script required" }, { status: 400 });
        return NextResponse.json(queueCue(venueSlug, cueType, script));
      case "trigger-cue":
        return NextResponse.json(triggerNextCue(venueSlug));
      case "complete-cue":
        if (!cueId) return NextResponse.json({ error: "cueId required" }, { status: 400 });
        completeCue(venueSlug, cueId);
        return NextResponse.json({ ok: true });
      case "announce":
        if (!text) return NextResponse.json({ error: "text required" }, { status: 400 });
        makeAnnouncement(venueSlug, text);
        return NextResponse.json({ ok: true });
      case "emergency":
        triggerEmergency(venueSlug);
        return NextResponse.json({ ok: true });
      default:
        return NextResponse.json({ error: "unknown action" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }
}
