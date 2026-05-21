import { NextRequest, NextResponse } from "next/server";

const ARTIST_STORE: { id: string; userId: string; name: string; bio: string | null; slug: string; createdAt: string }[] = [];

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function POST(request: NextRequest) {
  let body: { userId?: string; name?: string; bio?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  const { userId, name, bio } = body;
  if (!userId || typeof userId !== "string" || !userId.trim()) {
    return NextResponse.json({ message: "userId is required" }, { status: 400 });
  }
  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ message: "Artist name is required" }, { status: 400 });
  }

  const id = `a-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const artist = {
    id,
    userId: userId.trim(),
    name: name.trim(),
    bio: typeof bio === "string" && bio.trim() ? bio.trim() : null,
    slug: slugify(name.trim()),
    createdAt: new Date().toISOString(),
  };

  // Try to persist via backend API first
  const apiBase = process.env.API_BASE_URL;
  if (apiBase) {
    try {
      const res = await fetch(`${apiBase}/artists`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: artist.userId, name: artist.name, bio: artist.bio }),
      });
      if (res.ok) {
        const data = await res.json();
        return NextResponse.json({ artist: data }, { status: 201 });
      }
    } catch {
      // fall through to standalone
    }
  }

  // Standalone in-memory fallback
  ARTIST_STORE.push(artist);
  return NextResponse.json({ artist }, { status: 201 });
}

export async function GET() {
  return NextResponse.json({ artists: ARTIST_STORE });
}
