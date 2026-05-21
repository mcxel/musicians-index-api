import { NextRequest } from "next/server";
import { sanitizeQuestion, enforceRateLimit } from "@/security/SecurityController";

// ── Answer contract ───────────────────────────────────────────────────────────

interface AnswerContract {
  front: string;
  key_points: string[];
  actions: string[];
  avoid: string[];
  deadlines: string | null;
  followups: string[];
  disclaimer: string;
}

// ── Topic classifier ──────────────────────────────────────────────────────────

type LegalTopic =
  | "TRAFFIC" | "TENANT" | "EMPLOYMENT" | "FAMILY" | "CRIMINAL"
  | "CONTRACT" | "TAX" | "IMMIGRATION" | "BANKRUPTCY"
  | "PERSONAL_INJURY" | "GENERAL";

const HIGH_STAKES_TOPICS: LegalTopic[] = ["CRIMINAL", "IMMIGRATION", "FAMILY"];

function classifyTopic(question: string): LegalTopic {
  const q = question.toLowerCase();
  if (/\b(ticket|speeding|dui|dwi|traffic|license)\b/.test(q)) return "TRAFFIC";
  if (/\b(landlord|tenant|eviction|lease|rent|deposit)\b/.test(q)) return "TENANT";
  if (/\b(fired|terminated|harassment|workplace|employer|wage|overtime)\b/.test(q)) return "EMPLOYMENT";
  if (/\b(divorce|custody|child support|alimony|marriage|adoption)\b/.test(q)) return "FAMILY";
  if (/\b(criminal|arrested|charge|felony|misdemeanor|prison|bail)\b/.test(q)) return "CRIMINAL";
  if (/\b(contract|agreement|breach|damages|sue|lawsuit|liability)\b/.test(q)) return "CONTRACT";
  if (/\b(tax|irs|audit|deduction|refund|w2|1099)\b/.test(q)) return "TAX";
  if (/\b(immigration|visa|green card|deportation|asylum|citizenship)\b/.test(q)) return "IMMIGRATION";
  if (/\b(bankruptcy|debt|foreclosure|chapter 7|chapter 13)\b/.test(q)) return "BANKRUPTCY";
  if (/\b(injury|accident|medical|pain|damages|negligence)\b/.test(q)) return "PERSONAL_INJURY";
  return "GENERAL";
}

// ── Answer cache (24h TTL) ────────────────────────────────────────────────────

interface CachedAnswer {
  answer: AnswerContract;
  topic: LegalTopic;
  cachedAt: number;
}

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const answerCache = new Map<string, CachedAnswer>();

function getCacheKey(userId: string, question: string): string {
  return `${classifyTopic(question)}:${question.slice(0, 120).toLowerCase().replace(/\s+/g, " ")}`;
}

function buildAnswer(question: string, topic: LegalTopic): AnswerContract {
  const isHighStakes = HIGH_STAKES_TOPICS.includes(topic);
  return {
    front: `Based on your question about ${topic.toLowerCase().replace("_", " ")} law: This is general legal information, not advice specific to your case.`,
    key_points: [
      `Your question falls under ${topic} law.`,
      "Laws vary significantly by state and jurisdiction.",
      isHighStakes
        ? "⚠️ This topic carries serious legal consequences. Consult an attorney immediately."
        : "Many issues in this area can be addressed with the right documentation.",
    ],
    actions: [
      "Document everything related to your situation.",
      "Gather any relevant contracts, communications, or records.",
      isHighStakes ? "Retain licensed legal counsel before taking any action." : "Research your local jurisdiction's specific statutes.",
    ],
    avoid: [
      "Do not sign any agreements without reading them fully.",
      "Do not ignore deadlines — legal time limits (statutes of limitations) are strict.",
    ],
    deadlines: isHighStakes
      ? "Deadlines in this area may be very short. Act promptly."
      : null,
    followups: [
      "Would you like information about finding free legal aid?",
      "Do you need help understanding a specific document?",
    ],
    disclaimer:
      "This is AI-generated legal information only. It does not constitute legal advice and does not create an attorney-client relationship. For advice specific to your situation, consult a licensed attorney.",
  };
}

// ── POST /api/law-bubble/ask-question (SSE streaming) ────────────────────────

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const { userId, question: rawQuestion } = body as Record<string, unknown>;
  if (typeof userId !== "string" || typeof rawQuestion !== "string") {
    return new Response("Missing fields", { status: 400 });
  }

  const rl = enforceRateLimit(userId);
  if (!rl.allowed) {
    return new Response("Rate limit exceeded", { status: 429 });
  }

  const question = sanitizeQuestion(rawQuestion);
  if (question.length < 5) {
    return new Response("Question too short", { status: 400 });
  }

  const topic = classifyTopic(question);
  const cacheKey = getCacheKey(userId, question);
  const cached = answerCache.get(cacheKey);

  let answer: AnswerContract;
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
    answer = cached.answer;
  } else {
    answer = buildAnswer(question, topic);
    answerCache.set(cacheKey, { answer, topic, cachedAt: Date.now() });
  }

  // Build full response text
  const parts = [
    answer.front,
    "",
    "**Key Points:**",
    ...answer.key_points.map((p) => `• ${p}`),
    "",
    "**Recommended Actions:**",
    ...answer.actions.map((a) => `• ${a}`),
    "",
    "**Avoid:**",
    ...answer.avoid.map((a) => `• ${a}`),
    ...(answer.deadlines ? ["", `⏰ **Deadlines:** ${answer.deadlines}`] : []),
    "",
    `_${answer.disclaimer}_`,
  ];
  const fullText = parts.join("\n");

  // Stream as SSE
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const words = fullText.split(" ");
      for (const word of words) {
        controller.enqueue(encoder.encode(`data: ${word} \n\n`));
        await new Promise((r) => setTimeout(r, 18));
      }
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Module-Id": "law",
    },
  });
}
