export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/user/notes
 * Returns the authenticated user's notes, most recently updated first.
 * If the user has none yet, creates one default note so the workspace
 * never has to render a dead "no way to start" empty state.
 */
export async function GET() {
  const session = await getTmiAuth();
  if (!session) {
    return NextResponse.json({ error: "authentication_required" }, { status: 401 });
  }

  let notes = await prisma.note.findMany({
    where: { ownerId: session.user.id },
    orderBy: { updatedAt: "desc" },
  });

  if (notes.length === 0) {
    const first = await prisma.note.create({
      data: { ownerId: session.user.id, title: "My First Note", content: "" },
    });
    notes = [first];
  }

  return NextResponse.json({ ok: true, notes });
}

/**
 * POST /api/user/notes
 * Body: { noteId?: string; title?: string; content?: string }
 * With noteId: updates that note (must belong to the caller).
 * Without noteId: creates a new note for the caller.
 */
export async function POST(req: Request) {
  const session = await getTmiAuth();
  if (!session) {
    return NextResponse.json({ error: "authentication_required" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({} as Record<string, unknown>));
  const noteId = typeof body.noteId === "string" ? body.noteId : undefined;
  const title = typeof body.title === "string" ? body.title : undefined;
  const content = typeof body.content === "string" ? body.content : "";

  if (noteId) {
    const existing = await prisma.note.findFirst({ where: { id: noteId, ownerId: session.user.id } });
    if (!existing) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    const updated = await prisma.note.update({
      where: { id: noteId },
      data: { content, ...(title ? { title } : {}) },
    });
    return NextResponse.json({ ok: true, note: updated });
  }

  const created = await prisma.note.create({
    data: { ownerId: session.user.id, title: title ?? "Untitled", content },
  });
  return NextResponse.json({ ok: true, note: created });
}
