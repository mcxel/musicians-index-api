import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Not a closure authority. Account closure is POST /api/auth/deactivate. */
export async function POST() {
  return NextResponse.json(
    { ok: false, error: "Account closure is not handled on this route." },
    { status: 410 },
  );
}
