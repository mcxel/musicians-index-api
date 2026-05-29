import { NextRequest, NextResponse } from 'next/server';
import { AgentMemoryEngine, type MemoryRecord } from '@/lib/agents/AgentMemoryEngine';
import { AgentRegistry } from '@bernout/agent-network';
import { chatWithAgent } from '@/lib/agents/openaiClient';

function extractFacts(text: string): MemoryRecord {
  const facts: MemoryRecord = {};

  const genre = text.match(/(?:favorite\s+)?genre\s+(?:is|=)\s+([a-z][a-z ]*)/i);
  if (genre?.[1]) facts.favorite_genre = genre[1].trim();

  const name = text.match(/my name is\s+([a-z][a-z ]*)/i);
  if (name?.[1]) facts.user_name = name[1].trim();

  const instrument = text.match(/(?:i\s+play|play\s+(?:the\s+)?)([a-z][a-z ]*)/i);
  if (instrument?.[1]) facts.instrument = instrument[1].trim();

  const likes = text.match(/i (?:like|love|enjoy)\s+([a-z][a-z ]+)/i);
  if (likes?.[1]) facts.likes = likes[1].trim();

  const from = text.match(/(?:i'?m?\s+from|i\s+live\s+in)\s+([a-z][a-z ,]+)/i);
  if (from?.[1]) facts.location = from[1].trim();

  return facts;
}

function buildFallbackReply(message: string, memory: MemoryRecord, newFacts: MemoryRecord): string {
  const isRecall = /remember|recall|what.*i.*said|what.*told|what.*my|what do you know/i.test(message);
  const isGreeting = /^(hello|hi|hey|sup|yo|whats good|what's good|wassup)/i.test(message.trim());
  const isStatus = /how.*you|you good|you\s+ok|status|online/i.test(message);

  if (isGreeting) {
    const nameStr = memory.user_name ? `, ${memory.user_name}` : '';
    return `Hey${nameStr}! Big Ace in the building. Arena's live — what do you need?`;
  }
  if (isStatus) {
    return `I'm ONLINE, heartbeat steady, memory clean. Ready to run this room all day.`;
  }
  if (isRecall) {
    if (Object.keys(memory).length === 0) return `Nothing stored yet — tell me something and I'll lock it in.`;
    const lines = Object.entries(memory).map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`).join(' · ');
    return `I got it right here — ${lines}. I remember everything you tell me.`;
  }
  if (Object.keys(newFacts).length > 0) {
    const key = Object.keys(newFacts)[0] as string;
    return `Locked in — your ${key.replace(/_/g, ' ')} is ${newFacts[key]}. I won't forget.`;
  }
  return `Big Ace hears you. Keep talking — I'll remember what matters.`;
}

export async function POST(
  req: NextRequest,
  { params }: { params: { agentId: string } }
) {
  const agent = AgentRegistry.get(params.agentId);
  if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 });

  const body = await req.json() as { message?: string };
  const message = body.message?.trim();
  if (!message) return NextResponse.json({ error: 'message required' }, { status: 400 });

  const memory = AgentMemoryEngine.read(params.agentId);
  const newFacts = extractFacts(message);

  if (Object.keys(newFacts).length > 0) {
    AgentMemoryEngine.patch(params.agentId, newFacts);
    AgentRegistry.setCheckpoint(params.agentId, 'Memory Read/Write', true);
  }

  AgentRegistry.setCheckpoint(params.agentId, 'Chat Replies', true);

  const memoryContext = Object.entries({ ...memory, ...newFacts })
    .map(([k, v]) => `${k}: ${v}`)
    .join(', ');

  const aiReply = await chatWithAgent(params.agentId, message, memoryContext);
  const reply = aiReply ?? buildFallbackReply(message, { ...memory, ...newFacts }, newFacts);

  return NextResponse.json({
    reply,
    agent: agent.name,
    memoryUpdated: Object.keys(newFacts).length > 0,
    newFacts,
    powered: aiReply ? 'gpt-4o-mini' : 'rule-based',
  });
}
