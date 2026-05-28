import { NextRequest, NextResponse } from "next/server";
import {
  startHeartbeat,
  stopHeartbeat,
  pauseHeartbeat,
  resumeHeartbeat,
  triggerManualDrop,
  triggerVibeChange,
  triggerCrowdSurge,
  getHeartbeatStats,
  type HeartbeatStatus,
} from "@/lib/engines/runtime/GlobalEventSyncHeartbeat";
import type { VibePreset } from "@/lib/engines/runtime/WorldStateReplicator";

export const runtime = "nodejs";

export function GET(): NextResponse {
  return NextResponse.json(getHeartbeatStats());
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: { action?: string; vibe?: VibePreset; energy?: number; payload?: Record<string, unknown> };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { action } = body;

  switch (action) {
    case "start":
      startHeartbeat();
      break;
    case "stop":
      stopHeartbeat();
      break;
    case "pause":
      pauseHeartbeat();
      break;
    case "resume":
      resumeHeartbeat();
      break;
    case "drop":
      triggerManualDrop(body.payload ?? {});
      break;
    case "vibe-change":
      if (!body.vibe) return NextResponse.json({ error: "vibe required" }, { status: 400 });
      triggerVibeChange(body.vibe);
      break;
    case "crowd-surge":
      triggerCrowdSurge(body.energy ?? 1.0);
      break;
    default:
      return NextResponse.json({ error: `Unknown action: ${String(action)}` }, { status: 400 });
  }

  return NextResponse.json(getHeartbeatStats());
}
