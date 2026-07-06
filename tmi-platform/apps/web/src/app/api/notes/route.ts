export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/notes
 * Body: { title?: string; content?: string }
 * Creates a new note for the authenticated user and returns the note object.
 */
export async function POST(req: Request) {
  const session = await getTmiAuth();
  if (!session) {
    return NextResponse.json({ error: "authentication_required" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({} as Record<string, unknown>));
  const title = typeof body.title === "string" && body.title.trim() ? body.title.trim() : "Untitled";
  const content = typeof body.content === "string" ? body.content : "";

  const note = await prisma.note.create({
    data: { ownerId: session.user.id, title, content },
  });
  return NextResponse.json(note, { status: 201 });
}
