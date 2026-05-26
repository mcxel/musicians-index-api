import { NextResponse } from "next/server";
import { StreamAndWinEngine } from "@/lib/economy/StreamAndWinEngine";

StreamAndWinEngine.start();

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { artistId, title, genre, audioUrl } = body as Record<string, string>;

  if (!artistId || !title || !genre || !audioUrl) {
    return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
  }

  const result = StreamAndWinEngine.submitSong({ artistId, title, genre, audioUrl });
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 409 });
  }
  return NextResponse.json({ ok: true, song: result.song });
}

export async function GET() {
  const songs = StreamAndWinEngine.getActiveSongs();
  return NextResponse.json({ ok: true, songs });
}
