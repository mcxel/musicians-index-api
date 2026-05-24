"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

type BeatDestination = "dance-party" | "cypher" | "battles" | "games" | "any";
type BeatStatus = "queued" | "playing" | "played" | "rejected" | "marketplace";

interface LockerBeat {
  id: string;
  creatorId: string;
  title: string;
  genre: string;
  bpm: number;
  energyScore: number;
  destination: BeatDestination;
  status: BeatStatus;
  votes: number;
  plays: number;
  createdAt: number;
}

const TABS: { id: BeatDestination | "all"; label: string; icon: string; color: string }[] = [
  { id: "all",          label: "All",         icon: "🔊", color: "#00FFFF" },
  { id: "dance-party",  label: "Dance Party", icon: "🌍", color: "#FF2DAA" },
  { id: "cypher",       label: "Cypher",      icon: "🎤", color: "#AA2DFF" },
  { id: "battles",      label: "Battles",     icon: "⚔️", color: "#FFD700" },
  { id: "games",        label: "Games",       icon: "🎮", color: "#00FF88" },
];

const STATUS_COLOR: Record<BeatStatus, string> = {
  queued:      "#00FFFF",
  playing:     "#00FF88",
  played:      "#64748b",
  rejected:    "#FF4444",
  marketplace: "#FFD700",
};

const ACCENT = "#FF2DAA";

