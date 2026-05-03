"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

type CrowdMeter = {
  venueSlug: string;
  appLausePower: number;
  booMeter: number;
  hypeLevel: number;
  fireMeter: number;
  reactionCounts: Record<string, number>;
  lastUpdated: number;
};

type ReactionEvent = {
  id: string;
  userId: string;
  reaction: string;
  timestamp: number;
};

const REACTIONS = ["applause","boo","fire","heart","hype","crown","100","laugh","shocked","wave"] as const;
const REACTION_EMOJI: Record<string, string> = {
  applause: "👏", boo: "👎", fire: "🔥", heart: "❤️", hype: "⚡", crown: "👑", "100": "💯", laugh: "😂", shocked: "😱", wave: "🌊"
};

function MeterBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: "#aaa" }}>{label}</span>
        <span style={{ fontSize: 12, color, fontWeight: 800 }}>{value}</span>
      </div>
      <div style={{ background: "#1a1a2e", borderRadius: 4, height: 8 }}>
        <div style={{ background: color, borderRadius: 4, height: 8, width: `${value}%`, transition: "width 0.5s ease" }} />
      </div>
    </div>
  );
}

export default function LiveReactionsPage() {
  const [meter, setMeter] = useState<CrowdMeter | null>(null);
  const [recent, setRecent] = useState<ReactionEvent[]>([]);
  const [venueSlug, setVenueSlug] = useState("main-stage");
  const [userId, setUserId] = useState("fan-0000");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState<string | null>(null);

  useEffect(() => {
    setUserId("fan-" + Math.floor(Math.random() * 9000 + 1000));
    fetchReactions();
    const interval = setInterval(fetchReactions, 5000);
    return () => clearInterval(interval);
  }, [venueSlug]);

  async function fetchReactions() {
    setLoading(true);
    try {
      const res = await fetch(`/api/live/reactions?venue=${venueSlug}&limit=20`);
      const data = await res.json() as { meter: CrowdMeter; recent: ReactionEvent[] };
      setMeter(data.meter);
      setRecent(data.recent ?? []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function sendReaction(reaction: string) {
    setSending(reaction);
    try {
      await fetch("/api/live/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "react", venueSlug, userId, reaction }),
      });
      await fetchReactions();
    } catch {
      // ignore
    } finally {
      setSending(null);
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <section style={{ padding: "56px 24px 32px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ marginBottom: 8 }}>
          <Link href="/live" style={{ color: "#666", textDecoration: "none", fontSize: 13 }}>{"<- Live Hub"}</Link>
        </div>
        <h1 style={{ fontSize: "clamp(1.8rem,4vw,3rem)", fontWeight: 900, marginBottom: 8 }}>Live Reactions</h1>
        <p style={{ color: "#999", fontSize: 14 }}>Applause meter, boo meter, hype level — live crowd energy tracking.</p>
      </section>

      <section style={{ maxWidth: 860, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 28, alignItems: "center", flexWrap: "wrap" }}>
          <select value={venueSlug} onChange={(e) => setVenueSlug(e.target.value)}
            style={{ background: "#0d0d1f", border: "1px solid #333", borderRadius: 8, color: "#fff", padding: "8px 14px", fontSize: 14 }}>
            {["main-stage","cypher-room","battle-zone","concert-hall"].map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
          <span style={{ fontSize: 12, color: "#666" }}>User: {userId}</span>
          {loading && <span style={{ fontSize: 12, color: "#555" }}>Refreshing...</span>}
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 32 }}>
          {REACTIONS.map((r) => (
            <button
              key={r}
              onClick={() => sendReaction(r)}
              disabled={sending === r}
              style={{
                background: sending === r ? "#333" : "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 10,
                padding: "10px 16px",
                cursor: "pointer",
                fontSize: 22,
                transition: "transform 0.1s",
              }}
            >
              {REACTION_EMOJI[r]}
            </button>
          ))}
        </div>

        {meter && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 32 }}>
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid #333", borderRadius: 12, padding: "22px 26px" }}>
              <h2 style={{ fontSize: 13, color: "#aaa", fontWeight: 800, letterSpacing: "0.1em", marginBottom: 18 }}>CROWD METERS</h2>
              <MeterBar label="Applause Power" value={meter.appLausePower} color="#00FF88" />
              <MeterBar label="Boo Meter" value={meter.booMeter} color="#ff4444" />
              <MeterBar label="Hype Level" value={meter.hypeLevel} color="#FFD700" />
              <MeterBar label="Fire Meter" value={meter.fireMeter} color="#FF8C00" />
            </div>
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid #333", borderRadius: 12, padding: "22px 26px" }}>
              <h2 style={{ fontSize: 13, color: "#aaa", fontWeight: 800, letterSpacing: "0.1em", marginBottom: 18 }}>REACTION COUNTS</h2>
              {Object.entries(meter.reactionCounts).map(([r, count]) => (
                <div key={r} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 16 }}>{REACTION_EMOJI[r] ?? "?"}</span>
                  <span style={{ fontSize: 12, color: "#aaa", flex: 1 }}>{r}</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {recent.length > 0 && (
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid #222", borderRadius: 10, padding: "16px 20px" }}>
            <h3 style={{ fontSize: 12, color: "#666", fontWeight: 800, letterSpacing: "0.1em", marginBottom: 12 }}>RECENT EVENTS</h3>
            {recent.slice(-10).reverse().map((e) => (
              <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 16 }}>{REACTION_EMOJI[e.reaction] ?? "?"}</span>
                <span style={{ fontSize: 12, color: "#aaa" }}>{e.userId}</span>
                <span style={{ fontSize: 11, color: "#555", marginLeft: "auto" }}>
                  {new Date(e.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
