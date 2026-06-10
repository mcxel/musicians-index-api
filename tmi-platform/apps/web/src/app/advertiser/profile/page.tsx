"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const ACCENT = "#FF2DAA";
const BG = "#050510";

const STATS = [
  { label: "Active Ads",  value: "0",  color: ACCENT    },
  { label: "Impressions", value: "0",  color: "#00FFFF" },
  { label: "CTR",         value: "—",  color: "#FFD700" },
  { label: "Budget Left", value: "$0", color: "#AA2DFF" },
  { label: "Conversions", value: "0",  color: "#00FF88" },
  { label: "ROAS",        value: "—",  color: ACCENT    },
];

interface MeUser { id: string; email: string; name?: string; role: string; tier?: string; }

export default function AdvertiserProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<MeUser | null>(null);
  const [editing, setEditing] = useState(false);
  const [brandName, setBrandName] = useState("");
  const [bio, setBio] = useState("");
  const [saveStatus, setSaveStatus] = useState("");

  useEffect(() => {
    fetch("/api/auth/session", { credentials: "include" })
      .then(r => r.json())
      .then((d: { authenticated?: boolean; user?: MeUser }) => {
        if (!d.authenticated || !d.user) { router.replace("/auth"); return; }
        setUser(d.user);
        setBrandName(d.user.name ?? d.user.email.split("@")[0] ?? "");
      })
      .catch(() => router.replace("/auth"));
  }, [router]);

  if (!user) return null;

  return (
    <main style={{ minHeight: "100vh", background: BG, color: "#fff", fontFamily: "'Inter', sans-serif", paddingBottom: 80 }}>
      <nav style={{ background: "rgba(0,0,0,0.8)", borderBottom: `1px solid ${ACCENT}22`, padding: "12px 24px", display: "flex", gap: 20, alignItems: "center", overflowX: "auto", backdropFilter: "blur(12px)" }}>
        <Link href="/home/1" style={{ fontSize: 11, fontWeight: 900, color: ACCENT, textDecoration: "none", letterSpacing: "0.12em", flexShrink: 0 }}>TMI</Link>
        <Link href="/hub/advertiser" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Advertiser Hub</Link>
        <span style={{ fontSize: 11, color: ACCENT, fontWeight: 700 }}>Brand Profile</span>
        <Link href="/settings" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none", marginLeft: "auto" }}>Settings</Link>
      </nav>
      <div style={{ position: "fixed", inset: 0, background: `radial-gradient(circle at 70% 20%, ${ACCENT}07, transparent 50%)`, pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "relative", zIndex: 1, maxWidth: 1000, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ display: "flex", gap: 24, padding: "28px", background: `linear-gradient(135deg, ${ACCENT}0E, rgba(5,5,16,0.95))`, border: `1px solid ${ACCENT}28`, borderRadius: 20, marginBottom: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
          <div style={{ width: 88, height: 88, borderRadius: 14, background: `linear-gradient(135deg, ${ACCENT}, #050510)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, flexShrink: 0 }}>📺</div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 9, letterSpacing: "0.25em", color: ACCENT, fontWeight: 800, marginBottom: 4 }}>ADVERTISER · TMI NETWORK</div>
            <h1 style={{ margin: "0 0 6px", fontSize: "clamp(20px,3.5vw,30px)", fontWeight: 900 }}>{brandName}</h1>
            <p style={{ margin: "0 0 12px", fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>{bio}</p>
            <div style={{ display: "flex", gap: 10 }}>
              <Link href="/advertiser/campaigns" style={{ padding: "8px 16px", borderRadius: 8, background: `${ACCENT}12`, border: `1px solid ${ACCENT}35`, color: ACCENT, fontSize: 10, fontWeight: 800, textDecoration: "none" }}>+ LAUNCH AD</Link>
              <Link href="/advertiser/analytics" style={{ padding: "8px 16px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", fontSize: 10, fontWeight: 800, textDecoration: "none" }}>📊 ANALYTICS</Link>
            </div>
          </div>
          <button onClick={() => setEditing(!editing)} style={{ padding: "9px 20px", borderRadius: 9, background: `${ACCENT}14`, border: `1px solid ${ACCENT}45`, color: ACCENT, fontSize: 10, fontWeight: 800, cursor: "pointer", flexShrink: 0 }}>
            {editing ? "CANCEL" : "EDIT PROFILE"}
          </button>
        </div>
        {editing && (
          <div style={{ padding: "24px", background: "rgba(255,255,255,0.02)", border: `1px solid ${ACCENT}20`, borderRadius: 16, marginBottom: 24 }}>
            <form onSubmit={async (e) => { e.preventDefault(); setSaveStatus(""); try { const r = await fetch("/api/profile/update", { method: "POST", headers: { "content-type": "application/json" }, credentials: "include", body: JSON.stringify({ displayName: brandName, bio }) }); setSaveStatus(r.ok ? "Saved!" : "Save failed."); } catch { setSaveStatus("Network error."); } }} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em", fontWeight: 800, marginBottom: 6 }}>BRAND NAME</label>
                <input type="text" name="brandName" value={brandName} onChange={(e) => setBrandName(e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: `1px solid ${ACCENT}20`, color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em", fontWeight: 800, marginBottom: 6 }}>BRAND DESCRIPTION</label>
                <textarea rows={3} name="bio" value={bio} onChange={(e) => setBio(e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: `1px solid ${ACCENT}20`, color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box", resize: "vertical" }} />
              </div>
              {[{ label: "Website", name: "website" }, { label: "Contact Email", name: "email" }].map((f) => (
                <div key={f.name}>
                  <label style={{ display: "block", fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em", fontWeight: 800, marginBottom: 6 }}>{f.label}</label>
                  <input type="text" name={f.name} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, marginBottom: 24 }}>
          {STATS.map((s) => (<div key={s.label} style={{ padding: "16px", background: `${s.color}08`, border: `1px solid ${s.color}20`, borderRadius: 12, textAlign: "center" }}><div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</div><div style={{ fontSize: 9, fontWeight: 800, marginTop: 5 }}>{s.label}</div></div>))}
        </div>
        <div style={{ padding: "18px 20px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, marginBottom: 20 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.2em", color: ACCENT, fontWeight: 800, marginBottom: 12 }}>ACTIVE AD SURFACES</div>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", textAlign: "center", padding: "14px 0" }}>No active ads yet — <Link href="/advertiser/campaigns" style={{ color: ACCENT, textDecoration: "none" }}>launch an ad</Link></p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 }}>
          {[
            { href: "/hub/advertiser",        label: "Ad Hub",        color: ACCENT    },
            { href: "/advertiser/campaigns",  label: "Campaigns",     color: "#00FFFF" },
            { href: "/advertiser/placements", label: "Placements",    color: "#FFD700" },
            { href: "/advertiser/analytics",  label: "Analytics",     color: "#AA2DFF" },
            { href: "/billing",               label: "Billing",       color: "#00FF88" },
            { href: "/settings",              label: "Settings",      color: "#FF6B35" },
          ].map((a) => (<Link key={a.href} href={a.href} style={{ display: "block", padding: "12px", borderRadius: 10, background: `${a.color}0A`, border: `1px solid ${a.color}28`, color: a.color, fontSize: 11, fontWeight: 800, textDecoration: "none", textAlign: "center" }}>{a.label}</Link>))}
        </div>
      </div>
    </main>
  );
}
