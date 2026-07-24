import { NextRequest, NextResponse } from "next/server";
import {
  generateHostChatResponse,
  type ChatMessage,
} from "@/lib/hosts/HostIntelligenceEngine";
import { getHostById } from "@/lib/hosts/HostIdentityRegistry";

/**
 * POST /api/hosts/[hostId]/chat
 *
 * Two-way conversational endpoint for real audience-to-host interaction.
 * Fans can greet a host, tell them where they're from, ask questions, or
 * just chat. The host replies in character (AI-generated when personaPrompt
 * is set and the OpenAI account has credits; static fallback otherwise).
 *
 * Request body:
 *   message: string           — the fan's message
 *   history?: ChatMessage[]   — prior turns for multi-turn context (max 6 used)
 *
 * Response:
 *   { success: true, reply: string, source: 'ai'|'static', hostName: string }
 */

// Per-host canned fallbacks — used when LLM is unavailable. One per host
// so the fallback is in-character rather than generic.
const STATIC_GREETINGS: Record<string, string> = {
  "record-ralph":  "Yo! What's good! The floor is hot tonight, you feeling it?",
  "gregory-marcel":"Hey, welcome! Glad you're here tonight. What's your name?",
  "bobby-stanley": "Oh we got a live one! Welcome to the show — you ready to play?",
  "bebo":          "Heeey! *swings cane* Great to see you! Don't make me use this!",
  "julius":        "Hi hi hi! *bounces* I'm Julius! Aren't you excited?! I'm excited!",
  "tiana":         "Welcome! This stage is yours tonight just as much as mine. Let's go!",
  "nova-mc":       "Head up, chest out. You're in the battle zone. Welcome.",
  "aura-pa":       "Welcome to TMI! Enjoy the show. We're glad you're here.",
  "kira":          "Hey there! Love having you with us tonight. What brings you in?",
  "mindy-jean-long": "Oh my gosh, hi! You are going to LOVE tonight. Stick around!",
};

export async function POST(
  req: NextRequest,
  { params }: { params: { hostId: string } }
) {
  try {
    const host = getHostById(params.hostId);
    if (!host) {
      return NextResponse.json({ error: "Unknown hostId" }, { status: 404 });
    }

    const body = await req.json();
    const userMessage = typeof body?.message === "string" ? body.message.trim() : "";
    if (!userMessage) {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }
    if (userMessage.length > 500) {
      return NextResponse.json({ error: "message too long (max 500 chars)" }, { status: 400 });
    }

    const history: ChatMessage[] = Array.isArray(body?.history) ? body.history : [];

    const aiReply = await generateHostChatResponse(params.hostId, userMessage, history);
    if (aiReply) {
      return NextResponse.json({
        success: true,
        reply: aiReply,
        source: "ai",
        hostName: host.name,
      });
    }

    // Honest static fallback — in-character per host, not a generic error message
    const fallback =
      STATIC_GREETINGS[params.hostId] ??
      `Hey! I'm ${host.shortName} — so glad you're here tonight!`;

    return NextResponse.json({
      success: true,
      reply: fallback,
      source: "static",
      hostName: host.name,
    });
  } catch (error) {
    console.error("[hosts/chat] unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
