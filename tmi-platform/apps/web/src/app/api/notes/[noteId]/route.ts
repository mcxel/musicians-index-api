export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";
import { prisma } from "@/lib/prisma";

/**
 * DELETE /api/notes/[noteId]
 * Deletes a specific note owned by the authenticated user.
 */
export async function DELETE(
  _req: Request,
  { params }: { params: { noteId: string } }
) {
  const session = await getTmiAuth();
  if (!session) {
    return NextResponse.json({ error: "authentication_required" }, { status: 401 });
  }

  const { noteId } = params;

  const note = await prisma.note.findFirst({
    where: { id: noteId, ownerId: session.user.id },
  });
  if (!note) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  await prisma.note.delete({ where: { id: noteId } });
  return NextResponse.json({ ok: true });
}
