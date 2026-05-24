import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { PersonaAnalyticsEvent } from "@/lib/analytics/PersonaAnalyticsEngine";

const INGEST_LOG: PersonaAnalyticsEvent[] = [];
const MAX_LOG = 2000;

export async function POST(req: NextRequest) {
  const sessionId = req.cookies.get("tmi_session_id")?.value;
  if (!sessionId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: Partial<PersonaAnalyticsEvent>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { eventId, eventName, domain, ts } = body;
  if (!eventId || !eventName || !domain || !ts) {
    return NextResponse.json({ error: "Missing required fields: eventId, eventName, domain, ts" }, { status: 400 });
  }

  const event = body as PersonaAnalyticsEvent;
  if (INGEST_LOG.length >= MAX_LOG) INGEST_LOG.splice(0, INGEST_LOG.length - MAX_LOG + 1);
  INGEST_LOG.push(event);

  return NextResponse.json({ received: true, eventId });
}
