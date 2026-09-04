/**
 * POST /api/playlists/user — create a user-owned playlist (Prisma-backed)
 * Used by MediaUrlImporter's "NEW PLAYLIST" flow.
 * Body: { name: string, description?: string, isPublic?: boolean }
 */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

async function authedUserId(req: NextRequest): Promise<string | null> {
  const email = req.cookies.get("tmi_user_email")?.value;
  if (!email) return null;
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  return user?.id ?? null;
}

export async function POST(req: NextRequest) {
  const userId = await authedUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { name?: unknown; description?: unknown; isPublic?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) return NextResponse.json({ error: "name is required." }, { status: 400 });

  const playlist = await prisma.playlist.create({
    data: {
      creatorId: userId,
      name,
      description: typeof body.description === "string" ? body.description : undefined,
      isPublic: body.isPublic !== false,
    },
    select: { id: true, name: true, isPublic: true, createdAt: true },
  });

  return NextResponse.json({ playlist }, { status: 201 });
}
