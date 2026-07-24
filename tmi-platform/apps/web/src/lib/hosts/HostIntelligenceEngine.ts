import { getOpenAIClient } from "@/lib/agents/openaiClient";
import { getHostById } from "@/lib/hosts/HostIdentityRegistry";
import type { PAScriptKey } from "@/lib/hosts/hostEngine";
import { ProviderFallbackRouter } from "@/lib/agents/ProviderFallbackRouter";

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
 * call. Returns a fallback line when the host has
 * no personaPrompt, the OpenAI client isn't configured, or the call fails -
 * utilizing the robust ProviderFallbackRouter.
 */
export async function generateHostLine(
  hostId: string,
  context: HostLineContext
): Promise<string | null> {
  const host = getHostById(hostId);
  if (!host?.personaPrompt) return null;

  const systemPrompt = `You are ${host.name}, a host on TMI (The Musician's Index), a live music competition/entertainment platform.

${host.personaPrompt}

Stay fully in character. Keep the response to one sentence, spoken live to a real audience. Never break character or mention that you are an AI.`;

  const query = buildUserPrompt(context);
  const fallbackText = `Yo, this is ${host.name} on the mic, ready for the next round!`;

  try {
    const result = await ProviderFallbackRouter.executeQuery(
      hostId,
      query,
      systemPrompt,
      fallbackText
    );
    return result.content;
  } catch (error) {
    console.error(`[HostIntelligenceEngine] generateHostLine failed for ${hostId}:`, error);
    return fallbackText;
  }
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * Generates a real, in-character conversational response for a host.
 * Designed for two-way audience interaction: fans can ask hosts where they're
 * from, what they think about something, or just say hi — and the host replies
 * in character. Supports conversation history for multi-turn exchanges.
 *
 * Returns null on any failure (no LLM key, no personaPrompt, API error).
 * Callers should always have a fallback canned response ready.
 */
export async function generateHostChatResponse(
  hostId: string,
  userMessage: string,
  conversationHistory: ChatMessage[] = []
): Promise<string | null> {
  const host = getHostById(hostId);
  if (!host?.personaPrompt) return null;

  const systemPrompt = `You are ${host.name}, a live host on TMI (The Musician's Index) — a live music competition and entertainment platform. You are having a real-time conversation with an audience member.

${host.personaPrompt}

Rules for this chat:
- Stay fully in character at all times. Never say you are an AI.
- Keep each response to 1–3 sentences maximum. You are live on stage; you don't give speeches.
- If the fan tells you where they're from (city, country, region), acknowledge it specifically — a shoutout, a fun fact, a cultural reference, or something warm about that place. Make it feel personal.
- If you don't know the specific place, give a warm generic welcome and ask a follow-up question.
- Never be rude, dismissive, or inappropriate.
- Keep energy consistent with your character style (see above).`;

  const contextHistory = conversationHistory
    .slice(-4)
    .map((m) => `${m.role === "user" ? "User" : "Host"}: ${m.content}`)
    .join("\n");
  const query = contextHistory ? `${contextHistory}\nUser: ${userMessage}` : userMessage;
  const fallbackText = `Hey there! Great to connect with you. Hope you are enjoying the show!`;

  try {
    const result = await ProviderFallbackRouter.executeQuery(
      hostId,
      query,
      systemPrompt,
      fallbackText
    );
    return result.content;
  } catch (error) {
    console.error(`[HostIntelligenceEngine] generateHostChatResponse failed for ${hostId}:`, error);
    return fallbackText;
  }
}
