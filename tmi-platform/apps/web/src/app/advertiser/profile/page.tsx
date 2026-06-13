"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const ACCENT = "#FF2DAA";
const BG = "#050510";

const SEED_STATS = [
  { label: "Active Ads",   value: "6",      color: ACCENT,    icon: "📺" },
  { label: "Impressions",  value: "184K",   color: "#00FFFF", icon: "👁️" },
  { label: "CTR",          value: "3.8%",   color: "#FFD700", icon: "🖱️" },
  { label: "Budget Left",  value: "$2,450", color: "#AA2DFF", icon: "💳" },
  { label: "Conversions",  value: "822",    color: "#00FF88", icon: "✅" },
  { label: "ROAS",         value: "4.1×",   color: ACCENT,    icon: "📈" },
];

const SEED_ADS = [
  { id: "a1", name: "Homepage Magazine Inline",   surface: "Magazine / Issue Feed",      impressions: "62K", ctr: "4.2%", status: "live",   color: "#22c55e" },
  { id: "a2", name: "Battle Night Pre-Roll",      surface: "Battle / Live Room",         impressions: "38K", ctr: "5.1%", status: "live",   color: "#22c55e" },
  { id: "a3", name: "Leaderboard Takeover",       surface: "Rankings / Leaderboard",     impressions: "29K", ctr: "2.9%", status: "live",   color: "#22c55e" },
  { id: "a4", name: "NFT Lab Banner",             surface: "NFT Lab / Drop Page",        impressions: "18K", ctr: "6.0%", status: "live",   color: "#22c55e" },
  { id: "a5", name: "Artist Profile Sidebar",     surface: "Artist Profiles",            impressions: "27K", ctr: "1.8%", status: "paused", color: "#FFD700" },
  { id: "a6", name: "Season Pass Modal Ad",       surface: "Subscriptions / Checkout",   impressions: "10K", ctr: "3.3%", status: "draft",  color: "#AA2DFF" },
];

const SEED_SURFACES = [
  { label: "Magazine Inline",      placements: 3, rate: "$99 / week",  color: "#FF2DAA" },
  { label: "Arena Stage Banner",   placements: 1, rate: "$499 / event",color: "#FFD700" },
  { label: "Lobby Wall Tile",      placements: 2, rate: "$199 / week", color: "#AA2DFF" },
  { label: "Artist Profile Rail",  placements: 4, rate: "$49 / week",  color: "#00FFFF" },
];

interface MeUser { id: string; email: string; name?: string; role: string; tier?: string; }

