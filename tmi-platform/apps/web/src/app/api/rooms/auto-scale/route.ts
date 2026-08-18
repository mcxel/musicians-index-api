import { NextRequest, NextResponse } from "next/server";
import {
  assignParticipant,
  closeOverflow,
  createOverflow,
  evaluateCapacity,
  getAllOverflowRooms,
  getOverflowRoomsForAnchor,
  publishDiscoveryState,
  rebalanceParticipants,
} from "@/lib/live/ElasticRoomOrchestrator";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const anchorSlug = searchParams.get("anchorSlug");

  if (anchorSlug) {
    try {
      const report = evaluateCapacity(anchorSlug);
      const overflows = getOverflowRoomsForAnchor(anchorSlug);
      return NextResponse.json({
        ok: true,
        report,
        overflows,
      });
    } catch (err: any) {
      return NextResponse.json({ ok: false, error: err.message }, { status: 404 });
    }
  }

  const discovery = publishDiscoveryState();
  return NextResponse.json({
    ok: true,
    anchors: discovery.anchors,
    overflows: discovery.overflows,
    liveSessionsCount: discovery.liveSessions.length,
  });
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    /* empty */
  }

  const action = typeof body.action === "string" ? body.action : "";
  const anchorSlug = typeof body.anchorSlug === "string" ? body.anchorSlug : "lounge-playlist";

  if (action === "assign") {
    try {
      const assignment = assignParticipant(anchorSlug);
      const report = evaluateCapacity(anchorSlug);
      return NextResponse.json({
        ok: true,
        assignment,
        report,
      });
    } catch (err: any) {
      return NextResponse.json({ ok: false, error: err.message }, { status: 400 });
    }
  }

  if (action === "create-overflow") {
    try {
      const overflow = createOverflow(anchorSlug);
      return NextResponse.json({ ok: true, overflow });
    } catch (err: any) {
      return NextResponse.json({ ok: false, error: err.message }, { status: 400 });
    }
  }

  if (action === "close-overflow") {
    const overflowId = typeof body.overflowId === "string" ? body.overflowId : "";
    if (!overflowId) {
      return NextResponse.json({ ok: false, error: "overflowId required" }, { status: 400 });
    }
    const closed = closeOverflow(overflowId);
    return NextResponse.json(closed);
  }

  if (action === "rebalance" || action === "compact") {
    const compact = rebalanceParticipants();
    return NextResponse.json({
      ok: true,
      compact,
      overflows: getAllOverflowRooms(),
    });
  }

  return NextResponse.json({ ok: false, error: "Unknown action" }, { status: 400 });
}
