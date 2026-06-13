"use client";
import { useState } from "react";
import Link from "next/link";

const ACCENT = "#FFD700";

const CONTESTS = [
  { id: "c1", name: "Dirty Dozens — Season 3",  type: "BATTLE",   status: "live",     prize: "$5,000", entries: 48,  ends: "Jun 21, 2026", color: "#FF2DAA" },
  { id: "c2", name: "Cypher Championship",      type: "CYPHER",   status: "live",     prize: "$2,000", entries: 112, ends: "Jun 30, 2026", color: "#00FFFF" },
  { id: "c3", name: "Beat Producer Showcase",   type: "BEATS",    status: "upcoming", prize: "$1,500", entries: 0,   ends: "Jul 5, 2026",  color: "#AA2DFF" },
  { id: "c4", name: "Fan Artist Trivia Night",  type: "GAME",     status: "upcoming", prize: "$500",   entries: 0,   ends: "Jun 28, 2026", color: "#FFD700" },
  { id: "c5", name: "TMI Season 1 Finals",      type: "BATTLE",   status: "ended",    prize: "$10,000",entries: 64,  ends: "Jun 7, 2026",  color: "#34D399" },
];

const RECENT_WINNERS = [
  { contest: "TMI Season 1 Finals",    winner: "@BigKazhDog",  prize: "$10,000", date: "Jun 7" },
  { contest: "Cypher King Quarterfinal",winner: "@wavetek",    prize: "$500",    date: "Jun 4" },
  { contest: "Beat Battle Weekly #12", winner: "@NightFreq",  prize: "$200",    date: "Jun 2" },
];

const STATUS_COLOR: Record<string, string> = { live: "#34D399", upcoming: "#FFD700", ended: "#888" };

export default function ContestDashboardPage() {
  const [filter, setFilter] = useState<"all" | "live" | "upcoming" | "ended">("all");
  const [toast, setToast] = useState("");

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 3000); }

  const visible = filter === "all" ? CONTESTS : CONTESTS.filter(c => c.status === filter);
  const liveCount = CONTESTS.filter(c => c.status === "live").length;
  const totalPrize = CONTESTS.filter(c => c.status !== "ended").reduce((sum, c) => sum + parseInt(c.prize.replace(/[$,]/g, "")), 0);

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ background: "rgba(0,0,0,0.85)", borderBottom: "1px solid rgba(255,215,0,0.25)", padding: "11px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: "0.35em", color: ACCENT, fontWeight: 800 }}>ADMIN — CONTESTS</div>
          <div style={{ fontSize: 14, fontWeight: 900 }}>🏆 Contest Engine</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => showToast("Create contest modal")} style={{ fontSize: 10, fontWeight: 800, color: "#000", background: ACCENT, border: "none", padding: "6px 16px", borderRadius: 6, cursor: "pointer" }}>+ CREATE</button>
          <Link href="/dashboard/admin" style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.1)", padding: "6px 12px", borderRadius: 6, textDecoration: "none", fontWeight: 700 }}>← Admin</Link>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Live Contests",   value: String(liveCount),   color: "#34D399" },
            { label: "Total Prize Pool", value: `$${totalPrize.toLocaleString()}`, color: ACCENT },
            { label: "Total Entries",   value: String(CONTESTS.reduce((s, c) => s + c.entries, 0)), color: "#00FFFF" },
            { label: "Total Winners",   value: String(RECENT_WINNERS.length), color: "#FF2DAA" },
          ].map(s => (
            <div key={s.label} style={{ background: `${s.color}08`, border: `1px solid ${s.color}25`, borderRadius: 10, padding: "14px 16px", position: "relative" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: s.color, borderRadius: "10px 10px 0 0" }} />
              <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", marginTop: 2 }}>{s.label.toUpperCase()}</div>
            </div>
          ))}
        </div>

        {toast && <div style={{ marginBottom: 14, padding: "10px 16px", background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.25)", borderRadius: 8, fontSize: 12, color: ACCENT }}>{toast}</div>}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 }}>
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              {(["all", "live", "upcoming", "ended"] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{ padding: "6px 14px", borderRadius: 20, fontSize: 10, fontWeight: 800, cursor: "pointer", border: "none", background: filter === f ? ACCENT : "rgba(255,255,255,0.07)", color: filter === f ? "#000" : "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>{f}</button>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {visible.map(c => (
                <div key={c.id} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${c.status === "live" ? c.color + "30" : "rgba(255,255,255,0.06)"}`, borderRadius: 12, padding: "16px 18px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 5 }}>
                        <span style={{ fontWeight: 800, fontSize: 14 }}>{c.name}</span>
                        <span style={{ fontSize: 8, fontWeight: 900, padding: "2px 8px", borderRadius: 10, background: `${STATUS_COLOR[c.status]}15`, color: STATUS_COLOR[c.status] }}>{c.status.toUpperCase()}</span>
                        <span style={{ fontSize: 8, padding: "2px 8px", borderRadius: 10, background: `${c.color}10`, color: c.color, fontWeight: 800 }}>{c.type}</span>
                      </div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{c.entries} entries · Ends {c.ends}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 22, fontWeight: 900, color: ACCENT }}>{c.prize}</div>
                      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>prize pool</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <button onClick={() => showToast(`Managing ${c.name}`)} style={{ padding: "6px 14px", fontSize: 10, fontWeight: 800, background: `${c.color}15`, border: `1px solid ${c.color}30`, color: c.color, borderRadius: 6, cursor: "pointer" }}>MANAGE</button>
                    <Link href="/battles" style={{ padding: "6px 14px", fontSize: 10, fontWeight: 700, background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)", borderRadius: 6, textDecoration: "none" }}>VIEW LIVE</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent winners */}
          <div>
            <div style={{ fontSize: 10, color: ACCENT, fontWeight: 800, letterSpacing: "0.15em", marginBottom: 12 }}>RECENT WINNERS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {RECENT_WINNERS.map((w, i) => (
                <div key={i} style={{ background: "rgba(255,215,0,0.04)", border: "1px solid rgba(255,215,0,0.15)", borderRadius: 10, padding: "12px 14px" }}>
                  <div style={{ fontWeight: 800, fontSize: 14, color: ACCENT }}>{w.winner}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{w.contest}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 900, color: "#34D399" }}>{w.prize}</span>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{w.date}</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
              <Link href="/battles" style={{ padding: "10px 0", textAlign: "center", background: "rgba(255,45,170,0.08)", border: "1px solid rgba(255,45,170,0.2)", borderRadius: 8, fontSize: 11, fontWeight: 700, color: "#FF2DAA", textDecoration: "none" }}>View Battles</Link>
              <Link href="/cypher/stage" style={{ padding: "10px 0", textAlign: "center", background: "rgba(0,255,255,0.06)", border: "1px solid rgba(0,255,255,0.15)", borderRadius: 8, fontSize: 11, fontWeight: 700, color: "#00FFFF", textDecoration: "none" }}>View Cyphers</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
