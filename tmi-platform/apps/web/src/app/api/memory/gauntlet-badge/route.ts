/**
 * POST /api/memory/gauntlet-badge — durable Gauntlet survivor/champion badge capture.
 * Server-only MemoryWallEngine path; clients must not import that engine.
 */
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { MemoryWallEngine } from "@/lib/memory/MemoryWallEngine";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";

export async function POST(req: Request) {
  try {
    const auth = await getTmiAuth();
    if (!auth?.user?.id) {
      return NextResponse.json({ ok: false, reason: "unauthenticated" }, { status: 401 });
    }

    const body = (await req.json()) as {
      userId?: string;
      roomId?: string;
      runId?: string;
      kind?: string;
      title?: string;
    };

    const userId = auth.user.id;
    if (body.userId && body.userId !== userId) {
      return NextResponse.json({ ok: false, reason: "user-mismatch" }, { status: 403 });
    }
    if (!body.runId || !body.title) {
      return NextResponse.json({ ok: false, reason: "missing-fields" }, { status: 400 });
    }

    const artifact = await MemoryWallEngine.captureLiveMoment(
      userId,
      body.runId,
      "/images/tmi-placeholder.jpg",
      body.title,
    );

    return NextResponse.json({ ok: true, artifactId: artifact.id });
  } catch (err) {
    console.error("[gauntlet-badge]", err);
    return NextResponse.json({ ok: false, reason: "server-error" }, { status: 500 });
  }
}
