"use client";
import { useState } from "react";
import Link from "next/link";

const ACCENT = "#FFD700";
const BG = "#050510";

const STATS = [
  { label: "Active Campaigns", value: "7",    color: ACCENT    },
  { label: "Impressions",      value: "2.4M", color: "#00FFFF" },
  { label: "Artists Backed",   value: "18",   color: "#AA2DFF" },
  { label: "Budget Deployed",  value: "$42K", color: "#FF2DAA" },
  { label: "Avg Engagement",   value: "8.3%", color: "#00FF88" },
  { label: "ROI",              value: "3.7×", color: ACCENT    },
];

const TOP_ARTISTS = [
  { name: "Nova Cipher", genre: "EDM",     ctr: "9.4%", slug: "nova-cipher", color: "#FFD700" },
  { name: "Astra Nova",  genre: "R&B",     ctr: "8.1%", slug: "astra-nova",  color: "#FF2DAA" },
  { name: "Zion Freq",   genre: "Hip-Hop", ctr: "7.8%", slug: "zion-freq",   color: "#00FFFF" },
];

const ACTIVE_CAMPAIGNS = [
  { name: "Season 2 Launch",     budget: "$8K",  status: "live",   reach: "620K" },
  { name: "Battle Week Sponsor", budget: "$5K",  status: "live",   reach: "380K" },
  { name: "Magazine Feature",    budget: "$3.2K", status: "paused", reach: "140K" },
];

