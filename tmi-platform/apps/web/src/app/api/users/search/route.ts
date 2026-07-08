import { NextRequest, NextResponse } from "next/server";
import { db } from "@tmi/db";

export const dynamic = "force-dynamic";
export const runtime  = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q     = searchParams.get("q")?.trim() ?? "";
  const role  = searchParams.get("role")?.toUpperCase() ?? "";
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "10"), 30);

  if (q.length < 2) return NextResponse.json({ users: [] });

  try {
    const users = await db.user.findMany({
      where: {
        OR: [
          { name:  { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
        ],
        // Exclude QA certification fleet accounts from all public search results
        NOT: { email: { endsWith: "@themusiciansindex.test" } },
        ...(role ? { role: role as "FAN" | "ARTIST" | "PERFORMER" | "SPONSOR" | "ADVERTISER" | "VENUE" | "PROMOTER" | "ADMIN" } : {}),
      },
      take: limit,
      select: {
        id:            true,
        name:          true,
        email:         true,
        role:          true,
        artistProfile: { select: { slug: true, genres: true } },
      },
      orderBy: { userCreatedAt: "desc" },
    });

    const formatted = users.map((u) => ({
      id:        u.id,
      name:      u.name ?? u.email?.split("@")[0] ?? `user-${u.id.slice(0, 8)}`,
      slug:      u.artistProfile?.slug ?? u.id,
      role:      u.role ?? "FAN",
      genre:     u.artistProfile?.genres?.[0] ?? undefined,
      isLive:    false,
      followers: 0,
    }));

    return NextResponse.json({ users: formatted });
  } catch (e) {
    console.error("[users/search]", e);
    // Return empty on error — search is non-critical
    return NextResponse.json({ users: [] });
  }
}
