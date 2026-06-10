import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { NextRequest } from "next/server";
import { getCanonicalRoomSlug } from "@/lib/world/WorldRuntime";

// In-memory vote store: roomId → beatId → Set<userId>
// Votes are ephemeral — they expire when the beat changes.
const voteStore = new Map<string, { beatId: string; voters: Set<string> }>();

const SKIP_THRESHOLD_PCT = 0.30; // 30% of seated fans triggers skip
const MIN_VOTES_TO_SKIP  = 3;    // minimum votes required (prevents single-vote skips in empty rooms)

function getRoomVotes(roomId: string, beatId: string): Set<string> {
  const current = voteStore.get(roomId);
  if (current?.beatId !== beatId) {
    voteStore.set(roomId, { beatId, voters: new Set() });
  }
  return voteStore.get(roomId)!.voters;
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const roomId = getCanonicalRoomSlug(params.id);
  const userId = req.cookies.get("tmi_session_id")?.value ?? "";

  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { /* no body */ }

  const beatId = typeof body.beatId === "string" ? body.beatId : "";

  if (!userId) {
    return NextResponse.json({ ok: false, error: "not authenticated" }, { status: 401 });
  }
  if (!beatId) {
    return NextResponse.json({ ok: false, error: "beatId required" }, { status: 400 });
  }

  // Verify the voter is actually seated in this room (blocks bots and lurkers)
  const seatState = await prisma.roomSeatState.findFirst({
    where: { roomId, currentUser: userId, occupied: true },
  });

  if (!seatState) {
    return NextResponse.json({ ok: false, error: "must be seated to vote skip" }, { status: 403 });
  }

  // Count total seated fans for threshold calculation
  const seatedCount = await prisma.roomSeatState.count({
    where: { roomId, occupied: true },
  });

  const voters = getRoomVotes(roomId, beatId);
  voters.add(userId);

  const voteCount  = voters.size;
  const threshold  = Math.max(MIN_VOTES_TO_SKIP, Math.ceil(seatedCount * SKIP_THRESHOLD_PCT));
  const skipped    = voteCount >= threshold;

  if (skipped) {
    voteStore.delete(roomId); // clear votes — beat is being skipped
  }

  return NextResponse.json({
    ok: true,
    voteCount,
    threshold,
    seatedCount,
    skipped,
    pct: seatedCount > 0 ? Math.round((voteCount / seatedCount) * 100) : 0,
  });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const roomId = getCanonicalRoomSlug(params.id);
  const current = voteStore.get(roomId);
  const seatedCount = await prisma.roomSeatState.count({
    where: { roomId, occupied: true },
  });
  const voteCount = current?.voters.size ?? 0;
  const threshold = Math.max(MIN_VOTES_TO_SKIP, Math.ceil(seatedCount * SKIP_THRESHOLD_PCT));

  return NextResponse.json({
    ok: true,
    beatId: current?.beatId ?? null,
    voteCount,
    threshold,
    seatedCount,
    pct: seatedCount > 0 ? Math.round((voteCount / seatedCount) * 100) : 0,
  });
}
