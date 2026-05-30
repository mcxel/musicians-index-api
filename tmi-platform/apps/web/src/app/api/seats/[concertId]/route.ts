import { NextResponse } from "next/server";
import { getConcertSeats } from "@/app/api/seats/reserve/route";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ concertId: string }> },
) {
  const { concertId } = await params;
  const seats = getConcertSeats(concertId);

  return NextResponse.json({
    ok: true,
    concertId,
    reservations: Object.fromEntries(seats.entries()),
    count: seats.size,
  });
}
