import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      error: "feature_not_available",
      reason: "stripe_paused",
      notice: "/season-pass?notice=stripe-paused",
    },
    { status: 501 }
  );
}
