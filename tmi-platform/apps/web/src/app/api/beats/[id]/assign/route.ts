import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { NextRequest } from "next/server";

const VALID_TARGET_TYPES = ["battle", "cypher", "tournament", "challenge", "game-show", "monthly-idol"];

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const actorId = req.cookies.get("tmi_session_id")?.value ?? "";

  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { /* no body */ }

  const targetType = typeof body.targetType === "string" ? body.targetType : "";
  const targetId   = typeof body.targetId === "string" ? body.targetId : "";

  if (!VALID_TARGET_TYPES.includes(targetType)) {
    return NextResponse.json({ ok: false, error: `targetType must be one of: ${VALID_TARGET_TYPES.join(", ")}` }, { status: 400 });
  }
  if (!targetId) {
    return NextResponse.json({ ok: false, error: "targetId required" }, { status: 400 });
  }

  const beat = await prisma.beat.findUnique({ where: { id: params.id } });
  if (!beat) {
    return NextResponse.json({ ok: false, error: "beat not found" }, { status: 404 });
  }

  const assignment = await prisma.beatAssignment.upsert({
    where: { beatId_targetType_targetId: { beatId: params.id, targetType, targetId } },
    create: { beatId: params.id, targetType, targetId },
    update: { assignedAt: new Date() },
  });

  try {
    if (actorId) {
      await prisma.auditLog.create({
        data: {
          action: "BEAT_ASSIGNED",
          actorId,
          targetId: beat.id,
          details: { beatTitle: beat.title, targetType, targetId, assignedAt: new Date().toISOString() },
        },
      });
    }
  } catch {
    console.error("[assign] audit log write failed for beat", beat.id);
  }

  return NextResponse.json({ ok: true, assignment });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const assignments = await prisma.beatAssignment.findMany({
    where: { beatId: params.id },
    orderBy: { assignedAt: "desc" },
  });
  return NextResponse.json({ ok: true, assignments });
}
