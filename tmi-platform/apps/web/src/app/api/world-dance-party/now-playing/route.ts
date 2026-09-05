import { NextResponse } from "next/server";
import { getNowPlaying } from "@/lib/dance/WorldDancePartyRotationPool";
import { getWorldDancePartyWindow } from "@/lib/dance/WorldDancePartyShowtime";

export const dynamic = "force-dynamic";

export async function GET() {
  const schedule = getWorldDancePartyWindow();
  const nowPlaying = getNowPlaying();
  return NextResponse.json({
    ok: true,
    schedule,
    nowPlaying: {
      active: nowPlaying.active,
      overlayArtist: nowPlaying.overlayArtist,
      overlayTitle: nowPlaying.overlayTitle,
      creditLine: nowPlaying.entry?.creditLine ?? null,
      audioUrl: nowPlaying.entry?.audioUrl ?? null,
      entryId: nowPlaying.entry?.id ?? null,
      djLine: nowPlaying.djLine,
      phase: nowPlaying.phase,
      weekKey: nowPlaying.weekKey,
    },
  });
}
