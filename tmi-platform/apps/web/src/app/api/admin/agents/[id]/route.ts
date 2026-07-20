export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

function isAdmin(req: NextRequest): boolean {
  const role = (req.cookies.get("tmi_role")?.value ?? "").toUpperCase();
  return role === "ADMIN" || role === "STAFF";
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;

  const agent = await prisma.agent.findUnique({
    where: { id },
    include: {
      directives: { orderBy: { createdAt: "asc" } },
      objectives: { orderBy: { createdAt: "desc" } },
      achievements: { orderBy: { earnedAt: "desc" } },
      checkpoints: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  return NextResponse.json({ agent });
}

type Action =
  | { type: "add_objective"; title: string; description?: string }
  | { type: "complete_objective"; objectiveId: string }
  | { type: "add_achievement"; title: string; description?: string }
  | { type: "add_checkpoint"; note: string; metadata?: Record<string, unknown> }
  | { type: "add_operational_directive"; text: string }
  | { type: "remove_operational_directive"; directiveId: string };

// POST — the only write surface for an agent's record. Deliberately narrow:
// core directives can be added by seed but never removed here (the
// remove_operational_directive action explicitly excludes kind:"core" —
// enforced below, not just by convention).
export async function POST(req: NextRequest, { params }: RouteParams) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;

  const agent = await prisma.agent.findUnique({ where: { id } });
  if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

  const action = (await req.json()) as Action;

  switch (action.type) {
    case "add_objective": {
      if (!action.title) return NextResponse.json({ error: "title required" }, { status: 400 });
      const objective = await prisma.agentObjective.create({
        data: { agentId: id, title: action.title, description: action.description },
      });
      return NextResponse.json({ ok: true, objective });
    }
    case "complete_objective": {
      const objective = await prisma.agentObjective.update({
        where: { id: action.objectiveId },
        data: { status: "completed", completedAt: new Date() },
      });
      return NextResponse.json({ ok: true, objective });
    }
    case "add_achievement": {
      if (!action.title) return NextResponse.json({ error: "title required" }, { status: 400 });
      const achievement = await prisma.agentAchievement.create({
        data: { agentId: id, title: action.title, description: action.description },
      });
      return NextResponse.json({ ok: true, achievement });
    }
    case "add_checkpoint": {
      if (!action.note) return NextResponse.json({ error: "note required" }, { status: 400 });
      const checkpoint = await prisma.agentCheckpoint.create({
        data: { agentId: id, note: action.note, metadata: action.metadata as Prisma.InputJsonValue | undefined },
      });
      return NextResponse.json({ ok: true, checkpoint });
    }
    case "add_operational_directive": {
      if (!action.text) return NextResponse.json({ error: "text required" }, { status: 400 });
      const directive = await prisma.agentDirective.create({
        data: { agentId: id, kind: "operational", text: action.text },
      });
      return NextResponse.json({ ok: true, directive });
    }
    case "remove_operational_directive": {
      const directive = await prisma.agentDirective.findUnique({ where: { id: action.directiveId } });
      if (!directive || directive.agentId !== id) return NextResponse.json({ error: "Directive not found" }, { status: 404 });
      if (directive.kind === "core") {
        return NextResponse.json({ error: "Core directives are immutable and cannot be removed" }, { status: 403 });
      }
      await prisma.agentDirective.delete({ where: { id: action.directiveId } });
      return NextResponse.json({ ok: true });
    }
    default:
      return NextResponse.json({ error: "Unknown action type" }, { status: 400 });
  }
}
