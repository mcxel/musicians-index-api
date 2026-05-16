import { NextResponse } from "next/server";
import { runMcMichaelCharlieProfitabilityAnalysis } from "@/lib/booking/bookingMonetizationEngine";

export async function GET() {
  return NextResponse.json({ ok: true, analysis: runMcMichaelCharlieProfitabilityAnalysis() });
}
