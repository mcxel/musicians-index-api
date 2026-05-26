import { NextResponse } from "next/server";
import { StreamAndWinEngine } from "@/lib/economy/StreamAndWinEngine";

StreamAndWinEngine.start();

export async function GET() {
  const songs = StreamAndWinEngine.getActiveSongs();
  return NextResponse.json({ ok: true, songs });
}
