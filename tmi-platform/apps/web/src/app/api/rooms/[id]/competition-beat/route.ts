import { NextRequest, NextResponse } from "next/server";
import {
  attachCompetitionBeat,
  confirmBeatSwap,
  getCompetitionBeatRoom,
  initCompetitionBeatRoom,
  listCompetitionRegistryBeats,
  openBeatVetoWindow,
  recordBeatRefusePenalty,
  requestBeatSwap,
  setCompetitionBeatStyle,
  type CompetitionBeatLane,
  type CompetitionBeatStyle,
  type AttachedBeatRef,
} from "@/lib/competition/CompetitionBeatRoomEngine";
import { claimBeatSlot, isBeatExclusivelySold } from "@/lib/beats/BeatInventoryEngine";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** Hydrate in-memory exclusive flag from durable BeatLicense / tags (Rule 19). */
async function exclusiveSoldDurable(beatId: string): Promise<boolean> {
  if (isBeatExclusivelySold(beatId)) return true;
  try {
    const beat = await prisma.beat.findUnique({
      where: { id: beatId },
      select: { tags: true, licenses: { where: { type: { in: ["exclusive", "EXCLUSIVE"] } }, take: 1 } },
    });
    if (!beat) return false;
    if (beat.tags?.includes("exclusively-sold") || beat.licenses.length > 0) {
      claimBeatSlot(beatId, "db-exclusive", "exclusive");
      return true;
    }
  } catch {
    /* DB unavailable — fall through to memory */
  }
  return false;
}

const LANES = new Set<CompetitionBeatLane>(["battle", "gauntlet", "cypher"]);

function parseLane(v: unknown): CompetitionBeatLane {
  return LANES.has(v as CompetitionBeatLane) ? (v as CompetitionBeatLane) : "battle";
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const roomId = params.id;
  const lane = parseLane(req.nextUrl.searchParams.get("lane"));
  let state = getCompetitionBeatRoom(roomId);
  if (!state) {
    state = initCompetitionBeatRoom({ roomId, lane });
  }
  const registry = listCompetitionRegistryBeats(state.lane);
  return NextResponse.json({
    ok: true,
    state,
    registryBeats: registry.map((b) => ({
      beatId: b.id,
      title: b.title,
      genre: b.genre,
      bpm: b.bpm,
      audioUrl: b.audioUrl,
      producerName: b.ownerId,
      source: "competition-registry" as const,
      exclusiveBlocked: isBeatExclusivelySold(b.id),
    })),
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const roomId = params.id;
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    /* empty */
  }

  const action = typeof body.action === "string" ? body.action : "";
  const lane = parseLane(body.lane);

  if (action === "init") {
    const state = initCompetitionBeatRoom({
      roomId,
      lane,
      allowedStyles: Array.isArray(body.allowedStyles)
        ? (body.allowedStyles as CompetitionBeatStyle[])
        : undefined,
      performerIds: Array.isArray(body.performerIds)
        ? (body.performerIds as string[]).filter((x) => typeof x === "string")
        : undefined,
      vetoWindowMs: typeof body.vetoWindowMs === "number" ? body.vetoWindowMs : undefined,
      maxSwaps: typeof body.maxSwaps === "number" ? body.maxSwaps : undefined,
    });
    return NextResponse.json({ ok: true, state });
  }

  if (action === "set-style") {
    const style = body.style as CompetitionBeatStyle;
    const result = setCompetitionBeatStyle(roomId, style, lane);
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  }

  if (action === "attach") {
    const beat = body.beat as AttachedBeatRef | undefined;
    if (!beat || typeof beat !== "object") {
      return NextResponse.json({ ok: false, error: "beat required" }, { status: 400 });
    }
    const beatId = String(beat.beatId ?? "");
    if (beatId && (await exclusiveSoldDurable(beatId))) {
      return NextResponse.json(
        { ok: false, error: "Beat sold exclusively — removed from competition vault." },
        { status: 409 },
      );
    }
    const result = attachCompetitionBeat({
      roomId,
      lane,
      beat: {
        beatId,
        title: String(beat.title ?? ""),
        genre: beat.genre ? String(beat.genre) : undefined,
        bpm: typeof beat.bpm === "number" ? beat.bpm : undefined,
        audioUrl: beat.audioUrl ? String(beat.audioUrl) : null,
        producerName: beat.producerName ? String(beat.producerName) : null,
        source: beat.source === "competition-registry" ? "competition-registry" : "beat-locker",
      },
    });
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  }

  if (action === "open-veto") {
    const state = openBeatVetoWindow(roomId, lane);
    return NextResponse.json({ ok: true, state });
  }

  if (action === "request-swap") {
    const performerId = typeof body.performerId === "string" ? body.performerId : "";
    if (!performerId) {
      return NextResponse.json({ ok: false, error: "performerId required" }, { status: 400 });
    }
    const result = requestBeatSwap({ roomId, performerId, lane });
    if (result.ok && result.bothAgreed) {
      const confirmed = confirmBeatSwap(roomId, lane);
      return NextResponse.json({
        ok: confirmed.ok,
        bothAgreed: true,
        swapped: confirmed.ok,
        error: confirmed.error,
        state: confirmed.state ?? result.state,
      });
    }
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  }

  if (action === "confirm-swap") {
    const result = confirmBeatSwap(roomId, lane);
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  }

  if (action === "refuse") {
    const performerId = typeof body.performerId === "string" ? body.performerId : "";
    if (!performerId) {
      return NextResponse.json({ ok: false, error: "performerId required" }, { status: 400 });
    }
    const result = recordBeatRefusePenalty({
      roomId,
      performerId,
      lane,
      reason: body.reason === "no_rap" ? "no_rap" : "refuse_perform",
    });
    return NextResponse.json(result);
  }

  return NextResponse.json({ ok: false, error: "Unknown action" }, { status: 400 });
}