export default function BeatLockerPage() {
  const [beats, setBeats] = useState<LockerBeat[]>([]);
  const [tab, setTab] = useState<BeatDestination | "all">("all");
  const [loading, setLoading] = useState(true);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [form, setForm] = useState({ title: "", genre: "Trap", bpm: "120", destination: "dance-party" as BeatDestination });
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      const dest = tab === "all" ? "dance-party" : tab;
      const res = await fetch(`/api/beats/ingest?destination=${dest}&limit=50`, { cache: "no-store" });
      const data = await res.json() as { beats: LockerBeat[] };
      setBeats(data.beats ?? []);
    } catch { /* silent */ } finally { setLoading(false); }
  }, [tab]);

  useEffect(() => { void load(); }, [load]);

  const vote = async (beatId: string) => {
    await fetch("/api/beats/vote", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ beatId, action: "vote" }) });
    void load();
  };

  const submitBeat = async () => {
    if (!form.title.trim()) return;
    setSubmitting(true);
    try {
      await fetch("/api/beats/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title: form.title, genre: form.genre, bpm: parseInt(form.bpm) || 120, destination: form.destination }),
      });
      setSubmitOpen(false);
      setForm({ title: "", genre: "Trap", bpm: "120", destination: "dance-party" });
      void load();
    } finally { setSubmitting(false); }
  };

  const visible = tab === "all" ? beats : beats.filter((b) => b.destination === tab || b.destination === "any");

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ background: "rgba(0,0,0,0.88)", borderBottom: "1px solid rgba(255,45,170,0.2)", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: "0.35em", color: ACCENT, fontWeight: 800 }}>BEAT LOCKER</div>
          <div style={{ fontSize: 16, fontWeight: 900, marginTop: 2 }}>Live Beat Queue</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setSubmitOpen(true)} style={{ padding: "8px 18px", background: `linear-gradient(90deg,${ACCENT},#AA2DFF)`, borderRadius: 8, color: "#fff", fontWeight: 800, fontSize: 11, border: "none", cursor: "pointer", letterSpacing: "0.08em" }}>
            + SUBMIT BEAT
          </button>
          <Link href="/beats" style={{ padding: "8px 14px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#aaa", fontSize: 11, fontWeight: 700, textDecoration: "none" }}>ALL BEATS</Link>
          <Link href="/beats/marketplace" style={{ padding: "8px 14px", background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.2)", borderRadius: 8, color: "#FFD700", fontSize: 11, fontWeight: 700, textDecoration: "none" }}>MARKETPLACE</Link>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px 80px" }}>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: "8px 16px", borderRadius: 8, border: `1px solid ${tab === t.id ? t.color : "rgba(255,255,255,0.1)"}`,
              background: tab === t.id ? `${t.color}15` : "transparent", color: tab === t.id ? t.color : "rgba(255,255,255,0.4)",
              fontSize: 11, fontWeight: 700, cursor: "pointer", letterSpacing: "0.08em",
            }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 10, marginBottom: 24 }}>
          {[
            { label: "In Queue", value: String(visible.filter((b) => b.status === "queued").length), color: "#00FFFF" },
            { label: "Playing",  value: String(visible.filter((b) => b.status === "playing").length), color: "#00FF88" },
            { label: "Promoted", value: String(visible.filter((b) => b.status === "marketplace").length), color: "#FFD700" },
            { label: "Total Votes", value: String(visible.reduce((s, b) => s + b.votes, 0)), color: "#AA2DFF" },
          ].map((s) => (
            <div key={s.label} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${s.color}25`, borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 9, color: "#555", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Beat list */}
        {loading ? (
          <div style={{ color: "rgba(255,255,255,0.25)", textAlign: "center", padding: "40px 0" }}>Loading queue...</div>
        ) : visible.length === 0 ? (
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "40px", textAlign: "center" }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>🎵</div>
            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>No beats in this queue yet.</div>
            <button onClick={() => setSubmitOpen(true)} style={{ marginTop: 16, padding: "10px 24px", background: `${ACCENT}15`, border: `1px solid ${ACCENT}30`, borderRadius: 8, color: ACCENT, fontWeight: 800, fontSize: 12, cursor: "pointer", letterSpacing: "0.08em" }}>
              SUBMIT FIRST BEAT
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {visible.map((beat, i) => (
              <div key={beat.id} style={{
                display: "grid", gridTemplateColumns: "32px 1fr auto auto auto auto",
                gap: 12, alignItems: "center", padding: "14px 18px",
                background: beat.status === "playing" ? "rgba(0,255,136,0.06)" : "rgba(255,255,255,0.02)",
                border: `1px solid ${beat.status === "playing" ? "rgba(0,255,136,0.3)" : "rgba(255,255,255,0.06)"}`,
                borderRadius: 10,
              }}>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.2)", fontWeight: 700, textAlign: "center" }}>{i + 1}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{beat.title}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
                    {beat.genre} · {beat.bpm} BPM · {beat.destination}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#AA2DFF" }}>⚡ {beat.energyScore}</div>
                  <div style={{ fontSize: 9, color: "#555" }}>energy</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#FFD700" }}>{beat.votes}</div>
                  <div style={{ fontSize: 9, color: "#555" }}>votes</div>
                </div>
                <span style={{ fontSize: 8, fontWeight: 800, color: STATUS_COLOR[beat.status], border: `1px solid ${STATUS_COLOR[beat.status]}30`, padding: "3px 8px", borderRadius: 4, letterSpacing: "0.1em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                  {beat.status}
                </span>
                <button onClick={() => void vote(beat.id)} style={{ padding: "6px 14px", background: "rgba(255,45,170,0.1)", border: "1px solid rgba(255,45,170,0.3)", borderRadius: 6, color: ACCENT, fontSize: 11, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
                  🔥 VOTE
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Footer links */}
        <div style={{ marginTop: 28, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/rooms/world-dance-party" style={{ padding: "10px 18px", background: "rgba(255,45,170,0.08)", border: "1px solid rgba(255,45,170,0.2)", borderRadius: 8, color: ACCENT, fontWeight: 700, fontSize: 11, textDecoration: "none" }}>🌍 World Dance Party</Link>
          <Link href="/cypher" style={{ padding: "10px 18px", background: "rgba(170,45,255,0.08)", border: "1px solid rgba(170,45,255,0.2)", borderRadius: 8, color: "#AA2DFF", fontWeight: 700, fontSize: 11, textDecoration: "none" }}>🎤 Cypher Stage</Link>
          <Link href="/battles" style={{ padding: "10px 18px", background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.2)", borderRadius: 8, color: "#FFD700", fontWeight: 700, fontSize: 11, textDecoration: "none" }}>⚔️ Battles</Link>
          <Link href="/beats/submit" style={{ padding: "10px 18px", background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.2)", borderRadius: 8, color: "#00FF88", fontWeight: 700, fontSize: 11, textDecoration: "none" }}>+ Submit Full Beat</Link>
        </div>
      </div>

      {/* Submit modal */}
      {submitOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#0a0a1a", border: `1px solid ${ACCENT}30`, borderRadius: 16, padding: 28, width: "100%", maxWidth: 440 }}>
            <div style={{ fontSize: 9, letterSpacing: "0.3em", color: ACCENT, fontWeight: 800, marginBottom: 6 }}>SUBMIT TO LOCKER</div>
            <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 20 }}>Add Your Beat</div>
            {[
              { label: "Title", field: "title", type: "text", placeholder: "Beat name" },
              { label: "BPM", field: "bpm", type: "number", placeholder: "120" },
            ].map(({ label, field, type, placeholder }) => (
              <div key={field} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", marginBottom: 6, textTransform: "uppercase" }}>{label}</div>
                <input
                  type={type}
                  placeholder={placeholder}
                  value={form[field as keyof typeof form]}
                  onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                  style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "10px 12px", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }}
                />
              </div>
            ))}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", marginBottom: 6, textTransform: "uppercase" }}>Genre</div>
              <select value={form.genre} onChange={(e) => setForm((f) => ({ ...f, genre: e.target.value }))} style={{ width: "100%", background: "#0a0a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "10px 12px", color: "#fff", fontSize: 13, outline: "none" }}>
                {["Trap", "Hip-Hop", "R&B", "EDM", "Dance", "Afrobeat", "Latin", "Rock", "House", "Drill", "Other"].map((g) => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", marginBottom: 6, textTransform: "uppercase" }}>Destination</div>
              <select value={form.destination} onChange={(e) => setForm((f) => ({ ...f, destination: e.target.value as BeatDestination }))} style={{ width: "100%", background: "#0a0a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "10px 12px", color: "#fff", fontSize: 13, outline: "none" }}>
                <option value="dance-party">World Dance Party</option>
                <option value="cypher">Cypher Stage</option>
                <option value="battles">Battles</option>
                <option value="games">Games</option>
                <option value="any">Any Destination</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => void submitBeat()} disabled={submitting || !form.title.trim()} style={{ flex: 1, padding: "12px", background: `linear-gradient(90deg,${ACCENT},#AA2DFF)`, borderRadius: 9, color: "#fff", fontWeight: 900, fontSize: 13, border: "none", cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.6 : 1 }}>
                {submitting ? "SUBMITTING..." : "SUBMIT BEAT"}
              </button>
              <button onClick={() => setSubmitOpen(false)} style={{ padding: "12px 18px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 9, color: "#aaa", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
