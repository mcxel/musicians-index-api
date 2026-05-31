"use client";

import { useState } from "react";
import Link from "next/link";

const ACCENT = "#00FFFF";
const BG = "#050510";

const STATS = [
  { label: "Fan Tier",       value: "GOLD",   color: "#FFD700" },
  { label: "XP Points",      value: "4,200",  color: ACCENT    },
  { label: "Artists Followed", value: "24",   color: "#FF2DAA" },
  { label: "Votes Cast",     value: "186",    color: "#00FF88" },
  { label: "Collectibles",   value: "12",     color: "#AA2DFF" },
  { label: "Watch Hours",    value: "340h",   color: "#FFD700" },
];

const FOLLOWED_ARTISTS = [
  { name: "Nova Cipher", genre: "EDM",       slug: "nova-cipher", color: "#FFD700" },
  { name: "Astra Nova",  genre: "R&B",       slug: "astra-nova",  color: "#FF2DAA" },
  { name: "Zion Freq",   genre: "Hip-Hop",   slug: "zion-freq",   color: ACCENT    },
  { name: "DJ Lumi",     genre: "House",     slug: "dj-lumi",     color: "#AA2DFF" },
];

const RECENT_ACTIVITY = [
  { action: "Voted for Nova Cipher",  time: "2h ago",  icon: "🗳️" },
  { action: "Watched Cypher Arena",   time: "5h ago",  icon: "👁️" },
  { action: "Tipped Astra Nova",      time: "1d ago",  icon: "💎" },
  { action: "Earned 10-Vote Badge",   time: "2d ago",  icon: "🏆" },
];

const UPCOMING = [
  { title: "Nova Cipher LIVE",   time: "Tonight · 9PM ET",  href: "/shows/nova-cipher-live"  },
  { title: "Cypher Arena Open",  time: "Jun 7 · 7PM ET",    href: "/shows/cypher-arena-open" },
  { title: "Season 2 Finals",    time: "Jun 20 · 8PM ET",   href: "/shows/season-2-finals"   },
];

