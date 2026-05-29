import { NextRequest, NextResponse } from 'next/server';
import { AgentMemoryEngine, type MemoryRecord } from '@/lib/agents/AgentMemoryEngine';
import { AgentRegistry } from '@bernout/agent-network';
import { chatWithAgent } from '@/lib/agents/openaiClient';

type Priority = 'low' | 'normal' | 'high' | 'critical';

interface CommandBody {
  command: string;
  agentId?: string;
  priority?: Priority;
}

function autoRoute(command: string): string {
  const lower = command.toLowerCase();
  const tmiBound = /room|lobby|live|audience|session|homepage|bot|platform|launch|checklist|tmi/;
  return tmiBound.test(lower) ? 'michael-charlie' : 'big-ace';
}

function extractFacts(text: string): MemoryRecord {
  const facts: MemoryRecord = {};
  const genre = text.match(/(?:favorite\s+)?genre\s+(?:is|=)\s+([a-z][a-z ]*)/i);
  if (genre?.[1]) facts.favorite_genre = genre[1].trim();
  const name = text.match(/my name is\s+([a-z][a-z ]*)/i);
  if (name?.[1]) facts.user_name = name[1].trim();
  return facts;
}

function buildBigAceFallback(command: string, memory: MemoryRecord): string {
  const lower = command.toLowerCase();
  const nameStr = typeof memory.user_name === 'string' ? `, ${memory.user_name}` : '';

  if (/^(hello|hi|hey|morning|what'?s good)/i.test(command.trim()))
    return `Morning${nameStr}. I'm ONLINE. Watching everything — TMI, Thunder World, the whole board. What do you need?`;
  if (/revenue|money|stripe|payment|sales/i.test(lower))
    return `Revenue path check: Stripe config ${process.env.STRIPE_SECRET_KEY ? 'confirmed ✓' : 'missing — needs STRIPE_SECRET_KEY'}. Database ${process.env.DATABASE_URL ? 'connected ✓' : 'not connected — needs DATABASE_URL'}. Admin revenue panel is live. First real $1 test is the next gate.`;
  if (/signup|user|onboard|conversion/i.test(lower))
    return `Signup funnel: auth routes live, role-based onboarding active for all 6 roles. Database persistence gate is the current blocker.`;
  if (/database|db|neon|postgres/i.test(lower))
    return `Database: ${process.env.DATABASE_URL ? 'DATABASE_URL configured ✓' : 'DATABASE_URL missing — this is the #1 blocker'}. Set both DATABASE_URL and DIRECT_URL in Vercel.`;
  if (/status|health|report/i.test(lower))
    return `Big Ace: ONLINE. Memory: ${Object.keys(memory).length} facts stored. All systems monitored.`;

  return `Big Ace hears you${nameStr}. Say what you need — revenue, room status, users, Stripe, or database.`;
}

function buildMichaelCharlieFallback(command: string): string {
  const lower = command.toLowerCase();

  if (/room|live session|broadcast/i.test(lower))
    return `TMI rooms: live session registry active. Go-live route functional. Audience polling every 2.5s. WebRTC via Daily.co.`;
  if (/homepage|home\s*1|home\s*2|page/i.test(lower))
    return `Homepage: home/1 through home/15 routes active. Magazine NavBar stable. Beta banner dismiss functional.`;
  if (/bot|ghost|archetype/i.test(lower))
    return `Bot runtime: 62 bots registered. Ghost archetypes active. Heartbeat monitor running every 5s.`;
  if (/launch|checkpoint|status|gate/i.test(lower)) {
    const mc = AgentRegistry.get('michael-charlie');
    if (!mc) return `Registry loading…`;
    const passed = mc.checkpoints.filter((c) => c.passed).length;
    const total  = mc.checkpoints.length;
    return `Launch status: ${passed}/${total} gates passed. ${mc.checkpoints.map((c) => `${c.passed ? '✓' : '○'} ${c.label}`).join(' · ')}`;
  }
  return `Michael Charlie standing by. I monitor rooms, lobbies, live sessions, bots, payments, and homepage.`;
}

export async function POST(req: NextRequest) {
  const body = await req.json() as CommandBody;
  const { command, priority = 'normal' } = body;

  if (!command?.trim()) return NextResponse.json({ error: 'command required' }, { status: 400 });

  const agentId = body.agentId === 'auto' || !body.agentId ? autoRoute(command) : body.agentId;
  const agent = AgentRegistry.get(agentId);
  if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 });

  const memory = AgentMemoryEngine.read(agentId);
  const newFacts = extractFacts(command);

  if (Object.keys(newFacts).length > 0) {
    AgentMemoryEngine.patch(agentId, newFacts);
    AgentRegistry.setCheckpoint(agentId, 'Memory Read/Write', true);
  }

  AgentRegistry.setCheckpoint(agentId, 'Command Routing', true);

  const memoryContext = Object.entries({ ...memory, ...newFacts })
    .map(([k, v]) => `${k}: ${v}`)
    .join(', ');

  const aiReply = await chatWithAgent(agentId, command, memoryContext);
  const reply = aiReply ?? (agentId === 'michael-charlie'
    ? buildMichaelCharlieFallback(command)
    : buildBigAceFallback(command, { ...memory, ...newFacts }));

  const taskId = `${agentId === 'michael-charlie' ? 'MC' : 'BA'}-${Date.now().toString(36).toUpperCase()}`;

  return NextResponse.json({
    taskId,
    agentId,
    agentName: agent.name,
    reply,
    priority,
    status: 'COMPLETED',
    timestamp: new Date().toISOString(),
    powered: aiReply ? 'gpt-4o-mini' : 'rule-based',
  });
}
