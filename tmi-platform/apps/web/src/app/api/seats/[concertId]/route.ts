import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCanonicalRoomSlug } from "@/lib/world/WorldRuntime";
import { cleanupExpiredSeatReservations } from "@/lib/seats/seatCleanup";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ concertId: string }> },
) {
  const { concertId: rawConcertId } = await params;
  const concertId = getCanonicalRoomSlug(rawConcertId);

  // Sweep expired holds before reading so polling clients never see a seat
  // reported as occupied after its TTL has lapsed (would falsely block Fan B
  // until some other fan's reserve/release happened to trigger the cleanup).
  await cleanupExpiredSeatReservations(prisma, concertId);

  const [reservations, seatStates] = await Promise.all([
    prisma.seatReservation.findMany({ where: { roomId: concertId } }),
    prisma.roomSeatState.findMany({ where: { roomId: concertId } }),
  ]);

  return NextResponse.json({
    ok: true,
    concertId,
    reservations,
    seatStates,
    count: seatStates.filter(s => s.occupied).length,
  });
}
