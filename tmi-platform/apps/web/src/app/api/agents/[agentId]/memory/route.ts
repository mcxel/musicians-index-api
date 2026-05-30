import { NextRequest, NextResponse } from 'next/server';
import { AgentMemoryEngine } from '@/lib/agents/AgentMemoryEngine';
import { AgentRegistry } from '@/stubs/bernout-agent-network';

export async function GET(
  _req: NextRequest,
  { params }: { params: { agentId: string } }
) {
  const agent = AgentRegistry.get(params.agentId);
  if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 });

  const memory = AgentMemoryEngine.read(params.agentId);
  return NextResponse.json({
    agentId: params.agentId,
    name: agent.name,
    role: agent.role,
    health: agent.health,
    organization: agent.organization,
    currentAssignment: agent.currentAssignment,
    currentGoal: agent.currentGoal,
    checkpoints: agent.checkpoints,
    tasks: agent.tasks,
    memory,
    memoryCount: Object.keys(memory).length,
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { agentId: string } }
) {
  const agent = AgentRegistry.get(params.agentId);
  if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 });

  const body = await req.json() as Record<string, string | number | boolean | null>;
  const saved = AgentMemoryEngine.patch(params.agentId, body);
  const memory = AgentMemoryEngine.read(params.agentId);

  if (saved) {
    AgentRegistry.setCheckpoint(params.agentId, 'Memory Read/Write', true);
  }

  return NextResponse.json({ saved, memory, memoryCount: Object.keys(memory).length });
}
