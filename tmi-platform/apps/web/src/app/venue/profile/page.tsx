"use client";
import { useState } from "react";
import Link from "next/link";

const ACCENT = "#22c55e";
const BG = "#050510";

const STATS = [
  { label: "Rooms Active",    value: "6",      color: ACCENT    },
  { label: "Tickets Sold",    value: "1,840",  color: "#00FFFF" },
  { label: "Avg Occupancy",   value: "74%",    color: "#FFD700" },
  { label: "Revenue (MTD)",   value: "$18.4K", color: "#FF2DAA" },
  { label: "Events Booked",   value: "23",     color: "#00FF88" },
  { label: "Fan Capacity",    value: "4,200",  color: "#AA2DFF" },
];

const ACTIVE_ROOMS = [
  { name: "Main Stage",    occ: 92, cap: 800, color: ACCENT    },
  { name: "VIP Lounge",   occ: 67, cap: 120, color: "#FFD700" },
  { name: "Cypher Zone",  occ: 84, cap: 200, color: "#00FFFF" },
  { name: "Watch Party",  occ: 71, cap: 300, color: "#FF2DAA" },
];

const UPCOMING_EVENTS = [
  { title: "Nova Cipher LIVE",     date: "Jun 6 · 9PM",  href: "/shows/nova-cipher-live"  },
  { title: "Cypher Championship",  date: "Jun 8 · 7PM",  href: "/shows/cypher-championship"},
  { title: "Monthly Idol Finale",  date: "Jun 14 · 8PM", href: "/shows/monthly-idol"       },
];

