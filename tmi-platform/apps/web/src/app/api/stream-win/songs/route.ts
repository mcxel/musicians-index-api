import { NextResponse } from "next/server";
import { StreamAndWinEngine } from "@/lib/economy/StreamAndWinEngine";
import { listSubmissions } from "@/lib/submissions/SubmissionEngine";

StreamAndWinEngine.start();

export async function GET() {
  const engineSongs = StreamAndWinEngine.getActiveSongs();
  if (engineSongs.length > 0) {
    return NextResponse.json({ ok: true, songs: engineSongs });
  }

  // Fallback: admin-rotated live track submissions (same pipeline as StreamAndWinRadioPlayer).
  const liveTracks = listSubmissions({ type: "track", status: "live", limit: 50 });
  const songs = liveTracks.map((s) => ({
    id: s.id,
    artistId: s.submitterId,
    title: s.title,
    genre: s.genre,
    audioUrl: s.url,
    submittedAt: s.createdAt,
    state: "active" as const,
    listenCount: 0,
    listenSeconds: 0,
    reactionCounts: { hard: 0, replay: 0, original: 0, skip: 0 },
    voteCount: 0,
    boostPoints: 0,
    visibilityScore: 0,
    lastActivityAt: s.updatedAt,
  }));

  return NextResponse.json({ ok: true, songs });
}
