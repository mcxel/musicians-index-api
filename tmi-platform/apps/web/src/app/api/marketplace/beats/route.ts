import { NextResponse } from "next/server";

interface Beat {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  genre: string;
  bpm: number;
  priceUSD: number;
  licenseType: "lease" | "exclusive" | "free";
  tags: string[];
  createdAt: string;
}

const SEED_BEATS: Beat[] = [
  { id: "b001", title: "Midnight Signal",    artistId: "kreach",     artistName: "Kreach",     genre: "Trap",       bpm: 140, priceUSD: 29.99,  licenseType: "lease",     tags: ["dark", "808"], createdAt: "2026-05-01" },
  { id: "b002", title: "Crown Wave",         artistId: "kg-beats",   artistName: "KG Beats",   genre: "Hip-Hop",    bpm: 95,  priceUSD: 19.99,  licenseType: "lease",     tags: ["bounce", "west coast"], createdAt: "2026-05-05" },
  { id: "b003", title: "Savage Drop",        artistId: "savageguns", artistName: "Savage Guns", genre: "Drill",     bpm: 145, priceUSD: 49.99,  licenseType: "exclusive", tags: ["hard", "drill"], createdAt: "2026-05-08" },
  { id: "b004", title: "City Lights",        artistId: "nova",       artistName: "Nova Cipher",genre: "R&B",        bpm: 88,  priceUSD: 0,      licenseType: "free",      tags: ["chill", "vibes"], createdAt: "2026-05-10" },
  { id: "b005", title: "Arena Anthem",       artistId: "kreach",     artistName: "Kreach",     genre: "Club",       bpm: 128, priceUSD: 39.99,  licenseType: "lease",     tags: ["festival", "energy"], createdAt: "2026-05-12" },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const genre = searchParams.get("genre");
  const license = searchParams.get("license");
  const limit = Number(searchParams.get("limit") ?? "20");

  let beats = SEED_BEATS;
  if (genre) beats = beats.filter(b => b.genre.toLowerCase() === genre.toLowerCase());
  if (license) beats = beats.filter(b => b.licenseType === license);

  return NextResponse.json({ beats: beats.slice(0, limit), total: beats.length });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { beatId: string; userId: string; licenseType?: string };
    if (!body.beatId || !body.userId) {
      return NextResponse.json({ error: "beatId and userId required" }, { status: 400 });
    }
    const beat = SEED_BEATS.find(b => b.id === body.beatId);
    if (!beat) return NextResponse.json({ error: "Beat not found" }, { status: 404 });

    return NextResponse.json({
      success: true,
      purchase: {
        id: `purchase_${Date.now()}`,
        beatId: beat.id,
        beatTitle: beat.title,
        userId: body.userId,
        licenseType: body.licenseType ?? beat.licenseType,
        paidUSD: beat.priceUSD,
        downloadUrl: `/api/beats/${beat.id}/download`,
        purchasedAt: new Date().toISOString(),
      },
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
