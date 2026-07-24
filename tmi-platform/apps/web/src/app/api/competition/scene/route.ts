import { NextRequest, NextResponse } from "next/server";
import { sceneRuntime } from "@/lib/competition/SceneRuntime";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/competition/scene?roomId=xyz
 * Fetches the resolved scene presentation state mapped to the active LobbyEvent.
 */
export async function GET(req: NextRequest) {
  try {
    const roomId = req.nextUrl.searchParams.get("roomId");
    if (!roomId) {
      return NextResponse.json({ error: "roomId is required" }, { status: 400 });
    }

    // 1. Fetch current database event
    const event = await prisma.lobbyEvent.findUnique({
      where: { roomId },
    });

    // 2. Resolve default environmental scene if no event is active
    if (!event) {
      const defaultState = sceneRuntime.resolveSceneForEvent(
        roomId,
        "idle",
        "solo-1v1",
        "TMI Social Lounge"
      );
      return NextResponse.json({ success: true, scene: defaultState });
    }

    // 3. Resolve show scene based on current live status
    const sceneState = sceneRuntime.resolveSceneForEvent(
      roomId,
      event.status,
      event.format,
      event.title
    );

    // Sync remaining time
    sceneState.remainingSeconds = event.countdownSeconds;

    return NextResponse.json({ success: true, scene: sceneState });
  } catch (error) {
    console.error("Failed to GET active scene state:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/competition/scene
 * Allows manual scene overrides or cutscene triggers.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { roomId, action, cutsceneName, status, format, title } = body;

    if (!roomId) {
      return NextResponse.json({ error: "roomId is required" }, { status: 400 });
    }

    let sceneState = sceneRuntime.resolveSceneForEvent(
      roomId,
      status ?? "idle",
      format ?? "solo-1v1",
      title ?? "TMI Event"
    );

    if (action === "cutscene" && (cutsceneName === "sponsor" || cutsceneName === "trophy")) {
      sceneState = sceneRuntime.triggerCutscene(sceneState, cutsceneName);
    }

    return NextResponse.json({ success: true, scene: sceneState });
  } catch (error) {
    console.error("Failed to POST scene override:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
