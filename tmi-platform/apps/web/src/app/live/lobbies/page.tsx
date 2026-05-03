import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Lobbies | TMI",
  description: "Pre-show holding rooms before events go live.",
};

const DEMO_LOBBIES = [
  { id: "lobby-concert-1", eventName: "Neon Vibe Residency", type: "CONCERT", opens: "7:45 PM EST", capacity: 5000, checkedIn: 2341, color: "#AA2DFF" },
  { id: "lobby-cypher-4", eventName: "Monday Cypher #4", type: "CYPHER", opens: "Live Now", capacity: 500, checkedIn: 480, color: "#FF2DAA" },
  { id: "lobby-battle-5", eventName: "Wavetek vs Krypt", type: "BATTLE", opens: "Live Now", capacity: 2000, checkedIn: 1800, color: "#FFD700" },
  { id: "lobby-dd-e04", eventName: "Dirty Dozens E04", type: "D-DOZENS", opens: "8:00 PM EST", capacity: 10000, checkedIn: 3200, color: "#FF8C00" },
];

export default function LiveLobbiesPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <section style={{ padding: "56px 24px 32px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ marginBottom: 8 }}>
          <Link href="/live" style={{ color: "#666", textDecoration: "none", fontSize: 13 }}>{"<- Live Hub"}</Link>
        </div>
        <h1 style={{ fontSize: "clamp(1.8rem,4vw,3rem)", fontWeight: 900, marginBottom: 8 }}>Event Lobbies</h1>
        <p style={{ color: "#999", fontSize: 14 }}>Pre-show check-in areas. Audience assembles before the event goes live.</p>
      </section>

      <section style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 20 }}>
          {DEMO_LOBBIES.map((lobby) => {
            const pct = Math.round((lobby.checkedIn / lobby.capacity) * 100);
            return (
              <div key={lobby.id} style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${lobby.color}33`, borderRadius: 14, padding: "24px 28px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 11, color: lobby.color, fontWeight: 800, letterSpacing: "0.1em" }}>{lobby.type}</span>
                  <span style={{ fontSize: 11, color: "#666", marginLeft: "auto" }}>Opens: {lobby.opens}</span>
                </div>
                <h3 style={{ fontWeight: 800, fontSize: 18, marginBottom: 12 }}>{lobby.eventName}</h3>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#aaa", marginBottom: 4 }}>
                    <span>{lobby.checkedIn.toLocaleString()} checked in</span>
                    <span>{lobby.capacity.toLocaleString()} capacity</span>
                  </div>
                  <div style={{ background: "#1a1a2e", borderRadius: 4, height: 6 }}>
                    <div style={{ background: lobby.color, borderRadius: 4, height: 6, width: `${pct}%` }} />
                  </div>
                  <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>{pct}% full</div>
                </div>
                <Link href={`/live/stages`} style={{ display: "inline-block", background: lobby.color, color: "#050510", borderRadius: 6, padding: "7px 18px", fontWeight: 800, fontSize: 12, textDecoration: "none" }}>
                  Enter Lobby
                </Link>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