export default function VenueProfilePage() {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("The Musician's Index Arena");
  const [bio, setBio] = useState("Premier live music venue on TMI. Home to Monthly Idol, Battle Championships, and world-class cyphers.");

  return (
    <main style={{ minHeight: "100vh", background: BG, color: "#fff", fontFamily: "'Inter', sans-serif", paddingBottom: 80 }}>
      <nav style={{ background: "rgba(0,0,0,0.8)", borderBottom: `1px solid ${ACCENT}22`, padding: "12px 24px", display: "flex", gap: 20, alignItems: "center", overflowX: "auto", backdropFilter: "blur(12px)" }}>
        <Link href="/home/1" style={{ fontSize: 11, fontWeight: 900, color: ACCENT, textDecoration: "none", letterSpacing: "0.12em", flexShrink: 0 }}>TMI</Link>
        <Link href="/hub/venue" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Venue Hub</Link>
        <span style={{ fontSize: 11, color: ACCENT, fontWeight: 700 }}>Venue Profile</span>
        <Link href="/settings" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none", marginLeft: "auto" }}>Settings</Link>
      </nav>
      <div style={{ position: "fixed", inset: 0, background: `radial-gradient(circle at 40% 20%, ${ACCENT}07, transparent 50%)`, pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "relative", zIndex: 1, maxWidth: 1000, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ display: "flex", gap: 24, padding: "28px", background: `linear-gradient(135deg, ${ACCENT}0E, rgba(5,5,16,0.95))`, border: `1px solid ${ACCENT}28`, borderRadius: 20, marginBottom: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
          <div style={{ width: 88, height: 88, borderRadius: 14, background: `linear-gradient(135deg, ${ACCENT}, #050510)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, flexShrink: 0 }}>🏟️</div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 9, letterSpacing: "0.25em", color: ACCENT, fontWeight: 800, marginBottom: 4 }}>VENUE · TMI CERTIFIED</div>
            <h1 style={{ margin: "0 0 6px", fontSize: "clamp(20px,3.5vw,30px)", fontWeight: 900 }}>{name}</h1>
            <p style={{ margin: "0 0 12px", fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.5, maxWidth: 480 }}>{bio}</p>
            <div style={{ display: "flex", gap: 10 }}>
              <Link href="/venue/bookings" style={{ padding: "8px 16px", borderRadius: 8, background: `${ACCENT}12`, border: `1px solid ${ACCENT}35`, color: ACCENT, fontSize: 10, fontWeight: 800, textDecoration: "none" }}>📅 BOOK NOW</Link>
              <Link href="/tickets/print" style={{ padding: "8px 16px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", fontSize: 10, fontWeight: 800, textDecoration: "none" }}>🖨️ PRINT TICKETS</Link>
            </div>
          </div>
          <button onClick={() => setEditing(!editing)} style={{ padding: "9px 20px", borderRadius: 9, background: `${ACCENT}14`, border: `1px solid ${ACCENT}45`, color: ACCENT, fontSize: 10, fontWeight: 800, cursor: "pointer", flexShrink: 0 }}>
            {editing ? "CANCEL" : "EDIT PROFILE"}
          </button>
        </div>
        {editing && (
          <div style={{ padding: "24px", background: "rgba(255,255,255,0.02)", border: `1px solid ${ACCENT}20`, borderRadius: 16, marginBottom: 24 }}>
            <form action="/api/profile/update" method="POST" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[{ label: "Venue Name", name: "name", val: name, setter: setName }].map((f) => (
                <div key={f.name}>
                  <label style={{ display: "block", fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em", fontWeight: 800, marginBottom: 6 }}>{f.label}</label>
                  <input type="text" name={f.name} value={f.val} onChange={(e) => f.setter(e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: `1px solid ${ACCENT}20`, color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                </div>
              ))}
              <div>
                <label style={{ display: "block", fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em", fontWeight: 800, marginBottom: 6 }}>DESCRIPTION</label>
                <textarea rows={3} name="bio" value={bio} onChange={(e) => setBio(e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: `1px solid ${ACCENT}20`, color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box", resize: "vertical" }} />
              </div>
              {[{ label: "City / Location", name: "city" }, { label: "Capacity", name: "capacity" }, { label: "Contact Email", name: "email" }].map((f) => (
                <div key={f.name}>
                  <label style={{ display: "block", fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em", fontWeight: 800, marginBottom: 6 }}>{f.label}</label>
                  <input type="text" name={f.name} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <button type="submit" style={{ padding: "10px 24px", borderRadius: 8, background: ACCENT, color: BG, border: "none", fontSize: 12, fontWeight: 900, cursor: "pointer" }}>SAVE</button>
                <Link href="/account/deactivate" style={{ color: "#ff4444", fontSize: 11, textDecoration: "none" }}>Deactivate Account</Link>
              </div>
            </form>
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, marginBottom: 24 }}>
          {STATS.map((s) => (
            <div key={s.label} style={{ padding: "16px", background: `${s.color}08`, border: `1px solid ${s.color}20`, borderRadius: 12, textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 9, fontWeight: 800, marginTop: 5 }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
          <div style={{ padding: "18px 20px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14 }}>
            <div style={{ fontSize: 9, letterSpacing: "0.2em", color: ACCENT, fontWeight: 800, marginBottom: 12 }}>LIVE ROOM STATUS</div>
            {ACTIVE_ROOMS.map((r) => (
              <div key={r.name} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>{r.name}</span>
                  <span style={{ fontSize: 10, color: r.color, fontWeight: 800 }}>{r.occ}%</span>
                </div>
                <div style={{ height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${r.occ}%`, background: r.color, borderRadius: 2 }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding: "18px 20px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14 }}>
            <div style={{ fontSize: 9, letterSpacing: "0.2em", color: ACCENT, fontWeight: 800, marginBottom: 12 }}>UPCOMING EVENTS</div>
            {UPCOMING_EVENTS.map((u) => (
              <Link key={u.href} href={u.href} style={{ display: "block", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", textDecoration: "none", color: "#fff" }}>
                <div style={{ fontSize: 12, fontWeight: 700 }}>{u.title}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>{u.date}</div>
              </Link>
            ))}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 }}>
          {[
            { href: "/hub/venue",       label: "Venue Hub",    color: ACCENT    },
            { href: "/venue/bookings",  label: "Bookings",     color: "#00FFFF" },
            { href: "/venue/tickets",   label: "Tickets",      color: "#FFD700" },
            { href: "/venue/seating",   label: "Seat Map",     color: "#AA2DFF" },
            { href: "/tickets/print",   label: "Print",        color: "#FF6B35" },
            { href: "/venue/analytics", label: "Analytics",    color: "#FF2DAA" },
          ].map((a) => (
            <Link key={a.href} href={a.href} style={{ display: "block", padding: "12px", borderRadius: 10, background: `${a.color}0A`, border: `1px solid ${a.color}28`, color: a.color, fontSize: 11, fontWeight: 800, textDecoration: "none", textAlign: "center" }}>{a.label}</Link>
          ))}
        </div>
      </div>
    </main>
  );
}
