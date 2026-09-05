export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  getLibrary,
  createSave,
  checkAnnualLimit,
} from "@/lib/recordings/SavedPerformanceService";
import { ERROR_CODES } from "@/lib/recordings/SavedPerformancePolicy";
import type { Role } from "@prisma/client";

/** Resolve userId from session cookies — same pattern as /api/writer/stats */
async function resolveUserId(req: NextRequest): Promise<string | null> {
  const email = req.cookies.get("tmi_user_email")?.value;
  if (!email) return null;
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  return user?.id ?? null;
}

/**
 * GET /api/recordings
 * Returns the authenticated user's saved performance library.
 */
export async function GET(req: NextRequest) {
  const userId = await resolveUserId(req);
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
  }

  try {
    const records = await getLibrary(userId);
    const { count, remaining } = await checkAnnualLimit(userId);
    return NextResponse.json({
      ok: true,
      records,
      quota: { used: count, remaining, limit: 10 },
    });
  } catch (err) {
    console.error("[recordings:GET]", err);
    return NextResponse.json({ ok: false, error: "Internal error" }, { status: 500 });
  }
}

/**
 * POST /api/recordings
 * Save a new performance recording.
 * Body: { liveSessionId?, role, title, durationSeconds, storageProviderKey, storageBytes? }
 */
export async function POST(req: NextRequest) {
  const userId = await resolveUserId(req);
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const { liveSessionId, role, title, durationSeconds, storageProviderKey, storageBytes } = body;

  if (!role || !title || typeof durationSeconds !== "number" || !storageProviderKey) {
    return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 });
  }

  try {
    const result = await createSave({
      userId,
      liveSessionId: typeof liveSessionId === "string" ? liveSessionId : null,
      role: role as Role,
      title: String(title),
      durationSeconds: Number(durationSeconds),
      storageProviderKey: String(storageProviderKey),
      storageBytes: storageBytes != null ? BigInt(String(storageBytes)) : undefined,
    });

    if (!result.ok) {
      const status = result.error === ERROR_CODES.ANNUAL_LIMIT_REACHED ? 429 : 400;
      return NextResponse.json({ ok: false, error: result.error }, { status });
    }

    return NextResponse.json({ ok: true, record: result.record }, { status: 201 });
  } catch (err) {
    console.error("[recordings:POST]", err);
    return NextResponse.json({ ok: false, error: "Internal error" }, { status: 500 });
  }
}
