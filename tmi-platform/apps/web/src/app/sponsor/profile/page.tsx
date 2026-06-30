"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import MemoryWall from "@/components/media/MemoryWall";
import OmniPresenceEngine from "@/components/presence/OmniPresenceEngine";

const ACCENT = "#FFD700";
const BG = "#050510";


interface MeUser { id: string; email: string; name?: string; role: string; tier?: string; }
interface SponsorStat { label: string; value: string; color: string; icon: string; }
interface Campaign { id: string; name: string; status: string; impressions: string; budget: string; color: string; }
interface Giveaway { id: string; title: string; entries: number; end: string; color: string; }
interface Artist { slug: string; name: string; genre: string; color: string; }

export default function SponsorProfilePage() {
  const router = useRouter();
  const [user, setUser]             = useState<MeUser | null>(null);
  const [editing, setEditing]       = useState(false);
  const [brandName, setBrandName]   = useState("BeatGear Co.");
  const [bio, setBio]               = useState("Premium music hardware & software brand. Backing the next generation of independent artists on TMI.");
  const [saveStatus, setSaveStatus] = useState("");
  const [stats, setStats]           = useState<SponsorStat[]>([]);
  const [campaigns, setCampaigns]   = useState<Campaign[]>([]);
  const [giveaways, setGiveaways]   = useState<Giveaway[]>([]);
  const [artists, setArtists]       = useState<Artist[]>([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sessionRes, profileRes] = await Promise.all([
          fetch("/api/auth/session", { credentials: "include" }),
          fetch("/api/sponsor/profile", { credentials: "include" })
        ]);
        const sessionData = await sessionRes.json();
        if (!sessionData.authenticated || !sessionData.user) { router.replace("/auth"); return; }
        setUser(sessionData.user);
        if (sessionData.user.name) setBrandName(sessionData.user.name);

        const profileData = await profileRes.json();
        setStats(profileData.stats || []);
        setCampaigns(profileData.campaigns || []);
        setGiveaways(profileData.giveaways || []);
        setArtists(profileData.partners || []);
      } catch (err) {
        console.error("Failed to fetch sponsor data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.55}}
      `}</style>

      {/* Nav */}
      <nav style={{ background: "rgba(0,0,0,0.85)", borderBottom: `1px solid ${ACCENT}22`, padding: "12px 24px", display: "flex", gap: 20, alignItems: "center", overflowX: "auto", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 50 }}>
        <Link href="/home/1" style={{ fontSize: 11, fontWeight: 900, color: ACCENT, textDecoration: "none", letterSpacing: "0.12em", flexShrink: 0 }}>TMI</Link>
        <span style={{ color: "rgba(255,255,255,0.15)" }}>›</span>
        <Link href="/hub/sponsor" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Sponsor Hub</Link>
        <span style={{ color: "rgba(255,255,255,0.15)" }}>›</span>
        <span style={{ fontSize: 11, color: ACCENT, fontWeight: 700 }}>Brand Profile</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
          <Link href="/sponsor/campaigns" style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Campaigns</Link>
          <Link href="/settings" style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Settings</Link>
        </div>
      </nav>

      <div style={{ position: "fixed", inset: 0, background: `radial-gradient(circle at 70% 15%, ${ACCENT}07, transparent 50%)`, pointerEvents: "none", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto", padding: "32px 24px", animation: "fadeUp .4s ease" }}>

        {/* Hero card */}
        <div style={{ display: "flex", gap: 24, padding: "28px 32px", background: `linear-gradient(135deg, ${ACCENT}10 0%, rgba(5,5,16,0.97) 100%)`, border: `1px solid ${ACCENT}28`, borderRadius: 20, marginBottom: 24, flexWrap: "wrap", alignItems: "flex-start", boxShadow: `0 8px 40px ${ACCENT}0A` }}>
          <div style={{ width: 96, height: 96, borderRadius: 18, background: `linear-gradient(135deg, ${ACCENT}, #7a5a00)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 42, flexShrink: 0, boxShadow: `0 0 32px ${ACCENT}30` }}>🤝</div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 9, letterSpacing: "0.25em", color: ACCENT, fontWeight: 800 }}>SPONSOR · TMI PARTNER</span>
              <span style={{ background: `${ACCENT}20`, border: `1px solid ${ACCENT}40`, borderRadius: 4, padding: "1px 8px", fontSize: 8, color: ACCENT, fontWeight: 900 }}>PREMIUM</span>
            </div>
            <h1 style={{ margin: "0 0 6px", fontSize: "clamp(22px,3.5vw,34px)", fontWeight: 900 }}>{brandName}</h1>
            <p style={{ margin: "0 0 14px", fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, maxWidth: 520 }}>{bio}</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link href="/sponsor/campaigns/new" style={{ padding: "9px 18px", borderRadius: 8, background: ACCENT, color: "#1a0f00", fontSize: 10, fontWeight: 900, textDecoration: "none" }}>+ NEW CAMPAIGN</Link>
              <Link href="/giveaway" style={{ padding: "9px 18px", borderRadius: 8, background: `${ACCENT}12`, border: `1px solid ${ACCENT}35`, color: ACCENT, fontSize: 10, fontWeight: 800, textDecoration: "none" }}>🎁 GIVEAWAY</Link>
              <Link href="/sponsor/placements" style={{ padding: "9px 18px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", fontSize: 10, fontWeight: 800, textDecoration: "none" }}>📍 PLACEMENTS</Link>
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
              {[{ label: "Website" }, { label: "Contact Email" }, { label: "Industry" }].map((f) => (
                <div key={f.label}>
                  <label style={{ display: "block", fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em", fontWeight: 800, marginBottom: 6 }}>{f.label}</label>
                  <input type="text" style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <button type="submit" style={{ padding: "10px 24px", borderRadius: 8, background: ACCENT, color: BG, border: "none", fontSize: 12, fontWeight: 900, cursor: "pointer" }}>SAVE</button>
                  {saveStatus && <span style={{ fontSize: 11, color: saveStatus === "Saved!" ? "#00FF88" : "#FF4444" }}>{saveStatus}</span>}
                </div>
                <Link href="/account/deactivate" style={{ color: "#ff4444", fontSize: 11, textDecoration: "none" }}>Deactivate</Link>
              </div>
            </form>
          </div>
        )}

        {/* Stats */}
        {!loading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 24 }}>
            {stats && stats.length > 0 ? stats.map((s, i) => (
              <div key={s.label} style={{ padding: "18px 16px", background: `${s.color}08`, border: `1px solid ${s.color}20`, borderRadius: 14, textAlign: "center", animation: `fadeUp .4s ease ${i * 0.06}s both` }}>
                <div style={{ fontSize: 20, marginBottom: 6 }}>{s.icon}</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 9, fontWeight: 800, marginTop: 6, color: "rgba(255,255,255,0.5)", letterSpacing: "0.1em" }}>{s.label}</div>
              </div>
            )) : (
              <div style={{ gridColumn: "1 / -1", padding: "24px", textAlign: "center", color: "rgba(255,255,255,0.4)" }}>
                No campaign data available yet.
              </div>
            )}
          </div>
        )}
        {loading && <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12, marginBottom: 24, opacity: 0.5 }}>
          {[...Array(6)].map((_, i) => <div key={i} style={{ padding: "18px", background: "rgba(255,255,255,0.02)", borderRadius: 14, height: 80 }} />)}
        </div>}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
          {/* Active Campaigns */}
          <div style={{ padding: "20px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontSize: 9, letterSpacing: "0.2em", color: ACCENT, fontWeight: 800 }}>🎯 CAMPAIGNS</div>
              <Link href="/sponsor/campaigns" style={{ fontSize: 9, color: ACCENT, textDecoration: "none", fontWeight: 700 }}>ALL →</Link>
            </div>
            {campaigns && campaigns.length > 0 ? campaigns.map(c => (
              <Link key={c.id} href="/sponsor/campaigns" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", textDecoration: "none" }}>
                <div>
                  <div style={{ fontSize: 11, color: "#fff", fontWeight: 600, lineHeight: 1.3 }}>{c.name}</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{c.impressions} impressions · {c.budget}</div>
                </div>
                <span style={{ fontSize: 8, fontWeight: 900, color: statusColor(c.status), background: `${statusColor(c.status)}18`, border: `1px solid ${statusColor(c.status)}40`, borderRadius: 4, padding: "2px 7px", textTransform: "uppercase", flexShrink: 0, marginLeft: 12 }}>{c.status}</span>
              </Link>
            )) : (
              <div style={{ padding: "12px", textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 11 }}>No campaigns yet.</div>
            )}
            <Link href="/sponsor/campaigns/new" style={{ display: "block", marginTop: 12, padding: "9px 14px", borderRadius: 8, background: `${ACCENT}10`, border: `1px solid ${ACCENT}25`, color: ACCENT, fontSize: 10, fontWeight: 800, textDecoration: "none", textAlign: "center" }}>+ NEW CAMPAIGN</Link>
          </div>

          {/* Backed Artists */}
          <div style={{ padding: "20px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "#AA2DFF", fontWeight: 800 }}>🎤 BACKED ARTISTS</div>
              <Link href="/artists" style={{ fontSize: 9, color: "#AA2DFF", textDecoration: "none", fontWeight: 700 }}>BROWSE →</Link>
            </div>
            {artists && artists.length > 0 ? artists.map(a => (
              <Link key={a.slug} href={`/artists/${a.slug}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", textDecoration: "none" }}>
                <span style={{ fontSize: 11, color: "#fff", fontWeight: 600 }}>{a.name}</span>
                <span style={{ fontSize: 9, color: a.color }}>{a.genre}</span>
              </Link>
            )) : (
              <div style={{ padding: "12px", textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 11 }}>No backed artists yet.</div>
            )}
          </div>
        </div>

        {/* Active Giveaways */}
        <div style={{ padding: "20px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "#FF2DAA", fontWeight: 800 }}>🎁 ACTIVE GIVEAWAYS</div>
            <Link href="/giveaway" style={{ fontSize: 9, color: "#FF2DAA", textDecoration: "none", fontWeight: 700 }}>ALL →</Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {giveaways && giveaways.length > 0 ? giveaways.map(g => (
              <Link key={g.id} href="/giveaway" style={{ padding: "14px", background: `${g.color}08`, border: `1px solid ${g.color}20`, borderRadius: 12, textDecoration: "none" }}>
                <div style={{ fontSize: 11, color: "#fff", fontWeight: 700, marginBottom: 6, lineHeight: 1.3 }}>{g.title}</div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 10, color: g.color, fontWeight: 800 }}>{g.entries.toLocaleString()} entries</span>
                  <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>Ends {g.end}</span>
                </div>
              </Link>
            )) : (
              <div style={{ gridColumn: "1 / -1", padding: "12px", textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 11 }}>No active giveaways.</div>
            )}
          </div>
        </div>

        {/* Quick nav */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10, marginBottom: 24 }}>
          {[
            { href: "/hub/sponsor",        label: "Sponsor Hub",   color: ACCENT    },
            { href: "/sponsor/campaigns",  label: "Campaigns",     color: "#00FFFF" },
            { href: "/sponsor/placements", label: "Placements",    color: "#AA2DFF" },
            { href: "/giveaway",           label: "Giveaways",     color: "#FF2DAA" },
            { href: "/sponsor/analytics",  label: "Analytics",     color: "#00FF88" },
            { href: "/billing",            label: "Billing",       color: "#FF6B35" },
            { href: "/subscribe",          label: "Upgrade Plan",  color: "#FFD700" },
            { href: "/settings",           label: "Settings",      color: "rgba(255,255,255,0.4)" },
          ].map((a) => (
            <Link key={a.href} href={a.href} style={{ display: "block", padding: "13px 12px", borderRadius: 10, background: `${a.color}0A`, border: `1px solid ${a.color}28`, color: a.color, fontSize: 11, fontWeight: 800, textDecoration: "none", textAlign: "center" }}>{a.label}</Link>
          ))}
        </div>
        <MemoryWall accentColor={ACCENT} title="Sponsor Wall" />
        <OmniPresenceEngine displayName="Sponsor" defaultTab="messages" />
      </div>
    </main>
  );
}
