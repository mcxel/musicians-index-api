import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { PersonaAnalyticsEvent } from "@/lib/analytics/PersonaAnalyticsEngine";

const INGEST_LOG: PersonaAnalyticsEvent[] = [];
const MAX_LOG = 2000;

export async function POST(req: NextRequest) {
  const sessionId = req.cookies.get("tmi_session_id")?.value;
  if (!sessionId) {
    return NextResponse.json({ received: false }, { status: 200 });
  }

  let body: { events?: Partial<PersonaAnalyticsEvent>[] } & Partial<PersonaAnalyticsEvent>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // TelemetryTransportGovernor sends a batch ({ events: [...] }); older/direct
  // callers send a single flat event. Accept both.
  const candidates = Array.isArray(body.events) ? body.events : [body];

  const accepted: string[] = [];
  for (const candidate of candidates) {
    const { eventId, eventName, domain, ts } = candidate;
    if (!eventId || !eventName || !domain || !ts) continue;
    if (INGEST_LOG.length >= MAX_LOG) INGEST_LOG.splice(0, INGEST_LOG.length - MAX_LOG + 1);
    INGEST_LOG.push(candidate as PersonaAnalyticsEvent);
    accepted.push(eventId);
  }

  if (accepted.length === 0) {
    return NextResponse.json({ error: "Missing required fields: eventId, eventName, domain, ts" }, { status: 400 });
  }

  return NextResponse.json({ received: true, eventIds: accepted });
}
