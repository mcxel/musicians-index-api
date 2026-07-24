import { getOpenAIClient } from "./openaiClient";
import { AgentMemoryEngine } from "./AgentMemoryEngine";

export interface RoutingResult {
  source: "DETERMINISTIC_RULES" | "MEMORY_CACHE" | "FRONTIER_API" | "FALLBACK_TEMPLATE";
  content: string;
  latencyMs: number;
}

const LOCAL_DETERMINISTIC_RULES: Record<string, string> = {
  "help": "I am Michael Charlie, Operating General Manager of TMI. You can manage shows, view rankings, or host mini-battles here.",
  "about": "TMI (The Musician's Index) is the premier live music competition and streaming hub.",
  "constitution": "Every AI executive operating under BerntoutGlobal LLC is bound to operate within assigned authority, log decisions, and escalate high-impact financial actions.",
};

export const ProviderFallbackRouter = {
  /**
   * Routes query execution through the 5-tier intelligence ladder.
   * Ensures complete offline resilience.
   */
  async executeQuery(
    agentId: string,
    query: string,
    systemPrompt: string,
    fallbackText: string
  ): Promise<RoutingResult> {
    const start = Date.now();
    const cleanQuery = query.trim().toLowerCase();

    // Tier 1: Local Deterministic Rules
    if (LOCAL_DETERMINISTIC_RULES[cleanQuery]) {
      return {
        source: "DETERMINISTIC_RULES",
        content: LOCAL_DETERMINISTIC_RULES[cleanQuery],
        latencyMs: Date.now() - start,
      };
    }

    // Tier 2: Memory Retrieval (RAG / Cache)
    const memory = AgentMemoryEngine.read(agentId);
    const rawCache = memory.qa_cache ? JSON.parse(memory.qa_cache as string) : {};
    const cachedAnswers = (rawCache as Record<string, string>) || {};
    if (cachedAnswers[cleanQuery]) {
      return {
        source: "MEMORY_CACHE",
        content: cachedAnswers[cleanQuery],
        latencyMs: Date.now() - start,
      };
    }

    // Tier 3: External Model Provider (OpenAI)
    const client = getOpenAIClient();
    if (client) {
      try {
        const response = await client.chat.completions.create({
          model: "gpt-4o-mini",
          max_tokens: 120,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: query },
          ],
        });

        const reply = response.choices[0]?.message?.content?.trim() || "";
        if (reply) {
          // Cache the successful response for next time (learning pipeline)
          cachedAnswers[cleanQuery] = reply;
          AgentMemoryEngine.patch(agentId, { qa_cache: JSON.stringify(cachedAnswers) });

          return {
            source: "FRONTIER_API",
            content: reply,
            latencyMs: Date.now() - start,
          };
        }
      } catch (error) {
        console.warn(`[ProviderFallbackRouter] Frontier API failed for ${agentId}. Falling back...`, error);
      }
    }

    // Tier 4: Safe Deterministic Fallback Template
    return {
      source: "FALLBACK_TEMPLATE",
      content: fallbackText,
      latencyMs: Date.now() - start,
    };
  },
};
