export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";
import {
  savePerformance,
  listSavedPerformances,
  getAnnualSaveCount,
} from "@/lib/savedPerformances/SavedPerformanceService";
import { SAVED_PERFORMANCE_POLICY } from "@/lib/savedPerformances/SavedPerformancePolicy";
import { Role } from "@prisma/client";

/** GET /api/saved-performances — list the caller's saved performances */
export async function GET() {
  const auth = await getTmiAuth();
  if (!auth?.user?.id) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const [records, annualCount] = await Promise.all([
    listSavedPerformances(auth.user.id),
    getAnnualSaveCount(auth.user.id),
  ]);

  return NextResponse.json({
    ok: true,
    records,
    annualCount,
    annualLimit: SAVED_PERFORMANCE_POLICY.ANNUAL_LIMIT,
  });
}

/** POST /api/saved-performances — save a completed live performance */
export async function POST(req: NextRequest) {
  const auth = await getTmiAuth();
  if (!auth?.user?.id) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    liveSessionId?: string;
    role?: string;
    title?: string;
    durationSeconds?: number;
    storageBytes?: string;
    storageProviderKey?: string;
    derivedAssetKeys?: string[];
    transcodingCostCents?: number;
  };

  if (!body.liveSessionId || !body.title || body.durationSeconds == null) {
    return NextResponse.json(
      { ok: false, error: "liveSessionId, title, and durationSeconds are required" },
      { status: 400 },
    );
  }

  const role = (body.role as Role | undefined) ?? Role.FAN;

  const result = await savePerformance({
    ownerId: auth.user.id,
    liveSessionId: body.liveSessionId,
    role,
    title: body.title,
    durationSeconds: body.durationSeconds,
    storageBytes: body.storageBytes != null ? BigInt(body.storageBytes) : undefined,
    storageProviderKey: body.storageProviderKey,
    derivedAssetKeys: body.derivedAssetKeys,
    transcodingCostCents: body.transcodingCostCents,
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, errorCode: result.errorCode }, { status: 422 });
  }

  return NextResponse.json(
    {
      ok: true,
      recordingId: result.recordingId,
      // Notify caller if the archive was capped at max duration
      durationCapped: result.errorCode != null,
    },
    { status: 201 },
  );
}
