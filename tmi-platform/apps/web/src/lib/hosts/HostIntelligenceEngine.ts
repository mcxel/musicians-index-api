import { getOpenAIClient } from "@/lib/agents/openaiClient";
import { getHostById } from "@/lib/hosts/HostIdentityRegistry";
import type { PAScriptKey } from "@/lib/hosts/hostEngine";

// Real event context only - every field here maps to something
// EventOrchestrator/OrchestratedEvent actually produces today. No invented
// fields (no "crowd energy %", no "season") that nothing in the codebase
// currently tracks.
export interface HostLineContext {
  moment: PAScriptKey;
  showTitle: string;
  viewerCount: number;
  sponsorName?: string;
  winnerName?: string;
}

function buildUserPrompt(context: HostLineContext): string {
  const parts = [
    `Moment: ${context.moment}`,
    `Show: ${context.showTitle}`,
    `Viewers: ${context.viewerCount}`,
  ];
  if (context.sponsorName) parts.push(`Sponsor: ${context.sponsorName}`);
  if (context.winnerName) parts.push(`Winner: ${context.winnerName}`);
  return `${parts.join("\n")}\n\nSay one short, in-character line for this moment. No stage directions, no quotation marks, no emoji unless it's how you'd actually talk.`;
}

/**
 * Generates one contextual, in-character line for a host via a real LLM
 * call. Returns null (never a fabricated fallback line) when the host has
 * no personaPrompt, the OpenAI client isn't configured, or the call fails -
 * callers should fall back to hostEngine's static PA_SCRIPTS in that case.
 *
 * Deliberately NOT wired into the polled GET /api/rooms/orchestrated path -
 * that would mean a paid LLM call on every poll. This is an on-demand
 * function for real, deliberate trigger points.
 */
export async function generateHostLine(
  hostId: string,
  context: HostLineContext
): Promise<string | null> {
  const host = getHostById(hostId);
  if (!host?.personaPrompt) return null;

  const client = getOpenAIClient();
  if (!client) return null;

  const systemPrompt = `You are ${host.name}, a host on TMI (The Musician's Index), a live music competition/entertainment platform.

${host.personaPrompt}

Stay fully in character. Keep the response to one sentence, spoken live to a real audience. Never break character or mention that you are an AI.`;

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 60,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: buildUserPrompt(context) },
      ],
    });
    return response.choices[0]?.message?.content?.trim() ?? null;
  } catch (error) {
    console.error(`[HostIntelligenceEngine] generateHostLine failed for ${hostId}:`, error);
    return null;
  }
}
