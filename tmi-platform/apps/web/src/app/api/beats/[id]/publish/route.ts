import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { NextRequest } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const role    = req.cookies.get("tmi_role")?.value ?? "";
  const actorId = req.cookies.get("tmi_session_id")?.value ?? "";

  if (role !== "ADMIN" && role !== "admin") {
    return NextResponse.json({ ok: false, error: "admin only" }, { status: 403 });
  }

  const beat = await prisma.beat.findUnique({ where: { id: params.id } });
  if (!beat) {
    return NextResponse.json({ ok: false, error: "beat not found" }, { status: 404 });
  }

  const updated = await prisma.beat.update({
    where: { id: params.id },
    data: { status: "published", moderationStatus: "APPROVED" },
  });

  try {
    if (actorId) {
      await prisma.auditLog.create({
        data: {
          action: "BEAT_PUBLISHED",
          actorId,
          targetId: beat.id,
          details: { beatTitle: beat.title, publishedAt: new Date().toISOString() },
        },
      });
    }
  } catch {
    console.error("[publish] audit log write failed for beat", beat.id);
  }

  return NextResponse.json({ ok: true, beat: updated });
}
