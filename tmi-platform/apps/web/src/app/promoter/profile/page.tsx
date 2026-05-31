"use client";
import { useState } from "react";
import Link from "next/link";

const ACCENT = "#FF6B35";
const BG = "#050510";

const STATS = [
  { label: "Events Hosted",   value: "34",    color: ACCENT    },
  { label: "Tickets Sold",    value: "8,240", color: "#00FFFF" },
  { label: "Artists Managed", value: "12",    color: "#AA2DFF" },
  { label: "Revenue (Total)", value: "$94K",  color: "#FFD700" },
  { label: "Active Campaigns",value: "5",     color: "#00FF88" },
  { label: "Avg Attendance",  value: "78%",   color: ACCENT    },
];

const MANAGED_ARTISTS = [
  { name: "Nova Cipher", genre: "EDM",       slug: "nova-cipher", color: "#FFD700" },
  { name: "Zion Freq",   genre: "Hip-Hop",   slug: "zion-freq",   color: "#00FFFF" },
  { name: "Astra Nova",  genre: "R&B",       slug: "astra-nova",  color: "#FF2DAA" },
  { name: "DJ Lumi",     genre: "House",     slug: "dj-lumi",     color: "#AA2DFF" },
];

const UPCOMING_EVENTS = [
  { title: "Summer Cypher Series",  date: "Jun 10 · TMI Arena",  href: "/shows/summer-cypher"   },
  { title: "Battle Week Vol. 3",    date: "Jun 17 · Main Stage", href: "/shows/battle-week-v3"  },
  { title: "Season 2 Launch Party", date: "Jul 1 · World Stage", href: "/shows/s2-launch"       },
];

