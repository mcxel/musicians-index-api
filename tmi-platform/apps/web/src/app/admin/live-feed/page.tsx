import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Live Feed | TMI Admin" };

const FEED_EVENTS = [
  { id: "f1", type: "ROOM_JOIN",    user: "fan_xyz_421",  detail: "Joined Monday Cypher",          time: "12s ago",  color: "#00FF88" },
  { id: "f2", type: "TIP",          user: "Wavetek_Fan1", detail: "Tipped Wavetek $15 in Live Room",time: "34s ago",  color: "#FFD700" },
  { id: "f3", type: "BATTLE_VOTE",  user: "krypt_rider99",detail: "Voted Krypt in Battle b1",       time: "1m ago",   color: "#FF2DAA" },
  { id: "f4", type: "ROOM_LEAVE",   user: "lurker_9022",  detail: "Left Dirty Dozens Session",      time: "1m ago",   color: "#AA2DFF" },
  { id: "f5", type: "ARTICLE_VIEW", user: "zuribloom_fan",detail: "Read: Wavetek Rise Billboard",   time: "2m ago",   color: "#00FFFF" },
  { id: "f6", type: "PURCHASE",     user: "newuser_1842", detail: "Purchased Flame Emote Pack",     time: "2m ago",   color: "#FF9500" },
  { id: "f7", type: "SIGNUP",       user: "newuser_1843", detail: "New user signed up (FAN role)",  time: "3m ago",   color: "#00FF88" },
  { id: "f8", type: "BOT_ACTION",   user: "TMI_Bot_12",   detail: "Moderated chat in Cypher Room",  time: "4m ago",   color: "#AA2DFF" },
  { id: "f9", type: "ROOM_JOIN",    user: "producer_88",  detail: "Joined Producer Roundtable",     time: "4m ago",   color: "#00FF88" },
  { id: "f10",type: "TIP",          user: "mega_fan_007", detail: "Tipped Zuri Bloom $50",          time: "5m ago",   color: "#FFD700" },
];

const TYPE_COLOR: Record<string, string> = {
  ROOM_JOIN: "#00FF88", TIP: "#FFD700", BATTLE_VOTE: "#FF2DAA",
  ROOM_LEAVE: "#AA2DFF", ARTICLE_VIEW: "#00FFFF", PURCHASE: "#FF9500",
  SIGNUP: "#00FF88", BOT_ACTION: "#AA2DFF",
};

export default function AdminLiveFeedPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px" }}>
        <Link href="/admin" style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>← ADMIN</Link>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20, marginBottom: 4 }}>
          <h1 style={{ fontSize: 24, fontWeight: 900 }}>Live Feed</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#00FF88", display: "inline-block", boxShadow: "0 0 8px #00FF88" }} />
            <span style={{ fontSize: 10, color: "#00FF88", fontWeight: 700 }}>STREAMING</span>
          </div>
        </div>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 32 }}>Real-time event stream — rooms, tips, purchases, votes, articles, and bot activity.</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(120px,1fr))", gap: 10, marginBottom: 32 }}>
          {[
            { label: "Events/min", value: "42",    color: "#00FFFF" },
            { label: "Live Users", value: "8,240",  color: "#00FF88" },
            { label: "Tips Today", value: "$1,240", color: "#FFD700" },
            { label: "New Signups",value: "18",     color: "#FF2DAA" },
          ].map(stat => (
            <div key={stat.label} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${stat.color}18`, borderRadius: 10, padding: "14px 14px" }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: stat.color, marginBottom: 4 }}>{stat.value}</div>
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", fontWeight: 700 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", fontWeight: 700, marginBottom: 14 }}>RECENT EVENTS</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {FEED_EVENTS.map(event => (
            <div key={event.id} style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 16px", background: "rgba(255,255,255,0.015)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.04)", flexWrap: "wrap" }}>
              <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.1em", color: TYPE_COLOR[event.type] ?? "#fff", flexShrink: 0, minWidth: 80 }}>
                {event.type}
              </span>
              <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", flexShrink: 0 }}>{event.user}</span>
              <span style={{ flex: 1, fontSize: 11, color: "rgba(255,255,255,0.7)" }}>{event.detail}</span>
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", flexShrink: 0 }}>{event.time}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
          <Link href="/admin/live" style={{ padding: "8px 16px", fontSize: 9, fontWeight: 800, color: "#00FF88", border: "1px solid rgba(0,255,136,0.3)", borderRadius: 6, textDecoration: "none" }}>
            ROOM MONITOR
          </Link>
          <Link href="/admin/observatory" style={{ padding: "8px 16px", fontSize: 9, fontWeight: 800, color: "#00FFFF", border: "1px solid rgba(0,255,255,0.2)", borderRadius: 6, textDecoration: "none" }}>
            OBSERVATORY
          </Link>
        </div>
      </div>
    </main>
  );
}
