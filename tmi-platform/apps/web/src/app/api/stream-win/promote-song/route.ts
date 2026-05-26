import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { ok: false, reason: "stripe_paused", notice: "/season-pass?notice=stripe-paused" },
    { status: 503 }
  );
}
