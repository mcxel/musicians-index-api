export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/_utils/require-admin";
import { getActiveSessionsDurable } from "@/lib/broadcast/GlobalLiveSessionRegistry.server";

type FeedSnapshot = {
  source: string;
  status: "LIVE" | "IDLE" | "RECORDING" | "RECONNECTING";
  viewers: number;
  updatedAt: string;
  items: Array<{ id: string; label: string; meta: string; ts: string }>;
};

async function snapshot(source: string): Promise<FeedSnapshot> {
  const t = new Date().toISOString();
  const sessions = await getActiveSessionsDurable().catch(() => []);
  const viewers = sessions.reduce((sum, s) => sum + (typeof s.viewerCount === "number" ? s.viewerCount : 0), 0);
  const liveItems = sessions.slice(0, 8).map((s) => ({
    id: s.userId || s.roomId,
    label: s.title || s.displayName || s.roomId || "Live session",
    meta: "LIVE",
    ts: new Date(s.startedAt).toISOString(),
  }));

  switch (source) {
    case "Cypher Live":
    case "Battle Ring":
    case "Venue Cam":
    case "Concert Feed":
    case "Games Feed":
      return {
        source,
        status: sessions.length > 0 ? "LIVE" : "IDLE",
        viewers,
        updatedAt: t,
        items: liveItems,
      };
    case "Security Feed":
      // Rule 20: no fabricated threats — empty until real security telemetry is wired
      return { source, status: "IDLE", viewers: 0, updatedAt: t, items: [] };
    case "Sponsor Feed":
    case "Ticket Feed":
    case "Booking Feed":
      return { source, status: "IDLE", viewers: 0, updatedAt: t, items: [] };
    default:
      return { source, status: "IDLE", viewers: 0, updatedAt: t, items: [] };
  }
}

export async function GET(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  const source = req.nextUrl.searchParams.get("source") ?? "Cypher Live";
  return NextResponse.json(await snapshot(source));
}