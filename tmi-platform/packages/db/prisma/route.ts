import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json().catch(() => ({}));
    const userId = typeof body.userId === "string" ? body.userId : "";
    const beatId = typeof body.beatId === "string" ? body.beatId : "";
    const roomId = params.id;

    if (!userId || !beatId) {
      return NextResponse.json({ ok: false, error: "userId and beatId required" }, { status: 400 });
    }

    // 1. Verify Seated Status (The Phase A Gate)
    // Only fans physically occupying a seat can influence the room's audio
    const seat = await prisma.roomSeatState.findFirst({
      where: { roomId, currentUser: userId, occupied: true }
    });

    if (!seat) {
      return NextResponse.json({ ok: false, error: "Only seated participants can veto beats" }, { status: 403 });
    }

    // 2. Validate if already voted
    const existingVote = await prisma.beatVeto.findUnique({
      where: { roomId_beatId_userId: { roomId, beatId, userId } }
    });

    if (existingVote) {
      return NextResponse.json({ ok: false, error: "Already voted to skip this beat" }, { status: 409 });
    }

    // 3. Register Veto
    await prisma.beatVeto.create({
      data: { roomId, beatId, userId }
    });

    // 4. Aggregate Votes & Threshold Calculation
    const [vetoCount, seatedCount] = await Promise.all([
      prisma.beatVeto.count({ where: { roomId, beatId } }),
      prisma.roomSeatState.count({ where: { roomId, occupied: true } })
    ]);

    // Threshold: 30% of the currently seated audience, minimum of 3 votes
    const threshold = Math.max(3, Math.ceil(seatedCount * 0.3));
    const skipTriggered = vetoCount >= threshold;

    if (skipTriggered) {
      // Log the skip in the beat's historical usage (Missing Piece #1)
      await prisma.beatUsageHistory.create({
        data: { beatId, roomId, result: "skip" }
      });
      // A real engine would compute actual percentages, but we increment skip tracking for MVP
      await prisma.beat.update({ where: { id: beatId }, data: { skipRate: { increment: 1 } } });
    }

    return NextResponse.json({ ok: true, vetoCount, threshold, skipTriggered });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}