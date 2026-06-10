"use client";

import { useState } from "react";
import AdminShell from "@/components/admin/AdminShell";

type BeatCategory = "battles" | "ciphers" | "games" | "shows";
type BeatStatus = "submitted" | "approved" | "active" | "pulled";

interface Beat {
  id: string;
  title: string;
  bpm: number;
  key: string;
  category: BeatCategory;
  status: BeatStatus;
  earned: number;
  placements: number;
  submittedAt: string;
}

const SEED_BEATS: Beat[] = [
  { id: "b1", title: "Neon Pressure",  bpm: 140, key: "Dm", category: "battles", status: "active",    earned: 420, placements: 7, submittedAt: "Jun 1"  },
  { id: "b2", title: "Crown Circuit",  bpm: 96,  key: "Gm", category: "ciphers", status: "active",    earned: 310, placements: 5, submittedAt: "May 28" },
  { id: "b3", title: "Space Bounce",   bpm: 120, key: "C",  category: "games",   status: "approved",  earned: 0,   placements: 0, submittedAt: "Jun 5"  },
  { id: "b4", title: "Grand Stage",    bpm: 88,  key: "Am", category: "shows",   status: "submitted", earned: 0,   placements: 0, submittedAt: "Jun 7"  },
  { id: "b5", title: "Street Code",    bpm: 132, key: "Fm", category: "battles", status: "pulled",    earned: 180, placements: 3, submittedAt: "May 10" },
];

const CAT_COLOR: Record<BeatCategory, string> = {
  battles: "#FF2DAA", ciphers: "#AA2DFF", games: "#00FFFF", shows: "#FFD700",
};

const STATUS_COLOR: Record<BeatStatus, string> = {
  submitted: "#94a3b8", approved: "#22c55e", active: "#00FFFF", pulled: "#ef4444",
};

const inputStyle: React.CSSProperties = {
  width: "100%", boxSizing: "border-box",
  background: "rgba(0,0,0,0.5)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 6, padding: "7px 9px",
  color: "#f1f5f9", fontSize: 11, outline: "none", fontFamily: "inherit",
};