export default function FanProfilePage() {
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState("CrowdKing_47");
  const [bio, setBio] = useState("Fan since Season 1. Gold tier member. Nova Cipher's biggest supporter. Cypher junkie.");

  return (
    <main style={{ minHeight: "100vh", background: BG, color: "#fff", fontFamily: "'Inter', sans-serif", paddingBottom: 80 }}>
      <nav style={{ background: "rgba(0,0,0,0.8)", borderBottom: `1px solid ${ACCENT}22`, padding: "12px 24px", display: "flex", gap: 20, alignItems: "center", overflowX: "auto", backdropFilter: "blur(12px)" }}>
        <Link href="/home/1" style={{ fontSize: 11, fontWeight: 900, color: ACCENT, textDecoration: "none", letterSpacing: "0.12em", flexShrink: 0 }}>TMI</Link>
        <Link href="/hub/fan" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Fan Hub</Link>
        <Link href="/vote" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Vote</Link>
        <span style={{ fontSize: 11, color: ACCENT, fontWeight: 700 }}>My Profile</span>
        <Link href="/settings" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none", marginLeft: "auto" }}>Settings</Link>
      </nav>

      <div style={{ position: "fixed", inset: 0, background: `radial-gradient(circle at 30% 20%, ${ACCENT}08, transparent 50%)`, pointerEvents: "none", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1000, margin: "0 auto", padding: "32px 24px" }}>

        {/* Profile hero */}
        <div style={{ display: "flex", gap: 24, alignItems: "flex-start", padding: "28px", background: `linear-gradient(135deg, ${ACCENT}0E, rgba(5,5,16,0.95))`, border: `1px solid ${ACCENT}28`, borderRadius: 20, marginBottom: 24, flexWrap: "wrap" }}>
          <div style={{ width: 88, height: 88, borderRadius: "50%", background: `linear-gradient(135deg, ${ACCENT}, #AA2DFF)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, flexShrink: 0 }}>⭐</div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
              <div style={{ fontSize: 9, letterSpacing: "0.25em", color: ACCENT, fontWeight: 800 }}>FAN · GOLD TIER</div>
              <span style={{ padding: "2px 8px", borderRadius: 4, background: "rgba(255,215,0,0.15)", border: "1px solid rgba(255,215,0,0.35)", color: "#FFD700", fontSize: 8, fontWeight: 900, letterSpacing: "0.1em" }}>GOLD</span>
            </div>
            <h1 style={{ margin: "0 0 6px", fontSize: "clamp(22px,4vw,32px)", fontWeight: 900 }}>{displayName}</h1>
            <p style={{ margin: "0 0 12px", fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.5, maxWidth: 480 }}>{bio}</p>
            <div style={{ display: "flex", gap: 16 }}>
              <Link href="/vote" style={{ padding: "8px 18px", borderRadius: 8, background: `${ACCENT}12`, border: `1px solid ${ACCENT}35`, color: ACCENT, fontSize: 10, fontWeight: 800, textDecoration: "none" }}>🗳️ VOTE NOW</Link>
              <Link href="/season-pass" style={{ padding: "8px 18px", borderRadius: 8, background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.3)", color: "#FFD700", fontSize: 10, fontWeight: 800, textDecoration: "none" }}>🎫 SEASON PASS</Link>
            </div>
          </div>
          <button onClick={() => setEditing(!editing)} style={{ padding: "9px 20px", borderRadius: 9, background: `${ACCENT}14`, border: `1px solid ${ACCENT}45`, color: ACCENT, fontSize: 10, fontWeight: 800, cursor: "pointer", letterSpacing: "0.08em", flexShrink: 0 }}>
            {editing ? "CANCEL" : "EDIT PROFILE"}
          </button>
        </div>

        {/* Edit form */}
        {editing && (
          <div style={{ padding: "24px", background: "rgba(255,255,255,0.02)", border: `1px solid ${ACCENT}20`, borderRadius: 16, marginBottom: 24 }}>
            <div style={{ fontSize: 9, letterSpacing: "0.22em", color: ACCENT, fontWeight: 800, marginBottom: 16 }}>EDIT PROFILE</div>
            <form action="/api/profile/update" method="POST" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[{ label: "Display Name", name: "displayName", val: displayName, setter: setDisplayName }].map((f) => (
                <div key={f.name}>
                  <label style={{ display: "block", fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em", fontWeight: 800, marginBottom: 6 }}>{f.label}</label>
                  <input type="text" name={f.name} value={f.val} onChange={(e) => f.setter(e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: `1px solid ${ACCENT}20`, color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                </div>
              ))}
              <div>
                <label style={{ display: "block", fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em", fontWeight: 800, marginBottom: 6 }}>BIO</label>
                <textarea name="bio" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: `1px solid ${ACCENT}20`, color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box", resize: "vertical" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <button type="submit" style={{ padding: "10px 24px", borderRadius: 8, background: ACCENT, color: BG, border: "none", fontSize: 12, fontWeight: 900, cursor: "pointer" }}>SAVE</button>
                <Link href="/account/deactivate" style={{ color: "#ff4444", fontSize: 11, textDecoration: "none" }}>Deactivate Account</Link>
              </div>
            </form>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, marginBottom: 24 }}>
          {STATS.map((s) => (
            <div key={s.label} style={{ padding: "16px", background: `${s.color}08`, border: `1px solid ${s.color}20`, borderRadius: 12, textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 9, fontWeight: 800, marginTop: 5, letterSpacing: "0.06em" }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 20 }}>
          {/* Followed artists */}
          <div style={{ padding: "18px 20px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14 }}>
            <div style={{ fontSize: 9, letterSpacing: "0.2em", color: ACCENT, fontWeight: 800, marginBottom: 12 }}>FOLLOWING</div>
            {FOLLOWED_ARTISTS.map((a) => (
              <Link key={a.slug} href={`/artist/${a.slug}`} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", textDecoration: "none", color: "#fff" }}>
                <span style={{ width: 28, height: 28, borderRadius: "50%", background: `linear-gradient(135deg, ${a.color}, ${BG})`, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>🎤</span>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700 }}>{a.name}</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>{a.genre}</div>
                </div>
              </Link>
            ))}
          </div>

          {/* Activity */}
          <div style={{ padding: "18px 20px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14 }}>
            <div style={{ fontSize: 9, letterSpacing: "0.2em", color: ACCENT, fontWeight: 800, marginBottom: 12 }}>RECENT ACTIVITY</div>
            {RECENT_ACTIVITY.map((a, i) => (
              <div key={i} style={{ display: "flex", gap: 10, padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>{a.icon}</span>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600 }}>{a.action}</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>{a.time}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Upcoming */}
          <div style={{ padding: "18px 20px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14 }}>
            <div style={{ fontSize: 9, letterSpacing: "0.2em", color: ACCENT, fontWeight: 800, marginBottom: 12 }}>UPCOMING SHOWS</div>
            {UPCOMING.map((u) => (
              <Link key={u.href} href={u.href} style={{ display: "block", padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", textDecoration: "none", color: "#fff" }}>
                <div style={{ fontSize: 11, fontWeight: 700 }}>{u.title}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>{u.time}</div>
              </Link>
            ))}
            <Link href="/shows" style={{ display: "block", marginTop: 12, padding: "8px 0", textAlign: "center", borderRadius: 8, background: `${ACCENT}0E`, border: `1px solid ${ACCENT}25`, color: ACCENT, fontSize: 10, fontWeight: 800, textDecoration: "none" }}>ALL SHOWS →</Link>
          </div>
        </div>

        {/* Action grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 }}>
          {[
            { href: "/hub/fan",         label: "Fan Hub",         color: ACCENT    },
            { href: "/vote",            label: "Vote Now",         color: "#FFD700" },
            { href: "/rankings",        label: "Rankings",         color: "#FF2DAA" },
            { href: "/season-pass",     label: "Season Pass",      color: "#AA2DFF" },
            { href: "/achievements",    label: "Achievements",     color: "#00FF88" },
            { href: "/fan/theater",     label: "Fan Theater",      color: "#FF6B35" },
          ].map((a) => (
            <Link key={a.href} href={a.href} style={{ display: "block", padding: "12px", borderRadius: 10, background: `${a.color}0A`, border: `1px solid ${a.color}28`, color: a.color, fontSize: 11, fontWeight: 800, textDecoration: "none", textAlign: "center" }}>
              {a.label}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
