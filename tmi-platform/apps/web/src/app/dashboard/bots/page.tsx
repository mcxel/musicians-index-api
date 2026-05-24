"use client";
import Link from "next/link";
import { useState } from "react";

type Bot = { id: string; name: string; status: "active" | "paused"; trigger: string; action: string };

const SEED: Bot[] = [
  { id: "hype-bot",   name: "HypeBot",     status: "active", trigger: "New battle started",   action: "Post to Discord #battles" },
  { id: "tip-notify", name: "TipNotifier", status: "active", trigger: "Tip received > $5",    action: "DM artist + post feed" },
  { id: "rank-alert", name: "RankAlert",   status: "paused", trigger: "Rank change in top 10", action: "Announce in chat" },
];

export default function Page() {
  const [bots, setBots] = useState<Bot[]>(SEED);
  const [msg, setMsg] = useState("");

  function newBot() {
    setMsg("New bot creation — configure triggers in the admin bots panel.");
    setTimeout(() => setMsg(""), 4000);
  }

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white px-6 py-10">
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <h1 className="text-3xl font-bold text-[#ff6b35]">Bots & Automations</h1>
          <button onClick={newBot} style={{ padding: "10px 20px", borderRadius: 8, background: "#ff6b35", color: "#fff", fontWeight: 800, fontSize: 13, cursor: "pointer", border: "none" }}>+ New Bot</button>
        </div>
        {msg && <div style={{ marginBottom: 14, padding: "10px 14px", background: "rgba(255,107,53,0.08)", border: "1px solid rgba(255,107,53,0.2)", borderRadius: 8, fontSize: 12, color: "#ff6b35" }}>{msg}</div>}
        <div style={{ display: "grid", gap: 10 }}>
          {bots.map((b) => (
            <div key={b.id} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{b.name}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 3 }}>Trigger: {b.trigger} → {b.action}</div>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ fontSize: 9, fontWeight: 900, color: b.status === "active" ? "#22c55e" : "#FFD700", letterSpacing: "0.15em" }}>{b.status.toUpperCase()}</span>
                <button
                  onClick={() => setBots(prev => prev.map(x => x.id === b.id ? { ...x, status: x.status === "active" ? "paused" : "active" } : x))}
                  style={{ padding: "4px 10px", fontSize: 9, fontWeight: 800, color: b.status === "active" ? "#FFD700" : "#22c55e", border: `1px solid ${b.status === "active" ? "rgba(255,215,0,0.3)" : "rgba(34,197,94,0.3)"}`, borderRadius: 6, background: "transparent", cursor: "pointer" }}
                >
                  {b.status === "active" ? "PAUSE" : "RESUME"}
                </button>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 20 }}><Link href="/dashboard" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Dashboard</Link></div>
      </div>
    </main>
  );
}
