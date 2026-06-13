"use client";
import { useState } from "react";
import Link from "next/link";

const ACCENT = "#4FC3F7";

type Status = "pending" | "confirmed" | "declined";

interface Booking { id: string; artist: string; venue: string; date: string; time: string; fee: number; status: Status; type: string; }

const BOOKINGS: Booking[] = [
  { id: "b1", artist: "@wavetek",      venue: "Main Stage",     date: "Jun 14, 2026", time: "9:00 PM", fee: 500,  status: "pending",   type: "CONCERT" },
  { id: "b2", artist: "@BigKazhDog",   venue: "Arena Floor",    date: "Jun 21, 2026", time: "8:00 PM", fee: 1200, status: "confirmed", type: "BATTLE"  },
  { id: "b3", artist: "@NightFreq",    venue: "Cypher Pit",     date: "Jun 9, 2026",  time: "10:00 PM",fee: 250,  status: "confirmed", type: "CYPHER"  },
  { id: "b4", artist: "@RhythmKing",   venue: "Beat Lab",       date: "Jun 28, 2026", time: "7:00 PM", fee: 800,  status: "pending",   type: "SHOWCASE"},
  { id: "b5", artist: "@FrequentFly",  venue: "Main Stage",     date: "Jul 4, 2026",  time: "9:00 PM", fee: 600,  status: "pending",   type: "CONCERT" },
  { id: "b6", artist: "@SilverSound",  venue: "Lounge Stage",   date: "Jun 10, 2026", time: "8:30 PM", fee: 350,  status: "declined",  type: "CYPHER"  },
];

const STATUS_COLOR: Record<Status, string> = { pending: "#FFD700", confirmed: "#34D399", declined: "#EF4444" };

export default function BookingDashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>(BOOKINGS);
  const [filter, setFilter] = useState<"all" | Status>("all");
  const [toast, setToast] = useState("");

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 3000); }

  function updateStatus(id: string, status: Status) {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    showToast(`Booking ${status}`);
  }

  const visible = filter === "all" ? bookings : bookings.filter(b => b.status === filter);
  const pending = bookings.filter(b => b.status === "pending").length;
  const confirmedRevenue = bookings.filter(b => b.status === "confirmed").reduce((s, b) => s + b.fee, 0);

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ background: "rgba(0,0,0,0.85)", borderBottom: "1px solid rgba(79,195,247,0.25)", padding: "11px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: "0.35em", color: ACCENT, fontWeight: 800 }}>ADMIN — BOOKING</div>
          <div style={{ fontSize: 14, fontWeight: 900 }}>🎤 Booking Manager {pending > 0 && <span style={{ fontSize: 11, background: "#FFD700", color: "#000", borderRadius: 10, padding: "1px 7px", marginLeft: 6 }}>{pending} pending</span>}</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => showToast("New booking form")} style={{ fontSize: 10, fontWeight: 800, color: "#000", background: ACCENT, border: "none", padding: "6px 16px", borderRadius: 6, cursor: "pointer" }}>+ NEW BOOKING</button>
          <Link href="/dashboard/admin" style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.1)", padding: "6px 12px", borderRadius: 6, textDecoration: "none", fontWeight: 700 }}>← Admin</Link>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Pending Requests", value: String(pending),   color: "#FFD700" },
            { label: "Confirmed Shows",  value: String(bookings.filter(b => b.status === "confirmed").length), color: "#34D399" },
            { label: "Confirmed Revenue",value: `$${confirmedRevenue.toLocaleString()}`, color: ACCENT },
            { label: "This Month Total", value: String(bookings.length), color: "#AA2DFF" },
          ].map(s => (
            <div key={s.label} style={{ background: `${s.color}08`, border: `1px solid ${s.color}25`, borderRadius: 10, padding: "14px 16px", position: "relative" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: s.color, borderRadius: "10px 10px 0 0" }} />
              <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", marginTop: 2 }}>{s.label.toUpperCase()}</div>
            </div>
          ))}
        </div>

        {toast && <div style={{ marginBottom: 14, padding: "10px 16px", background: "rgba(79,195,247,0.08)", border: "1px solid rgba(79,195,247,0.2)", borderRadius: 8, fontSize: 12, color: ACCENT }}>{toast}</div>}

        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          {(["all", "pending", "confirmed", "declined"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: "6px 14px", borderRadius: 20, fontSize: 10, fontWeight: 800, cursor: "pointer", border: "none", background: filter === f ? ACCENT : "rgba(255,255,255,0.07)", color: filter === f ? "#000" : "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>
              {f} {f === "pending" && pending > 0 ? `(${pending})` : ""}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {visible.map(b => {
            const sc = STATUS_COLOR[b.status];
            return (
              <div key={b.id} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${b.status === "pending" ? "rgba(255,215,0,0.2)" : "rgba(255,255,255,0.06)"}`, borderRadius: 12, padding: "16px 18px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "start" }}>
                  <div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontWeight: 800, fontSize: 15, color: ACCENT }}>{b.artist}</span>
                      <span style={{ fontSize: 8, fontWeight: 900, padding: "2px 8px", borderRadius: 10, background: `${sc}15`, color: sc }}>{b.status.toUpperCase()}</span>
                      <span style={{ fontSize: 8, fontWeight: 800, color: "#888" }}>{b.type}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
                      {b.venue} · {b.date} at {b.time}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: "#34D399" }}>${b.fee}</div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>booking fee</div>
                  </div>
                </div>
                {b.status === "pending" && (
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <button onClick={() => updateStatus(b.id, "confirmed")} style={{ flex: 1, padding: "8px 0", fontSize: 10, fontWeight: 800, background: "rgba(52,211,153,0.15)", border: "1px solid rgba(52,211,153,0.3)", color: "#34D399", borderRadius: 7, cursor: "pointer" }}>✓ CONFIRM</button>
                    <button onClick={() => updateStatus(b.id, "declined")} style={{ flex: 1, padding: "8px 0", fontSize: 10, fontWeight: 800, background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", color: "#EF4444", borderRadius: 7, cursor: "pointer" }}>✗ DECLINE</button>
                    <button onClick={() => showToast(`Message sent to ${b.artist}`)} style={{ padding: "8px 14px", fontSize: 10, fontWeight: 800, background: "transparent", border: "1px solid rgba(79,195,247,0.25)", color: ACCENT, borderRadius: 7, cursor: "pointer" }}>MESSAGE</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
