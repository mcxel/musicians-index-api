export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { getActiveSessions, getSessionsByCategory } from "@/lib/broadcast/GlobalLiveSessionRegistry";

type FeedSnapshot = {
  source: string;
  status: "LIVE" | "IDLE" | "RECORDING" | "RECONNECTING";
  viewers: number;
  updatedAt: string;
  items: Array<{ id: string; label: string; meta: string; ts: string }>;
};

const NOW = () => new Date().toISOString();

function snapshot(source: string): FeedSnapshot {
  const t = NOW();

  switch (source) {
    case "Cypher Live": {
      const sessions = getSessionsByCategory("cypher");
      return {
        source, status: sessions.length > 0 ? "LIVE" : "IDLE",
        viewers: sessions.reduce((sum, s) => sum + s.viewerCount, 0),
        updatedAt: t,
        items: sessions.length > 0
          ? sessions.slice(0, 3).map((s) => ({
              id: s.roomId,
              label: s.title,
              meta: `LIVE · ${s.viewerCount} viewers`,
              ts: "0s",
            }))
          : [{ id: "empty", label: "No active cypher rooms", meta: "Start one via Go Live", ts: "0s" }],
      };
    }

    case "Battle Ring": {
      const sessions = getSessionsByCategory("battle");
      return {
        source, status: sessions.length > 0 ? "LIVE" : "IDLE",
        viewers: sessions.reduce((sum, s) => sum + s.viewerCount, 0),
        updatedAt: t,
        items: sessions.length > 0
          ? sessions.slice(0, 3).map((s) => ({
              id: s.roomId,
              label: s.title,
              meta: `LIVE · ${s.viewerCount} viewers`,
              ts: "0s",
            }))
          : [{ id: "empty", label: "No active battle rooms", meta: "Start one via Go Live", ts: "0s" }],
      };
    }

    case "Venue Cam": {
      const sessions = getActiveSessions().filter(s => s.stageState === "live");
      return {
        source, status: sessions.length > 0 ? "RECORDING" : "IDLE",
        viewers: sessions.reduce((sum, s) => sum + s.viewerCount, 0),
        updatedAt: t,
        items: sessions.length > 0
          ? sessions.slice(0, 2).map((s) => ({
              id: s.roomId,
              label: s.title,
              meta: `LIVE · ${s.viewerCount} viewers`,
              ts: "0s",
            }))
          : [{ id: "empty", label: "No venue cameras active", meta: "No active streams", ts: "0s" }],
      };
    }

    case "Ticket Feed":
      return {
        source, status: "LIVE", viewers: 0, updatedAt: t,
        items: [{ id: "empty", label: "No recent ticket activity", meta: "Scans and issues appear here in real time", ts: "0s" }],
      };

    case "Booking Feed":
      return {
        source, status: "LIVE", viewers: 0, updatedAt: t,
        items: [{ id: "empty", label: "No recent booking activity", meta: "New bookings appear here in real time", ts: "0s" }],
      };

    case "Security Feed":
      return {
        source, status: "LIVE", viewers: 0, updatedAt: t,
        items: [{ id: "empty", label: "No security events", meta: "Alerts appear here when triggered", ts: "0s" }],
      };

    case "Boardroom Live": {
      const sessions = getActiveSessions();
      return {
        source, status: sessions.length > 0 ? "LIVE" : "IDLE",
        viewers: sessions.length,
        updatedAt: t,
        items: sessions.length > 0
          ? [{ id: "active", label: `${sessions.length} active live session${sessions.length > 1 ? "s" : ""}`, meta: "LIVE", ts: "0s" }]
          : [{ id: "empty", label: "No active sessions", meta: "Platform is quiet", ts: "0s" }],
      };
    }

    case "Sponsor Feed":
      return {
        source, status: "IDLE", viewers: 0, updatedAt: t,
        items: [{ id: "empty", label: "No active sponsor activity", meta: "Sponsor events appear here", ts: "0s" }],
      };

    case "Games Feed": {
      const sessions = getSessionsByCategory("game");
      return {
        source, status: sessions.length > 0 ? "LIVE" : "IDLE",
        viewers: sessions.reduce((sum, s) => sum + s.viewerCount, 0),
        updatedAt: t,
        items: sessions.length > 0
          ? sessions.slice(0, 3).map((s) => ({
              id: s.roomId,
              label: s.title,
              meta: `LIVE · ${s.viewerCount} viewers`,
              ts: "0s",
            }))
          : [{ id: "empty", label: "No active game rooms", meta: "Game shows appear here when live", ts: "0s" }],
      };
    }

    default:
      return { source, status: "IDLE", viewers: 0, updatedAt: t, items: [] };
  }
}

export function GET(req: NextRequest) {
  const source = req.nextUrl.searchParams.get("source") ?? "Cypher Live";
  return NextResponse.json(snapshot(source));
}
