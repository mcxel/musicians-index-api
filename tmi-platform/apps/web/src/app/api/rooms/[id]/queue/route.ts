import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getCanonicalRoomSlug } from "@/lib/world/WorldRuntime";
import {
  getQueueSnapshot,
  joinQueue,
  removeFromQueue,
  advanceQueue,
  boostPerformer,
  pauseQueue,
  resumeQueue,
} from "@/lib/live/queueEngine";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const roomId = getCanonicalRoomSlug(params.id);
  return NextResponse.json({ ok: true, queue: getQueueSnapshot(roomId) });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const roomId  = getCanonicalRoomSlug(params.id);
  const userId  = req.cookies.get("tmi_session_id")?.value ?? "anonymous";

  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { /* no body */ }

  const action        = typeof body.action === "string" ? body.action : "join";
  const performerId   = typeof body.performerId === "string" ? body.performerId : userId;
  const performerName = typeof body.performerName === "string" ? body.performerName : "Performer";
  const priority      = typeof body.priority === "number" ? body.priority : 5;

  switch (action) {
    case "join": {
      const slot = joinQueue(roomId, performerId, performerName, priority);
      return NextResponse.json({ ok: true, slot, queue: getQueueSnapshot(roomId) });
    }
    case "leave": {
      removeFromQueue(roomId, performerId);
      return NextResponse.json({ ok: true, queue: getQueueSnapshot(roomId) });
    }
    case "advance": {
      const next = advanceQueue(roomId);
      return NextResponse.json({ ok: true, advanced: next, queue: getQueueSnapshot(roomId) });
    }
    case "boost": {
      const boosted = boostPerformer(roomId, performerId);
      return NextResponse.json({ ok: true, boosted, queue: getQueueSnapshot(roomId) });
    }
    case "pause": {
      pauseQueue(roomId);
      return NextResponse.json({ ok: true, queue: getQueueSnapshot(roomId) });
    }
    case "resume": {
      resumeQueue(roomId);
      return NextResponse.json({ ok: true, queue: getQueueSnapshot(roomId) });
    }
    default:
      return NextResponse.json({ ok: false, error: `unknown action: ${action}` }, { status: 400 });
  }
}
