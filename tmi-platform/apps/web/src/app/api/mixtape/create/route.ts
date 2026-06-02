export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { MixtapeShareEngine } from "@/lib/mixtape/MixtapeShareEngine";
import type { CreateMixtapeRequest } from "@/lib/mixtape/MixtapeShareEngine";

// POST /api/mixtape/create
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as CreateMixtapeRequest;
    if (!body.curatorId || !body.title?.trim() || !body.tracks?.length) {
      return NextResponse.json({ ok: false, error: "curatorId, title, and tracks are required" }, { status: 400 });
    }
    const mixtape = MixtapeShareEngine.create(body);
    return NextResponse.json({ ok: true, id: mixtape.id, shareUrl: mixtape.shareUrl }, { status: 201 });
  } catch (err) {
    console.error("[mixtape/create]", err);
    return NextResponse.json({ ok: false, error: "Internal error" }, { status: 500 });
  }
}