export default function SponsorProfilePage() {
  const [editing, setEditing] = useState(false);
  const [brandName, setBrandName] = useState("BerntGlobal Records");
  const [bio, setBio] = useState("Official TMI platform sponsor. Supporting emerging artists across Hip-Hop, EDM, and R&B.");

  return (
    <main style={{ minHeight: "100vh", background: BG, color: "#fff", fontFamily: "'Inter', sans-serif", paddingBottom: 80 }}>
      <nav style={{ background: "rgba(0,0,0,0.8)", borderBottom: `1px solid ${ACCENT}22`, padding: "12px 24px", display: "flex", gap: 20, alignItems: "center", overflowX: "auto", backdropFilter: "blur(12px)" }}>
        <Link href="/home/1" style={{ fontSize: 11, fontWeight: 900, color: ACCENT, textDecoration: "none", letterSpacing: "0.12em", flexShrink: 0 }}>TMI</Link>
        <Link href="/hub/sponsor" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Sponsor Hub</Link>
        <span style={{ fontSize: 11, color: ACCENT, fontWeight: 700 }}>Brand Profile</span>
        <Link href="/settings" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none", marginLeft: "auto" }}>Settings</Link>
      </nav>
      <div style={{ position: "fixed", inset: 0, background: `radial-gradient(circle at 70% 15%, ${ACCENT}07, transparent 50%)`, pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "relative", zIndex: 1, maxWidth: 1000, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ display: "flex", gap: 24, padding: "28px", background: `linear-gradient(135deg, ${ACCENT}10, rgba(5,5,16,0.95))`, border: `1px solid ${ACCENT}28`, borderRadius: 20, marginBottom: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
          <div style={{ width: 88, height: 88, borderRadius: 14, background: `linear-gradient(135deg, ${ACCENT}, #AA2DFF)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, flexShrink: 0 }}>🤝</div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 9, letterSpacing: "0.25em", color: ACCENT, fontWeight: 800, marginBottom: 4 }}>SPONSOR · TMI PARTNER</div>
            <h1 style={{ margin: "0 0 6px", fontSize: "clamp(20px,3.5vw,30px)", fontWeight: 900 }}>{brandName}</h1>
            <p style={{ margin: "0 0 12px", fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>{bio}</p>
            <div style={{ display: "flex", gap: 10 }}>
              <Link href="/sponsor/campaigns" style={{ padding: "8px 16px", borderRadius: 8, background: `${ACCENT}12`, border: `1px solid ${ACCENT}35`, color: ACCENT, fontSize: 10, fontWeight: 800, textDecoration: "none" }}>+ NEW CAMPAIGN</Link>
              <Link href="/giveaway" style={{ padding: "8px 16px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", fontSize: 10, fontWeight: 800, textDecoration: "none" }}>🎁 GIVEAWAY</Link>
            </div>
          </div>
          <button onClick={() => setEditing(!editing)} style={{ padding: "9px 20px", borderRadius: 9, background: `${ACCENT}14`, border: `1px solid ${ACCENT}45`, color: ACCENT, fontSize: 10, fontWeight: 800, cursor: "pointer", flexShrink: 0 }}>
            {editing ? "CANCEL" : "EDIT PROFILE"}
          </button>
        </div>
        {editing && (
          <div style={{ padding: "24px", background: "rgba(255,255,255,0.02)", border: `1px solid ${ACCENT}20`, borderRadius: 16, marginBottom: 24 }}>
            <form action="/api/profile/update" method="POST" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[{ label: "Brand Name", name: "brandName", val: brandName, setter: setBrandName }].map((f) => (
                <div key={f.name}>
                  <label style={{ display: "block", fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em", fontWeight: 800, marginBottom: 6 }}>{f.label}</label>
                  <input type="text" name={f.name} value={f.val} onChange={(e) => f.setter(e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: `1px solid ${ACCENT}20`, color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                </div>
              ))}
              <div>
                <label style={{ display: "block", fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em", fontWeight: 800, marginBottom: 6 }}>BRAND DESCRIPTION</label>
                <textarea rows={3} name="bio" value={bio} onChange={(e) => setBio(e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: `1px solid ${ACCENT}20`, color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box", resize: "vertical" }} />
              </div>
              {[{ label: "Website", name: "website" }, { label: "Contact Email", name: "email" }, { label: "Industry", name: "industry" }].map((f) => (
                <div key={f.name}>
                  <label style={{ display: "block", fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em", fontWeight: 800, marginBottom: 6 }}>{f.label}</label>
                  <input type="text" name={f.name} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button type="submit" style={{ padding: "10px 24px", borderRadius: 8, background: ACCENT, color: BG, border: "none", fontSize: 12, fontWeight: 900, cursor: "pointer" }}>SAVE</button>
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
            <div style={{ fontSize: 9, letterSpacing: "0.2em", color: ACCENT, fontWeight: 800, marginBottom: 12 }}>ACTIVE CAMPAIGNS</div>
            {ACTIVE_CAMPAIGNS.map((c) => (
              <div key={c.name} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div><div style={{ fontSize: 12, fontWeight: 700 }}>{c.name}</div><div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>{c.reach} reach · {c.budget}</div></div>
                <span style={{ fontSize: 8, fontWeight: 900, padding: "2px 8px", borderRadius: 4, alignSelf: "center", background: c.status === "live" ? "rgba(0,255,136,0.12)" : "rgba(255,255,255,0.06)", color: c.status === "live" ? "#00FF88" : "rgba(255,255,255,0.4)", border: `1px solid ${c.status === "live" ? "rgba(0,255,136,0.3)" : "rgba(255,255,255,0.1)"}` }}>{c.status.toUpperCase()}</span>
              </div>
            ))}
          </div>
          <div style={{ padding: "18px 20px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14 }}>
            <div style={{ fontSize: 9, letterSpacing: "0.2em", color: ACCENT, fontWeight: 800, marginBottom: 12 }}>SPONSORED ARTISTS</div>
            {TOP_ARTISTS.map((a) => (
              <Link key={a.slug} href={`/artist/${a.slug}`} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", textDecoration: "none", color: "#fff" }}>
                <span style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg, ${a.color}, ${BG})`, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🎤</span>
                <div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 700 }}>{a.name}</div><div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>{a.genre}</div></div>
                <span style={{ fontSize: 10, color: a.color, fontWeight: 800 }}>{a.ctr} CTR</span>
              </Link>
            ))}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 }}>
          {[
            { href: "/hub/sponsor",        label: "Sponsor Hub",   color: ACCENT    },
            { href: "/sponsor/campaigns",  label: "Campaigns",     color: "#00FFFF" },
            { href: "/sponsor/placements", label: "Placements",    color: "#AA2DFF" },
            { href: "/giveaway",           label: "Giveaway",      color: "#FF2DAA" },
            { href: "/sponsor/analytics",  label: "Analytics",     color: "#00FF88" },
            { href: "/billing",            label: "Billing",       color: "#FF6B35" },
          ].map((a) => (<Link key={a.href} href={a.href} style={{ display: "block", padding: "12px", borderRadius: 10, background: `${a.color}0A`, border: `1px solid ${a.color}28`, color: a.color, fontSize: 11, fontWeight: 800, textDecoration: "none", textAlign: "center" }}>{a.label}</Link>))}
        </div>
      </div>
    </main>
  );
}
