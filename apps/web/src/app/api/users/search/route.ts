import { NextRequest, NextResponse } from "next/server";
import { prisma as db } from "@/lib/prisma";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";
import { peopleSearchWhere } from "@/lib/social/peopleSearchPolicy";

export const dynamic = "force-dynamic";
export const runtime  = "nodejs";

export async function GET(req: NextRequest) {
  const auth = await getTmiAuth();
  if (!auth) return NextResponse.json({ users: [] }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const q     = searchParams.get("q")?.trim() ?? "";
  const role  = searchParams.get("role")?.toUpperCase() ?? "";
  const friendsOnly = searchParams.get("scope") === "friends";
  const directory = searchParams.get("scope") === "directory";
  const limit = Math.min(Math.max(parseInt(searchParams.get("limit") ?? "10", 10) || 10, 1), 30);
  const offset = directory ? Math.max(0, Math.min(parseInt(searchParams.get("offset") ?? "0", 10) || 0, 100000)) : 0;

  if ((!friendsOnly && !directory && q.length < 2) || (q.length > 0 && q.length < 2) || q.length > 80 || q.includes("@")) return NextResponse.json({ users: [] });

  // Directory reads only columns that exist on the loopback User table.
  // displayName, userProfile, and userCreatedAt are not available here.
  if (directory) {
    try {
      const users = await db.user.findMany({
        where: {
          id: { not: auth.user.id },
          ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
        },
        take: limit,
        skip: offset,
        select: { id: true, name: true, role: true },
        orderBy: { name: "asc" },
      });
      const formatted = users.flatMap((user) => {
        const name = user.name?.trim();
        if (!name) return [];
        return [{ id: user.id, name, slug: user.id, role: user.role }];
      });
      return NextResponse.json({
        users: formatted,
        nextOffset: users.length === limit ? offset + users.length : null,
      });
    } catch (e) {
      console.error("[users/search]", e);
      return NextResponse.json({ users: [], error: "directory_unavailable" }, { status: 503 });
    }
  }

  try {
    const users = await db.user.findMany({
      where: {
        ...peopleSearchWhere(auth.user.id, q, friendsOnly, directory),
        ...(role ? { role: role as "FAN" | "ARTIST" | "PERFORMER" | "SPONSOR" | "ADVERTISER" | "VENUE" | "PROMOTER" | "ADMIN" } : {}),
      },
      take: limit,
      ...(directory ? { skip: offset } : {}),
      select: {
        id:            true,
        displayName:   true,
        role:          true,
        userProfile: { select: { username: true, displayName: true } },
        artistProfile: { select: { slug: true, stageName: true } },
      },
      orderBy: { userCreatedAt: "desc" },
    });

    const formatted = users.flatMap((user) => {
      const name = user.artistProfile?.stageName ?? user.userProfile?.displayName ?? user.displayName;
      if (!name?.trim()) return [];
      return [{
        id: user.id,
        name,
        slug: user.artistProfile?.slug ?? user.userProfile?.username ?? user.id,
        role: user.role,
      }];
    });

    return NextResponse.json({ users: formatted, ...(directory ? { nextOffset: users.length === limit ? offset + users.length : null } : {}) });
  } catch (e) {
    console.error("[users/search]", e);
    const error = friendsOnly ? "friends_unavailable" : "search_unavailable";
    const code = e && typeof e === "object" && "code" in e ? String((e as { code?: string }).code) : "unknown";
    return NextResponse.json({ users: [], error, code }, { status: 503 });
  }
}
