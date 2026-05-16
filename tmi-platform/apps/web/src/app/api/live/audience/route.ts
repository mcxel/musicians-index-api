import { NextRequest, NextResponse } from "next/server";
import {
  getAudienceSnapshot,
  joinAudience,
  leaveAudience,
  listAllOccupancies,
} from "@/lib/live/audienceRuntimeEngine";
import type { AudienceMember } from "@/lib/live/audienceRuntimeEngine";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const venue = searchParams.get("venue");
  if (venue) {
    return NextResponse.json(getAudienceSnapshot(venue));
  }
  return NextResponse.json(listAllOccupancies());
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, venueSlug, member, userId } = body as {
      action: string;
      venueSlug: string;
      member?: Omit<AudienceMember, "joinedAt" | "active">;
      userId?: string;
    };

    if (!venueSlug) return NextResponse.json({ error: "venueSlug required" }, { status: 400 });

    switch (action) {
      case "join":
        if (!member) return NextResponse.json({ error: "member required" }, { status: 400 });
        return NextResponse.json(joinAudience(venueSlug, member));
      case "leave":
        if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
        return NextResponse.json(leaveAudience(venueSlug, userId));
      default:
        return NextResponse.json({ error: "unknown action" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }
}