export default function JakePaulBeatPortal() {
  const [beats, setBeats] = useState<Beat[]>(SEED_BEATS);
  const [form, setForm] = useState({ title: "", bpm: "", key: "", category: "battles" as BeatCategory, url: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [payoutAmt, setPayoutAmt] = useState("");
  const [payoutSent, setPayoutSent] = useState(false);

  const totalEarned     = beats.reduce((s, b) => s + b.earned, 0);
  const pendingPayout   = 310;
  const paidOut         = 600;
  const totalPlacements = beats.reduce((s, b) => s + b.placements, 0);

  function submitBeat(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title) return;
    setSubmitting(true);
    setTimeout(() => {
      const newBeat: Beat = {
        id: `b${Date.now()}`,
        title: form.title,
        bpm: parseInt(form.bpm) || 120,
        key: form.key || "C",
        category: form.category,
        status: "submitted",
        earned: 0,
        placements: 0,
        submittedAt: "Just now",
      };
      setBeats((prev) => [newBeat, ...prev]);
      setForm({ title: "", bpm: "", key: "", category: "battles", url: "" });
      setSubmitting(false);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    }, 700);
  }

  function requestPayout(e: React.FormEvent) {
    e.preventDefault();
    setPayoutSent(true);
  }

  return (
    <AdminShell
      hubId="jay-paul"
      hubTitle="Jake Paul Sanchez"
      hubSubtitle="Beat Producer Portal"
      backHref="/admin"
    >
      {/* Earnings summary strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 16 }}>
        {[
          { label: "Total Earned",     value: `$${totalEarned.toLocaleString()}`,   color: "#FFD700" },
          { label: "Pending Payout",   value: `$${pendingPayout.toLocaleString()}`, color: "#f59e0b", note: "Awaiting Big Ace" },
          { label: "Paid Out",         value: `$${paidOut.toLocaleString()}`,       color: "#22c55e" },
          { label: "Active Beats",     value: String(beats.filter(b => b.status === "active").length), color: "#00FFFF" },
          { label: "Total Placements", value: String(totalPlacements),              color: "#FF2DAA" },
        ].map((m) => (
          <div key={m.label} style={{ border: `1px solid ${m.color}33`, borderRadius: 10, background: "rgba(255,255,255,0.03)", padding: "10px 12px" }}>
            <p style={{ margin: 0, fontSize: 9, color: m.color, letterSpacing: "0.1em", textTransform: "uppercase" }}>{m.label}</p>
            {"note" in m && <p style={{ margin: "1px 0 0", fontSize: 8, color: "#f59e0b", opacity: 0.75 }}>{m.note}</p>}
            <p style={{ margin: "4px 0 0", fontSize: 18, fontWeight: 900, color: "#f1f5f9" }}>{m.value}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "290px minmax(0,1fr)", gap: 12, alignItems: "start" }}>
        {/* LEFT — submit form + payout */}
        <div style={{ display: "grid", gap: 10 }}>

          {/* Beat submission form */}
          <section style={{ border: "1px solid rgba(255,45,170,0.3)", borderRadius: 12, background: "rgba(20,5,15,0.75)", padding: 14 }}>
            <p style={{ margin: "0 0 12px", color: "#FF2DAA", fontSize: 10, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase" }}>
              Submit a Beat
            </p>
            <form onSubmit={submitBeat} style={{ display: "grid", gap: 9 }}>
              <div>
                <label style={{ display: "block", fontSize: 9, color: "#94a3b8", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.1em" }}>Beat Title *</label>
                <input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} placeholder="e.g. Neon Fire" required style={inputStyle} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div>
                  <label style={{ display: "block", fontSize: 9, color: "#94a3b8", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.1em" }}>BPM</label>
                  <input type="number" value={form.bpm} onChange={e => setForm(f => ({...f, bpm: e.target.value}))} placeholder="120" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 9, color: "#94a3b8", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.1em" }}>Key</label>
                  <input value={form.key} onChange={e => setForm(f => ({...f, key: e.target.value}))} placeholder="Dm" style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 9, color: "#94a3b8", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.1em" }}>Placement Category *</label>
                <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value as BeatCategory}))} style={inputStyle}>
                  <option value="battles">Battles</option>
                  <option value="ciphers">Ciphers</option>
                  <option value="games">Games</option>
                  <option value="shows">Shows</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 9, color: "#94a3b8", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.1em" }}>Audio URL (SoundCloud / Drive)</label>
                <input type="url" value={form.url} onChange={e => setForm(f => ({...f, url: e.target.value}))} placeholder="https://..." style={inputStyle} />
              </div>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  borderRadius: 7,
                  border: "1px solid rgba(255,45,170,0.5)",
                  background: "rgba(120,10,60,0.6)",
                  color: submitted ? "#86efac" : "#FF2DAA",
                  fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase",
                  padding: "9px 12px", cursor: submitting ? "wait" : "pointer", transition: "color 0.2s",
                }}
              >
                {submitting ? "Submitting..." : submitted ? "✓ Beat Submitted!" : "Submit Beat →"}
              </button>
            </form>
          </section>

          {/* Payout request */}
          <section style={{ border: "1px solid rgba(255,215,0,0.25)", borderRadius: 12, background: "rgba(20,15,5,0.75)", padding: 14 }}>
            <p style={{ margin: "0 0 4px", color: "#FFD700", fontSize: 10, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase" }}>
              Request Payout
            </p>
            <p style={{ margin: "0 0 10px", fontSize: 9, color: "#64748b", lineHeight: 1.6 }}>
              Platform law: all payouts require Big Ace approval before processing.
            </p>
            {payoutSent ? (
              <div style={{ border: "1px solid rgba(34,197,94,0.3)", borderRadius: 8, background: "rgba(5,46,22,0.3)", padding: 10 }}>
                <p style={{ margin: 0, color: "#86efac", fontSize: 10, fontWeight: 700 }}>✓ Payout request sent to Big Ace for approval</p>
              </div>
            ) : (
              <form onSubmit={requestPayout} style={{ display: "grid", gap: 8 }}>
                <input
                  type="number"
                  value={payoutAmt}
                  onChange={e => setPayoutAmt(e.target.value)}
                  placeholder="Amount to request ($)"
                  min="1"
                  required
                  style={inputStyle}
                />
                <button
                  type="submit"
                  style={{ borderRadius: 7, border: "1px solid rgba(255,215,0,0.4)", background: "rgba(80,50,0,0.55)", color: "#FFD700", fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", padding: "8px 12px", cursor: "pointer" }}
                >
                  Request → Big Ace Approval
                </button>
              </form>
            )}
          </section>
        </div>

        {/* RIGHT — beat catalog */}
        <section style={{ border: "1px solid rgba(170,45,255,0.25)", borderRadius: 12, background: "rgba(10,5,20,0.75)", overflow: "hidden" }}>
          <div style={{ padding: "10px 14px", borderBottom: "1px solid rgba(170,45,255,0.15)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <strong style={{ color: "#c4b5fd", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase" }}>Beat Catalog</strong>
            <span style={{ color: "#64748b", fontSize: 9 }}>{beats.length} beats · {beats.filter(b => b.status === "active").length} active</span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  {["Title", "Category", "BPM / Key", "Status", "Plays", "Earned"].map(h => (
                    <th key={h} style={{ padding: "8px 12px", fontSize: 8, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", textAlign: "left", fontWeight: 700, whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {beats.map((beat, i) => (
                  <tr key={beat.id} style={{ borderBottom: i < beats.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                    <td style={{ padding: "9px 12px" }}>
                      <p style={{ margin: 0, fontSize: 11, color: "#f1f5f9", fontWeight: 600 }}>{beat.title}</p>
                      <p style={{ margin: "2px 0 0", fontSize: 9, color: "#64748b" }}>{beat.submittedAt}</p>
                    </td>
                    <td style={{ padding: "9px 12px" }}>
                      <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: CAT_COLOR[beat.category], border: `1px solid ${CAT_COLOR[beat.category]}44`, borderRadius: 4, padding: "2px 7px", whiteSpace: "nowrap" }}>
                        {beat.category}
                      </span>
                    </td>
                    <td style={{ padding: "9px 12px" }}>
                      <p style={{ margin: 0, fontSize: 10, color: "#94a3b8", whiteSpace: "nowrap" }}>{beat.bpm} BPM · {beat.key}</p>
                    </td>
                    <td style={{ padding: "9px 12px" }}>
                      <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", color: STATUS_COLOR[beat.status], letterSpacing: "0.06em" }}>
                        {beat.status}
                      </span>
                    </td>
                    <td style={{ padding: "9px 12px", fontSize: 11, color: "#94a3b8", textAlign: "center" }}>
                      {beat.placements}
                    </td>
                    <td style={{ padding: "9px 12px", fontSize: 11, fontWeight: 700, color: beat.earned > 0 ? "#22c55e" : "#475569" }}>
                      {beat.earned > 0 ? `$${beat.earned.toLocaleString()}` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Earnings by category */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "10px 14px", display: "flex", gap: 16, flexWrap: "wrap" }}>
            {(["battles", "ciphers", "games", "shows"] as BeatCategory[]).map(cat => {
              const earned = beats.filter(b => b.category === cat).reduce((s, b) => s + b.earned, 0);
              return (
                <div key={cat} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: CAT_COLOR[cat], display: "inline-block", flexShrink: 0 }} />
                  <span style={{ fontSize: 9, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>{cat}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: earned > 0 ? "#22c55e" : "#475569" }}>
                    {earned > 0 ? `$${earned}` : "$0"}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