export default function AdvertiserProfilePage() {
  const router = useRouter();
  const [user, setUser]             = useState<MeUser | null>(null);
  const [editing, setEditing]       = useState(false);
  const [brandName, setBrandName]   = useState("NovaBrand Media");
  const [bio, setBio]               = useState("Performance marketing agency specializing in music platform advertising. Maximizing reach across the TMI ecosystem.");
  const [saveStatus, setSaveStatus] = useState("");

  useEffect(() => {
    fetch("/api/auth/session", { credentials: "include" })
      .then(r => r.json())
      .then((d: { authenticated?: boolean; user?: MeUser }) => {
        if (!d.authenticated || !d.user) { router.replace("/auth"); return; }
        setUser(d.user);
        if (d.user.name) setBrandName(d.user.name);
      })
      .catch(() => router.replace("/auth"));
  }, [router]);

  if (!user) return (
    <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 40, height: 40, borderRadius: "50%", border: `3px solid ${ACCENT}`, borderTopColor: "transparent", animation: "spin 1s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const statusColor = (s: string) => s === "live" ? "#22c55e" : s === "paused" ? "#FFD700" : "#AA2DFF";

  return (
    <main style={{ minHeight: "100vh", background: BG, color: "#fff", fontFamily: "'Inter', sans-serif", paddingBottom: 80 }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      {/* Nav */}
      <nav style={{ background: "rgba(0,0,0,0.85)", borderBottom: `1px solid ${ACCENT}22`, padding: "12px 24px", display: "flex", gap: 20, alignItems: "center", overflowX: "auto", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 50 }}>
        <Link href="/home/1" style={{ fontSize: 11, fontWeight: 900, color: ACCENT, textDecoration: "none", letterSpacing: "0.12em", flexShrink: 0 }}>TMI</Link>
        <span style={{ color: "rgba(255,255,255,0.15)" }}>›</span>
        <Link href="/hub/advertiser" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Advertiser Hub</Link>
        <span style={{ color: "rgba(255,255,255,0.15)" }}>›</span>
        <span style={{ fontSize: 11, color: ACCENT, fontWeight: 700 }}>Brand Profile</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
          <Link href="/advertiser/analytics" style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Analytics</Link>
          <Link href="/settings" style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Settings</Link>
        </div>
      </nav>

      <div style={{ position: "fixed", inset: 0, background: `radial-gradient(circle at 70% 20%, ${ACCENT}07, transparent 50%)`, pointerEvents: "none", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto", padding: "32px 24px", animation: "fadeUp .4s ease" }}>

        {/* Hero card */}
        <div style={{ display: "flex", gap: 24, padding: "28px 32px", background: `linear-gradient(135deg, ${ACCENT}0E 0%, rgba(5,5,16,0.97) 100%)`, border: `1px solid ${ACCENT}28`, borderRadius: 20, marginBottom: 24, flexWrap: "wrap", alignItems: "flex-start", boxShadow: `0 8px 40px ${ACCENT}0A` }}>
          <div style={{ width: 96, height: 96, borderRadius: 18, background: `linear-gradient(135deg, ${ACCENT}, #5c0035)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 42, flexShrink: 0, boxShadow: `0 0 32px ${ACCENT}30` }}>📺</div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 9, letterSpacing: "0.25em", color: ACCENT, fontWeight: 800 }}>ADVERTISER · TMI NETWORK</span>
              <span style={{ background: `${ACCENT}20`, border: `1px solid ${ACCENT}40`, borderRadius: 4, padding: "1px 8px", fontSize: 8, color: ACCENT, fontWeight: 900 }}>VERIFIED</span>
            </div>
            <h1 style={{ margin: "0 0 6px", fontSize: "clamp(22px,3.5vw,34px)", fontWeight: 900 }}>{brandName}</h1>
            <p style={{ margin: "0 0 14px", fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, maxWidth: 520 }}>{bio}</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link href="/advertiser/buy" style={{ padding: "9px 18px", borderRadius: 8, background: ACCENT, color: "#fff", fontSize: 10, fontWeight: 900, textDecoration: "none" }}>+ LAUNCH AD</Link>
              <Link href="/advertiser/analytics" style={{ padding: "9px 18px", borderRadius: 8, background: `${ACCENT}12`, border: `1px solid ${ACCENT}35`, color: ACCENT, fontSize: 10, fontWeight: 800, textDecoration: "none" }}>📊 ANALYTICS</Link>
              <Link href="/advertiser/placements" style={{ padding: "9px 18px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", fontSize: 10, fontWeight: 800, textDecoration: "none" }}>📍 PLACEMENTS</Link>
            </div>
          </div>
          <button onClick={() => setEditing(!editing)} style={{ padding: "9px 20px", borderRadius: 9, background: `${ACCENT}14`, border: `1px solid ${ACCENT}45`, color: ACCENT, fontSize: 10, fontWeight: 800, cursor: "pointer", flexShrink: 0 }}>
            {editing ? "CANCEL" : "EDIT PROFILE"}
          </button>
        </div>

        {/* Edit form */}
        {editing && (
          <div style={{ padding: "24px", background: "rgba(255,255,255,0.02)", border: `1px solid ${ACCENT}20`, borderRadius: 16, marginBottom: 24 }}>
            <form onSubmit={async (e) => { e.preventDefault(); setSaveStatus(""); try { const r = await fetch("/api/profile/update", { method: "POST", headers: { "content-type": "application/json" }, credentials: "include", body: JSON.stringify({ displayName: brandName, bio }) }); setSaveStatus(r.ok ? "Saved!" : "Save failed."); } catch { setSaveStatus("Network error."); } }} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em", fontWeight: 800, marginBottom: 6 }}>BRAND NAME</label>
                <input type="text" value={brandName} onChange={(e) => setBrandName(e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: `1px solid ${ACCENT}20`, color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em", fontWeight: 800, marginBottom: 6 }}>BRAND DESCRIPTION</label>
                <textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: `1px solid ${ACCENT}20`, color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box", resize: "vertical" }} />
              </div>
              {[{ label: "Website" }, { label: "Contact Email" }].map((f) => (
                <div key={f.label}>
                  <label style={{ display: "block", fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em", fontWeight: 800, marginBottom: 6 }}>{f.label}</label>
                  <input type="text" style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <button type="submit" style={{ padding: "10px 24px", borderRadius: 8, background: ACCENT, color: "#fff", border: "none", fontSize: 12, fontWeight: 900, cursor: "pointer" }}>SAVE</button>
                  {saveStatus && <span style={{ fontSize: 11, color: saveStatus === "Saved!" ? "#00FF88" : "#FF4444" }}>{saveStatus}</span>}
                </div>
                <Link href="/account/deactivate" style={{ color: "#ff4444", fontSize: 11, textDecoration: "none" }}>Deactivate</Link>
              </div>
            </form>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 24 }}>
          {SEED_STATS.map((s, i) => (
            <div key={s.label} style={{ padding: "18px 16px", background: `${s.color}08`, border: `1px solid ${s.color}20`, borderRadius: 14, textAlign: "center", animation: `fadeUp .4s ease ${i * 0.06}s both` }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 9, fontWeight: 800, marginTop: 6, color: "rgba(255,255,255,0.5)", letterSpacing: "0.1em" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Active ads table */}
        <div style={{ padding: "20px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 9, letterSpacing: "0.2em", color: ACCENT, fontWeight: 800 }}>📺 ACTIVE AD SURFACES</div>
            <Link href="/advertiser/buy" style={{ fontSize: 9, color: ACCENT, textDecoration: "none", fontWeight: 700 }}>+ LAUNCH AD →</Link>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
              <thead>
                <tr style={{ color: "rgba(255,255,255,0.3)", fontSize: 9, letterSpacing: "0.1em" }}>
                  <th style={{ textAlign: "left", padding: "6px 0", fontWeight: 800 }}>AD NAME</th>
                  <th style={{ textAlign: "left", padding: "6px 0", fontWeight: 800 }}>SURFACE</th>
                  <th style={{ textAlign: "right", padding: "6px 0", fontWeight: 800 }}>IMPRESSIONS</th>
                  <th style={{ textAlign: "right", padding: "6px 0", fontWeight: 800 }}>CTR</th>
                  <th style={{ textAlign: "right", padding: "6px 0", fontWeight: 800 }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {SEED_ADS.map(a => (
                  <tr key={a.id} style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                    <td style={{ padding: "10px 0", color: "#fff", fontWeight: 600 }}>{a.name}</td>
                    <td style={{ padding: "10px 0", color: "rgba(255,255,255,0.4)" }}>{a.surface}</td>
                    <td style={{ padding: "10px 0", color: "#00FFFF", textAlign: "right" }}>{a.impressions}</td>
                    <td style={{ padding: "10px 0", color: "#FFD700", textAlign: "right" }}>{a.ctr}</td>
                    <td style={{ padding: "10px 0", textAlign: "right" }}>
                      <span style={{ fontSize: 8, fontWeight: 900, color: statusColor(a.status), background: `${statusColor(a.status)}18`, border: `1px solid ${statusColor(a.status)}40`, borderRadius: 4, padding: "2px 7px", textTransform: "uppercase" }}>{a.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Ad Surfaces */}
        <div style={{ padding: "20px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, marginBottom: 20 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "#00FFFF", fontWeight: 800, marginBottom: 14 }}>📍 AVAILABLE AD SURFACES</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
            {SEED_SURFACES.map(s => (
              <Link key={s.label} href="/advertiser/buy" style={{ padding: "14px", background: `${s.color}08`, border: `1px solid ${s.color}20`, borderRadius: 12, textDecoration: "none" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#fff", marginBottom: 6 }}>{s.label}</div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 9, color: s.color }}>{s.placements} active</span>
                  <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>{s.rate}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick nav */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 }}>
          {[
            { href: "/hub/advertiser",         label: "Ad Hub",         color: ACCENT    },
            { href: "/advertiser/buy",         label: "Buy Placement",  color: "#00FFFF" },
            { href: "/advertiser/placements",  label: "My Placements",  color: "#FFD700" },
            { href: "/advertiser/analytics",   label: "Analytics",      color: "#AA2DFF" },
            { href: "/advertiser/settings",    label: "Ad Settings",    color: "#00FF88" },
            { href: "/billing",                label: "Billing",        color: "#FF6B35" },
            { href: "/subscribe",              label: "Upgrade Plan",   color: "#FF2DAA" },
            { href: "/settings",               label: "Account",        color: "rgba(255,255,255,0.4)" },
          ].map((a) => (
            <Link key={a.href} href={a.href} style={{ display: "block", padding: "13px 12px", borderRadius: 10, background: `${a.color}0A`, border: `1px solid ${a.color}28`, color: a.color, fontSize: 11, fontWeight: 800, textDecoration: "none", textAlign: "center" }}>{a.label}</Link>
          ))}
        </div>
      </div>
    </main>
  );
}
