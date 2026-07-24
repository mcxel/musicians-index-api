import { NextRequest, NextResponse } from "next/server";
import { generateHostLine, type HostLineContext } from "@/lib/hosts/HostIntelligenceEngine";
import { getPA, type PAScriptKey } from "@/lib/hosts/hostEngine";
import { getHostById } from "@/lib/hosts/HostIdentityRegistry";

const VALID_MOMENTS: PAScriptKey[] = [
  "room-open", "countdown", "call-up", "sponsor-read",
  "prize-alert", "winner-announce", "safety", "room-close",
];

/**
 * POST /api/hosts/[hostId]/announce
 * Generates one real, in-character line for a host at a given show moment.
 * Real LLM output when the host has a personaPrompt (HostIntelligenceEngine);
 * honestly falls back to the existing static hostEngine.getPA() script when
 * it doesn't, or if the LLM call fails - never a fabricated "AI" label on a
 * line that's actually the static template.
 */
export async function POST(req: NextRequest, { params }: { params: { hostId: string } }) {
  try {
    const host = getHostById(params.hostId);
    if (!host) {
      return NextResponse.json({ error: "Unknown hostId" }, { status: 404 });
    }

    const body = await req.json();
    const moment = body?.moment as PAScriptKey;
    if (!VALID_MOMENTS.includes(moment)) {
      return NextResponse.json({ error: `moment must be one of: ${VALID_MOMENTS.join(", ")}` }, { status: 400 });
    }

    const context: HostLineContext = {
      moment,
      showTitle: body?.showTitle ?? host.name,
      viewerCount: typeof body?.viewerCount === "number" ? body.viewerCount : 0,
      sponsorName: body?.sponsorName,
      winnerName: body?.winnerName,
    };

    const aiLine = await generateHostLine(params.hostId, context);
    if (aiLine) {
      return NextResponse.json({ success: true, line: aiLine, source: "ai" });
    }

    const fallbackLine = getPA(moment, {
      performer: body?.winnerName ?? "the next performer",
      sponsor: body?.sponsorName ?? "our sponsors",
      winner: body?.winnerName ?? "the winner",
      prizeDesc: "a real prize",
    });
    return NextResponse.json({ success: true, line: `[${host.name.toUpperCase()}] ${fallbackLine}`, source: "static" });
  } catch (error) {
    console.error("Failed to generate host announcement:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
