import { NextRequest, NextResponse } from "next/server";
import {
  getRecentEvents,
  getEventsByCategory,
  getSummary,
  type StripeEventCategory,
} from "@/lib/stripe/stripe-telemetry-store";

const VALID_CATEGORIES = new Set<StripeEventCategory>([
  "replay", "duplicate", "malformed", "verification",
  "upstream", "timeout", "success", "other",
]);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? Math.min(parseInt(limitParam, 10) || 100, 500) : 100;

  if (category) {
    if (!VALID_CATEGORIES.has(category as StripeEventCategory)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }
    const events = getEventsByCategory(category as StripeEventCategory, limit);
    return NextResponse.json({ events, summary: getSummary() });
  }

  const events = getRecentEvents(limit);
  return NextResponse.json({ events, summary: getSummary() });
}
