export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import {
  castRubricVote,
  closeRubricVoteWindow,
  getPerformerRubricStats,
  getRubricTallies,
  getRubricWindow,
  openRubricVoteWindow,
} from "@/lib/voting/FanRubricVotingEngine";

type Body = {
  action?: "open" | "close" | "cast" | "tallies" | "stats";
  eventId?: string;
  voterId?: string;
  performerId?: string;
  performerIds?: string[];
  scores?: Record<string, number>;
  isGift?: boolean;
  criteria?: Array<{ id: string; label: string }>;
};

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const roomId = params.id;
  const eventId = req.nextUrl.searchParams.get("eventId") ?? "default";
  const performerId = req.nextUrl.searchParams.get("performerId");
  if (performerId) {
    return NextResponse.json({ ok: true, stats: getPerformerRubricStats(performerId) });
  }
  return NextResponse.json({ ok: true, ...getRubricTallies(roomId, eventId) });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const roomId = params.id;
  const body = (await req.json().catch(() => ({}))) as Body;
  const action = body.action ?? "cast";
  const eventId = body.eventId?.trim() || "default";

  if (action === "open") {
    if (!Array.isArray(body.performerIds) || body.performerIds.length === 0) {
      return NextResponse.json({ error: "performerIds required" }, { status: 400 });
    }
    const w = openRubricVoteWindow({
      roomId,
      eventId,
      performerIds: body.performerIds,
      criteria: body.criteria,
    });
    return NextResponse.json({ ok: true, open: w.open, eventId });
  }

  if (action === "close") {
    closeRubricVoteWindow(roomId, eventId);
    return NextResponse.json({ ok: true, ...getRubricTallies(roomId, eventId) });
  }

  if (action === "tallies") {
    return NextResponse.json({ ok: true, ...getRubricTallies(roomId, eventId) });
  }

  if (action === "stats") {
    if (!body.performerId) {
      return NextResponse.json({ error: "performerId required" }, { status: 400 });
    }
    return NextResponse.json({ ok: true, stats: getPerformerRubricStats(body.performerId) });
  }

  // cast
  if (!getRubricWindow(roomId, eventId)) {
    // Auto-open with named performers if client casts into a fresh window.
    if (Array.isArray(body.performerIds) && body.performerIds.length > 0) {
      openRubricVoteWindow({ roomId, eventId, performerIds: body.performerIds, criteria: body.criteria });
    }
  }

  const result = castRubricVote({
    roomId,
    eventId,
    voterId: body.voterId ?? "",
    performerId: body.performerId ?? "",
    scores: body.scores ?? {},
    isGift: body.isGift,
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.reason }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    xp: result.xp,
    ballot: result.ballot,
    ...getRubricTallies(roomId, eventId),
  });
}
