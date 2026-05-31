"use client";
import { useState } from "react";
import Link from "next/link";

const ACCENT = "#FF2DAA";
const BG = "#050510";

const STATS = [
  { label: "Monthly Listeners", value: "94K",   color: ACCENT    },
  { label: "Rank",              value: "#1",     color: "#FFD700" },
  { label: "Battle Record",     value: "22–3",   color: "#00FFFF" },
  { label: "Streams",           value: "2.1M",   color: "#AA2DFF" },
  { label: "Magazine Features", value: "6",      color: "#00FF88" },
  { label: "Fan Following",     value: "12.4K",  color: ACCENT    },
];

const DISCOGRAPHY = [
  { title: "Neon Cipher Vol. 3",   type: "EP",          year: "2026", streams: "420K" },
  { title: "Crown Season 1",       type: "Single",      year: "2026", streams: "310K" },
  { title: "Live From TMI Arena",  type: "Live Album",  year: "2025", streams: "680K" },
  { title: "Frequency Override",   type: "Album",       year: "2025", streams: "890K" },
];

const SOCIAL = [
  { platform: "Instagram", handle: "@nova_cipher_edm", color: "#FF2DAA" },
  { platform: "X / Twitter", handle: "@novacipherofficial", color: "#00FFFF" },
  { platform: "YouTube",   handle: "Nova Cipher Music", color: "#FFD700" },
  { platform: "SoundCloud", handle: "novacipherbeats", color: "#FF6B35" },
];

export default function ArtistProfilePage() {
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState("Nova Cipher");
  const [bio, setBio] = useState("Multi-genre artist, battle champion, and TMI Crown holder. EDM · Hip-Hop · Live Performance. Booking: nova@tmi.com");

  return (
    <main style={{ minHeight: "100vh", background: BG, color: "#fff", fontFamily: "'Inter', sans-serif", paddingBottom: 80 }}>
      <nav style={{ background: "rgba(0,0,0,0.8)", borderBottom: `1px solid ${ACCENT}22`, padding: "12px 24px", display: "flex", gap: 20, alignItems: "center", overflowX: "auto", backdropFilter: "blur(12px)" }}>
        <Link href="/home/1" style={{ fontSize: 11, fontWeight: 900, color: ACCENT, textDecoration: "none", letterSpacing: "0.12em", flexShrink: 0 }}>TMI</Link>
        <Link href="/hub/performer" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Artist Hub</Link>
        <span style={{ fontSize: 11, color: ACCENT, fontWeight: 700 }}>Artist Profile</span>
        <Link href="/settings" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none", marginLeft: "auto" }}>Settings</Link>
      </nav>
      <div style={{ position: "fixed", inset: 0, background: `radial-gradient(circle at 65% 20%, ${ACCENT}08, transparent 50%)`, pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "relative", zIndex: 1, maxWidth: 1000, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ display: "flex", gap: 24, padding: "28px", background: `linear-gradient(135deg, ${ACCENT}0E, rgba(5,5,16,0.95))`, border: `1px solid ${ACCENT}28`, borderRadius: 20, marginBottom: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
          <div style={{ width: 88, height: 88, borderRadius: "50%", background: `linear-gradient(135deg, ${ACCENT}, #AA2DFF)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, flexShrink: 0, boxShadow: `0 0 28px ${ACCENT}40` }}>🎨</div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
              <div style={{ fontSize: 9, letterSpacing: "0.25em", color: ACCENT, fontWeight: 800 }}>ARTIST · CROWN HOLDER</div>
              <span style={{ padding: "2px 8px", borderRadius: 4, background: "rgba(255,215,0,0.15)", border: "1px solid rgba(255,215,0,0.35)", color: "#FFD700", fontSize: 8, fontWeight: 900 }}>👑 RANK #1</span>
            </div>
            <h1 style={{ margin: "0 0 6px", fontSize: "clamp(22px,4vw,34px)", fontWeight: 900 }}>{displayName}</h1>
            <p style={{ margin: "0 0 12px", fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.5, maxWidth: 480 }}>{bio}</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["EDM", "Hip-Hop", "Battle Artist", "Live Performance"].map((g) => <span key={g} style={{ padding: "3px 10px", borderRadius: 20, fontSize: 9, fontWeight: 700, background: `${ACCENT}18`, border: `1px solid ${ACCENT}35`, color: ACCENT }}>{g}</span>)}
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
                <label style={{ display: "block", fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em", fontWeight: 800, marginBottom: 6 }}>ARTIST NAME</label>
                <input type="text" name="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: `1px solid ${ACCENT}20`, color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em", fontWeight: 800, marginBottom: 6 }}>BIO</label>
                <textarea rows={3} name="bio" value={bio} onChange={(e) => setBio(e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: `1px solid ${ACCENT}20`, color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box", resize: "vertical" }} />
              </div>
              {[{ label: "Instagram", name: "instagram" }, { label: "YouTube", name: "youtube" }, { label: "SoundCloud", name: "soundcloud" }, { label: "Booking Email", name: "bookingEmail" }].map((f) => (
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
            <div style={{ fontSize: 9, letterSpacing: "0.2em", color: ACCENT, fontWeight: 800, marginBottom: 12 }}>DISCOGRAPHY</div>
            {DISCOGRAPHY.map((d) => (
              <div key={d.title} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div><div style={{ fontSize: 12, fontWeight: 700 }}>{d.title}</div><div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>{d.type} · {d.year}</div></div>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", alignSelf: "center" }}>{d.streams}</span>
              </div>
            ))}
          </div>
          <div style={{ padding: "18px 20px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14 }}>
            <div style={{ fontSize: 9, letterSpacing: "0.2em", color: ACCENT, fontWeight: 800, marginBottom: 12 }}>SOCIAL LINKS</div>
            {SOCIAL.map((s) => (
              <div key={s.platform} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: s.color }}>{s.platform}</span>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{s.handle}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 }}>
          {[
            { href: "/hub/performer",    label: "Performer Hub",  color: ACCENT    },
            { href: "/battles/new",      label: "New Challenge",  color: "#FFD700" },
            { href: "/beat-vault",       label: "Beat Vault",     color: "#00FFFF" },
            { href: "/nft/mint",         label: "Mint NFT",       color: "#AA2DFF" },
            { href: "/performer/studio", label: "Go Live",        color: "#00FF88" },
            { href: "/magazine",         label: "Magazine",       color: "#FF6B35" },
          ].map((a) => (<Link key={a.href} href={a.href} style={{ display: "block", padding: "12px", borderRadius: 10, background: `${a.color}0A`, border: `1px solid ${a.color}28`, color: a.color, fontSize: 11, fontWeight: 800, textDecoration: "none", textAlign: "center" }}>{a.label}</Link>))}
        </div>
      </div>
    </main>
  );
}