export default function PromoterProfilePage() {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("Next Level Promos");
  const [bio, setBio] = useState("Full-service music promotion agency on TMI. Specializing in battle shows, cyphers, and world-stage events.");

  return (
    <main style={{ minHeight: "100vh", background: BG, color: "#fff", fontFamily: "'Inter', sans-serif", paddingBottom: 80 }}>
      <nav style={{ background: "rgba(0,0,0,0.8)", borderBottom: `1px solid ${ACCENT}22`, padding: "12px 24px", display: "flex", gap: 20, alignItems: "center", overflowX: "auto", backdropFilter: "blur(12px)" }}>
        <Link href="/home/1" style={{ fontSize: 11, fontWeight: 900, color: ACCENT, textDecoration: "none", letterSpacing: "0.12em", flexShrink: 0 }}>TMI</Link>
        <Link href="/hub/promoter" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Promoter Hub</Link>
        <span style={{ fontSize: 11, color: ACCENT, fontWeight: 700 }}>Agency Profile</span>
        <Link href="/settings" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none", marginLeft: "auto" }}>Settings</Link>
      </nav>
      <div style={{ position: "fixed", inset: 0, background: `radial-gradient(circle at 60% 20%, ${ACCENT}07, transparent 50%)`, pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "relative", zIndex: 1, maxWidth: 1000, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ display: "flex", gap: 24, padding: "28px", background: `linear-gradient(135deg, ${ACCENT}0E, rgba(5,5,16,0.95))`, border: `1px solid ${ACCENT}28`, borderRadius: 20, marginBottom: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
          <div style={{ width: 88, height: 88, borderRadius: 14, background: `linear-gradient(135deg, ${ACCENT}, #AA2DFF)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, flexShrink: 0 }}>📢</div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 9, letterSpacing: "0.25em", color: ACCENT, fontWeight: 800, marginBottom: 4 }}>PROMOTER · TMI CERTIFIED AGENCY</div>
            <h1 style={{ margin: "0 0 6px", fontSize: "clamp(20px,3.5vw,30px)", fontWeight: 900 }}>{name}</h1>
            <p style={{ margin: "0 0 12px", fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>{bio}</p>
            <div style={{ display: "flex", gap: 10 }}>
              <Link href="/hub/promoter" style={{ padding: "8px 16px", borderRadius: 8, background: `${ACCENT}12`, border: `1px solid ${ACCENT}35`, color: ACCENT, fontSize: 10, fontWeight: 800, textDecoration: "none" }}>+ CREATE EVENT</Link>
            </div>
          </div>
          <button onClick={() => setEditing(!editing)} style={{ padding: "9px 20px", borderRadius: 9, background: `${ACCENT}14`, border: `1px solid ${ACCENT}45`, color: ACCENT, fontSize: 10, fontWeight: 800, cursor: "pointer", flexShrink: 0 }}>
            {editing ? "CANCEL" : "EDIT PROFILE"}
          </button>
        </div>
        {editing && (
          <div style={{ padding: "24px", background: "rgba(255,255,255,0.02)", border: `1px solid ${ACCENT}20`, borderRadius: 16, marginBottom: 24 }}>
            <form action="/api/profile/update" method="POST" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em", fontWeight: 800, marginBottom: 6 }}>AGENCY NAME</label>
                <input type="text" name="name" value={name} onChange={(e) => setName(e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: `1px solid ${ACCENT}20`, color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em", fontWeight: 800, marginBottom: 6 }}>DESCRIPTION</label>
                <textarea rows={3} name="bio" value={bio} onChange={(e) => setBio(e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: `1px solid ${ACCENT}20`, color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box", resize: "vertical" }} />
              </div>
              {[{ label: "Contact Email", name: "email" }, { label: "Website", name: "website" }].map((f) => (
                <div key={f.name}>
                  <label style={{ display: "block", fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em", fontWeight: 800, marginBottom: 6 }}>{f.label}</label>
                  <input type="text" name={f.name} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button type="submit" style={{ padding: "10px 24px", borderRadius: 8, background: ACCENT, color: "#fff", border: "none", fontSize: 12, fontWeight: 900, cursor: "pointer" }}>SAVE</button>
                <Link href="/account/deactivate" style={{ color: "#ff4444", fontSize: 11, textDecoration: "none" }}>Deactivate</Link>
              </div>
            </form>
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, marginBottom: 24 }}>
          {STATS.map((s) => (<div key={s.label} style={{ padding: "16px", background: `${s.color}08`, border: `1px solid ${s.color}20`, borderRadius: 12, textAlign: "center" }}><div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</div><div style={{ fontSize: 9, fontWeight: 800, marginTop: 5 }}>{s.label}</div></div>))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
          <div style={{ padding: "18px 20px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14 }}>
            <div style={{ fontSize: 9, letterSpacing: "0.2em", color: ACCENT, fontWeight: 800, marginBottom: 12 }}>MANAGED ARTISTS</div>
            {MANAGED_ARTISTS.map((a) => (
              <Link key={a.slug} href={`/artist/${a.slug}`} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", textDecoration: "none", color: "#fff" }}>
                <span style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg, ${a.color}, ${BG})`, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🎤</span>
                <div><div style={{ fontSize: 12, fontWeight: 700 }}>{a.name}</div><div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>{a.genre}</div></div>
              </Link>
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
            { href: "/hub/promoter",       label: "Promoter Hub",    color: ACCENT    },
            { href: "/promoter/dashboard", label: "Dashboard",       color: "#00FFFF" },
            { href: "/tickets/print",      label: "Print Tickets",   color: "#FFD700" },
            { href: "/billing",            label: "Billing",         color: "#AA2DFF" },
            { href: "/messages",           label: "Messages",        color: "#00FF88" },
            { href: "/settings",           label: "Settings",        color: "#FF6B35" },
          ].map((a) => (<Link key={a.href} href={a.href} style={{ display: "block", padding: "12px", borderRadius: 10, background: `${a.color}0A`, border: `1px solid ${a.color}28`, color: a.color, fontSize: 11, fontWeight: 800, textDecoration: "none", textAlign: "center" }}>{a.label}</Link>))}
        </div>
      </div>
    </main>
  );
}
