"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

type AudienceSnapshot = {
  venueSlug: string;
  present: number;
  capacity: number;
  peakPresent: number;
  occupancyPct: number;
  activeMembers: { userId: string; displayName: string; role: string; seatId: string | null }[];
};

export default function LiveAudiencePage() {
  const [snapshot, setSnapshot] = useState<AudienceSnapshot | null>(null);
  const [venueSlug, setVenueSlug] = useState("main-stage");
  const [userId, setUserId] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<"fan" | "artist" | "host" | "bot">("fan");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => { fetchAudience(); }, [venueSlug]);

  async function fetchAudience() {
    setLoading(true);
    try {
      const res = await fetch(`/api/live/audience?venue=${venueSlug}`);
      setSnapshot(await res.json());
    } catch {
      setMsg("Failed to load audience data");
    } finally {
      setLoading(false);
    }
  }

  async function joinAudience(e: React.FormEvent) {
    e.preventDefault();
    if (!userId || !displayName) return;
    setMsg(null);
    try {
      const res = await fetch("/api/live/audience", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "join", venueSlug, member: { userId, displayName, role, seatId: null } }),
      });
      if (!res.ok) throw new Error("Failed to join");
      setMsg(`${displayName} joined the audience.`);
      setUserId("");
      setDisplayName("");
      await fetchAudience();
    } catch {
      setMsg("Failed to join audience.");
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <section style={{ padding: "56px 24px 32px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ marginBottom: 8 }}>
          <Link href="/live" style={{ color: "#666", textDecoration: "none", fontSize: 13 }}>{"<- Live Hub"}</Link>
        </div>
        <h1 style={{ fontSize: "clamp(1.8rem,4vw,3rem)", fontWeight: 900, marginBottom: 8 }}>Live Audience</h1>
        <p style={{ color: "#999", fontSize: 14 }}>Real-time audience presence, occupancy, and member tracking.</p>
      </section>

      <section style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 24, alignItems: "center", flexWrap: "wrap" }}>
          <select value={venueSlug} onChange={(e) => setVenueSlug(e.target.value)}
            style={{ background: "#0d0d1f", border: "1px solid #333", borderRadius: 8, color: "#fff", padding: "8px 14px", fontSize: 14 }}>
            {["main-stage","cypher-room","battle-zone","concert-hall"].map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
          <button onClick={fetchAudience}
            style={{ background: "#00BFFF22", color: "#00BFFF", border: "1px solid #00BFFF44", borderRadius: 7, padding: "7px 16px", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
            Refresh
          </button>
        </div>

        {msg && <p style={{ color: "#00FF88", fontSize: 13, marginBottom: 16 }}>{msg}</p>}

        {loading && <p style={{ color: "#666" }}>Loading audience...</p>}

        {snapshot && !loading && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 14, marginBottom: 28 }}>
              {[
                { label: "Present", value: snapshot.present.toLocaleString(), color: "#00FF88" },
                { label: "Capacity", value: snapshot.capacity.toLocaleString(), color: "#aaa" },
                { label: "Peak", value: snapshot.peakPresent.toLocaleString(), color: "#FFD700" },
                { label: "Occupancy", value: `${snapshot.occupancyPct}%`, color: "#FF2DAA" },
              ].map((stat) => (
                <div key={stat.label} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid #333", borderRadius: 10, padding: "18px 20px" }}>
                  <div style={{ fontSize: 11, color: "#888", marginBottom: 6, letterSpacing: "0.08em" }}>{stat.label}</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: stat.color }}>{stat.value}</div>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 28 }}>
              <div style={{ height: 6, background: "#1a1a2e", borderRadius: 4, marginBottom: 6 }}>
                <div style={{ height: 6, background: "#00BFFF", borderRadius: 4, width: `${snapshot.occupancyPct}%` }} />
              </div>
              <div style={{ fontSize: 11, color: "#666" }}>{snapshot.occupancyPct}% capacity used</div>
            </div>

            {snapshot.activeMembers.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <h2 style={{ fontSize: 13, color: "#aaa", fontWeight: 800, letterSpacing: "0.1em", marginBottom: 12 }}>ACTIVE AUDIENCE MEMBERS</h2>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {snapshot.activeMembers.slice(0, 50).map((m) => (
                    <span key={m.userId} style={{ background: "rgba(255,255,255,0.06)", borderRadius: 6, padding: "4px 10px", fontSize: 12, color: "#ddd" }}>
                      {m.displayName} <span style={{ color: "#666", fontSize: 10 }}>({m.role})</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <form onSubmit={joinAudience} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid #333", borderRadius: 12, padding: "24px 28px" }}>
          <h3 style={{ fontWeight: 800, fontSize: 15, marginBottom: 18 }}>Join Audience</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 12, alignItems: "end" }}>
            <div>
              <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 5 }}>User ID</label>
              <input value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="user-001"
                style={{ width: "100%", background: "#0d0d1f", border: "1px solid #333", borderRadius: 7, color: "#fff", padding: "8px 12px", fontSize: 13, boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 5 }}>Display Name</label>
              <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Fan Name"
                style={{ width: "100%", background: "#0d0d1f", border: "1px solid #333", borderRadius: 7, color: "#fff", padding: "8px 12px", fontSize: 13, boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 5 }}>Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value as typeof role)}
                style={{ background: "#0d0d1f", border: "1px solid #333", borderRadius: 7, color: "#fff", padding: "8px 12px", fontSize: 13 }}>
                <option value="fan">fan</option>
                <option value="artist">artist</option>
                <option value="host">host</option>
                <option value="bot">bot</option>
              </select>
            </div>
          </div>
          <button type="submit" disabled={!userId || !displayName}
            style={{ marginTop: 16, background: "#00BFFF", color: "#050510", border: "none", borderRadius: 8, padding: "9px 24px", fontWeight: 800, fontSize: 13, cursor: "pointer" }}>
            Join Audience
          </button>
        </form>
      </section>
    </main>
  );
}
