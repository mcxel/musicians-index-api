import { NextResponse } from "next/server";
import { getSlowJamsNowPlaying } from "@/lib/radio/SlowJamsRotationPool";
import { getSlowJamsWindow } from "@/lib/radio/SlowJamsShowtime";

export const dynamic = "force-dynamic";

export async function GET() {
  const schedule = getSlowJamsWindow();
  const nowPlaying = getSlowJamsNowPlaying();
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
      fadeActive: nowPlaying.fadeActive,
      fadeProgress: nowPlaying.fadeProgress,
    },
  });
}
