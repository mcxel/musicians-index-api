// api/admin/diamond/distribute/route.ts — Admin endpoint to assign Diamond tier

import { NextRequest, NextResponse } from "next/server";
import { distributeToList, assignDiamond, getDiamondLedger } from "@/lib/diamond/DiamondDistributionService";

export const runtime = "nodejs";

function authCheck(req: NextRequest): boolean {
  return req.headers.get("authorization") === `Bearer ${process.env.ADMIN_API_SECRET}`;
}

// GET — list current Diamond ledger
export async function GET(req: NextRequest) {
  if (!authCheck(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ ledger: getDiamondLedger() });
}

// POST — assign Diamond to one or many users
export async function POST(req: NextRequest) {
  if (!authCheck(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({})) as Record<string, unknown>;

  // Single assignment
  if (body.userId && body.email) {
    const record = await assignDiamond({
      userId: body.userId as string,
      email: body.email as string,
      displayName: body.displayName as string | undefined,
      reason: (body.reason as string | undefined) ?? "admin_grant",
    });
    return NextResponse.json({ ok: true, record }, { status: 201 });
  }

  // Batch assignment
  if (Array.isArray(body.targets) && body.targets.length > 0) {
    const result = await distributeToList(body.targets as Array<{
      userId: string;
      email: string;
      displayName?: string;
      reason: string;
    }>);
    return NextResponse.json({ ok: true, ...result }, { status: 201 });
  }

  return NextResponse.json(
    { error: "Provide userId+email for single or targets[] for batch" },
    { status: 400 }
  );
}
