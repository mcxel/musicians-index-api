export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";

// Feed snapshot endpoint — returns seed-backed live snapshot per source.
// Architecture note: this is the real HTTP seam. When backend live feeds are
// ready, replace the seed data with proxyToApi calls without changing consumers.

const NOW = () => new Date().toISOString();

type FeedSnapshot = {
  source: string;
  status: "LIVE" | "IDLE" | "RECORDING" | "RECONNECTING";
  viewers: number;
  updatedAt: string;
  items: Array<{ id: string; label: string; meta: string; ts: string }>;
};

function snapshot(source: string): FeedSnapshot {
  const t = NOW();
  switch (source) {
    case "Cypher Live":
      return { source, status: "LIVE", viewers: 1840 + Math.floor(Math.random() * 60), updatedAt: t,
        items: [
          { id: "c1", label: "Crown Qualifier R4 — KOVA vs Blaze Cartel", meta: "LIVE · hype 94%", ts: "0s" },
          { id: "c2", label: "Genre Wars: Drill vs Trap", meta: "Upcoming +45m", ts: "2m" },
          { id: "c3", label: "Rising Star Showcase", meta: "Upcoming +2h", ts: "5m" },
        ]};
    case "Battle Ring":
      return { source, status: "LIVE", viewers: 2104 + Math.floor(Math.random() * 80), updatedAt: t,
        items: [
          { id: "b1", label: "KOVA vs Nera Vex — Round 2", meta: "LIVE · 2:14", ts: "0s" },
          { id: "b2", label: "Blaze Cartel vs Mack Ferro", meta: "Queue #1", ts: "8m" },
        ]};
    case "Venue Cam":
      return { source, status: "RECORDING", viewers: 512 + Math.floor(Math.random() * 30), updatedAt: t,
        items: [
          { id: "v1", label: "Crown Stage — Load-in", meta: "Saturday 8pm", ts: "0s" },
          { id: "v2", label: "Electric Blue Club — Sound check", meta: "Friday 10pm", ts: "3m" },
        ]};
    case "Ticket Feed":
      return { source, status: "LIVE", viewers: 0, updatedAt: t,
        items: [
          { id: "t1", label: "Ticket #TKT-8821 — Scanned · Crown Stage", meta: "ADMIT · 0s ago", ts: "0s" },
          { id: "t2", label: "Ticket #TKT-4412 — Issued · TMI Monthly Idol", meta: "ISSUED · 2m ago", ts: "2m" },
          { id: "t3", label: "Ticket #TKT-9903 — Fraud flag · World Dance Party", meta: "FLAG · 5m ago", ts: "5m" },
          { id: "t4", label: "Ticket #TKT-1144 — Transfer initiated", meta: "TRANSFER · 9m ago", ts: "9m" },
        ]};
    case "Booking Feed":
      return { source, status: "LIVE", viewers: 0, updatedAt: t,
        items: [
          { id: "bk1", label: "Crown Stage — Saturday 8pm · 3 new bookings", meta: "CONFIRMED", ts: "1m" },
          { id: "bk2", label: "KOVA — set time adjustment request", meta: "PENDING REVIEW", ts: "4m" },
          { id: "bk3", label: "Electric Blue Club — VIP section sold out", meta: "SOLD OUT", ts: "7m" },
          { id: "bk4", label: "Studio Arena — Deal or Feud S3 offer sent", meta: "OFFER OUT", ts: "14m" },
        ]};
    case "Security Feed":
      return { source, status: "LIVE", viewers: 0, updatedAt: t,
        items: [
          { id: "s1", label: "Multi-account ticket fraud — u-4421", meta: "CRITICAL", ts: "2m" },
          { id: "s2", label: "Rapid login pattern — u-7712 · 14 attempts", meta: "HIGH", ts: "5m" },
          { id: "s3", label: "Rate limit bypass /api/vote", meta: "HIGH", ts: "8m" },
          { id: "s4", label: "Chat flood bot — Cypher Room 3", meta: "MEDIUM", ts: "12m" },
        ]};
    case "Boardroom Live":
      return { source, status: "LIVE", viewers: 342, updatedAt: t,
        items: [
          { id: "br1", label: "Weekly director sync — in progress", meta: "LIVE · 18m elapsed", ts: "0s" },
        ]};
    case "Sponsor Feed":
      return { source, status: "IDLE", viewers: 0, updatedAt: t,
        items: [
          { id: "sp1", label: "SoundBridge Pro — banner impression cap reached", meta: "ROTATED", ts: "4m" },
          { id: "sp2", label: "VoxStream — slot 2 live", meta: "ACTIVE", ts: "11m" },
        ]};
    case "Games Feed":
      return { source, status: "LIVE", viewers: 990 + Math.floor(Math.random() * 40), updatedAt: t,
        items: [
          { id: "g1", label: "Dirty Dozens — Round 4 live", meta: "LIVE · 847 viewers", ts: "0s" },
          { id: "g2", label: "Cypher Arena — Crown Qualifier in progress", meta: "LIVE · 1.2k viewers", ts: "0s" },
          { id: "g3", label: "Dance-Off queue — 12 entrants waiting", meta: "QUEUE", ts: "3m" },
        ]};
    default:
      return { source, status: "IDLE", viewers: 0, updatedAt: t, items: [] };
  }
}

export function GET(req: NextRequest) {
  const source = req.nextUrl.searchParams.get("source") ?? "Cypher Live";
  return NextResponse.json(snapshot(source));
}
