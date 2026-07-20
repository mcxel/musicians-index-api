export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getFullAgentRegistrySeed } from "@/lib/agents/AgentRegistrySeed";

function isAdmin(req: NextRequest): boolean {
  const role = (req.cookies.get("tmi_role")?.value ?? "").toUpperCase();
  return role === "ADMIN" || role === "STAFF";
}

// GET — full org chart: every agent with directives, active objectives,
// achievements, and the most recent checkpoints.
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const agents = await prisma.agent.findMany({
    include: {
      directives: { orderBy: { createdAt: "asc" } },
      objectives: { orderBy: { createdAt: "desc" } },
      achievements: { orderBy: { earnedAt: "desc" } },
      checkpoints: { orderBy: { createdAt: "desc" }, take: 10 },
    },
    orderBy: [{ role: "asc" }, { id: "asc" }],
  });

  return NextResponse.json({ agents, count: agents.length });
}

// POST — idempotent seed. Safe to call repeatedly: upserts identity +
// directives (core directives are only ever inserted, never overwritten
// once present, since "kind: core" is meant to be immutable) and creates
// each seed objective only if an objective with that title doesn't already
// exist for that agent.
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const seed = getFullAgentRegistrySeed();
  let agentsCreated = 0;
  let directivesAdded = 0;
  let objectivesAdded = 0;

  for (const entry of seed) {
    const existing = await prisma.agent.findUnique({ where: { id: entry.id } });
    if (!existing) {
      await prisma.agent.create({
        data: { id: entry.id, name: entry.name, role: entry.role, department: entry.department, reportsToId: entry.reportsToId },
      });
      agentsCreated++;
    }

    const existingDirectives = await prisma.agentDirective.findMany({ where: { agentId: entry.id }, select: { text: true } });
    const existingTexts = new Set(existingDirectives.map((d) => d.text));
    for (const directive of entry.directives) {
      if (!existingTexts.has(directive.text)) {
        await prisma.agentDirective.create({ data: { agentId: entry.id, kind: directive.kind, text: directive.text } });
        directivesAdded++;
      }
    }

    const existingObjectives = await prisma.agentObjective.findMany({ where: { agentId: entry.id }, select: { title: true } });
    const existingTitles = new Set(existingObjectives.map((o) => o.title));
    for (const objective of entry.objectives) {
      if (!existingTitles.has(objective.title)) {
        await prisma.agentObjective.create({ data: { agentId: entry.id, title: objective.title, description: objective.description } });
        objectivesAdded++;
      }
    }
  }

  return NextResponse.json({ ok: true, totalAgentsInSeed: seed.length, agentsCreated, directivesAdded, objectivesAdded });
}
