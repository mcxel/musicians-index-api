"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import MemoryWall from "@/components/media/MemoryWall";
import OmniPresenceEngine from "@/components/presence/OmniPresenceEngine";

const ACCENT = "#00FFFF";
const BG = "#050510";

const SEED_STATS = [
  { label: "Articles Published", value: "0",   color: ACCENT,    icon: "📝" },
  { label: "Total Views",        value: "0",   color: "#FFD700", icon: "👁️" },
  { label: "Avg Read Time",      value: "—",   color: "#AA2DFF", icon: "⏱️" },
  { label: "Magazine Features",  value: "0",   color: "#00FF88", icon: "📰" },
  { label: "Tips Received",      value: "$0",  color: "#FF2DAA", icon: "💰" },
  { label: "Subscribers",        value: "0",   color: ACCENT,    icon: "🔔" },
];

const SEED_DRAFTS = [
  { id: "d1", title: "The Rise of Competitive Music Culture", status: "draft",     updated: "Today"     },
  { id: "d2", title: "Inside the Monday Cypher",             status: "review",    updated: "Yesterday" },
  { id: "d3", title: "Beat Economics: Who Gets Paid?",        status: "published", updated: "Jun 10"    },
];

const statusColor = (s: string) => s === "published" ? "#00FF88" : s === "review" ? "#FFD700" : "#AA2DFF";

interface MeUser { id: string; email: string; name?: string; role: string; }

export default function WriterProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<MeUser | null>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("TMI journalist covering music, culture, and competition.");
  const [beat, setBeat] = useState("Hip-Hop · Battle Culture");
  const [saveStatus, setSaveStatus] = useState("");

  useEffect(() => {
    fetch("/api/auth/session", { credentials: "include" })
      .then(r => r.json())
      .then((d: { authenticated?: boolean; user?: MeUser }) => {
        if (!d.authenticated || !d.user) { router.replace("/login"); return; }
        setUser(d.user);
        setName(d.user.name ?? d.user.email.split("@")[0] ?? "");
      })
      .catch(() => router.replace("/login"));
  }, [router]);

  if (!user) return null;

  return (
    <main style={{ minHeight: "100vh", background: BG, color: "#fff", fontFamily: "'Inter', sans-serif", paddingBottom: 80 }}>
      {/* Nav */}
      <nav style={{ background: "rgba(0,0,0,0.8)", borderBottom: `1px solid ${ACCENT}22`, padding: "12px 24px", display: "flex", gap: 20, alignItems: "center", overflowX: "auto", backdropFilter: "blur(12px)" }}>
        <Link href="/home/1" style={{ fontSize: 11, fontWeight: 900, color: ACCENT, textDecoration: "none", letterSpacing: "0.12em", flexShrink: 0 }}>TMI</Link>
        <Link href="/hub/writer" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Writer Hub</Link>
        <span style={{ fontSize: 11, color: ACCENT, fontWeight: 700 }}>Editorial Profile</span>
        <Link href="/magazine" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Magazine</Link>
        <Link href="/settings" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none", marginLeft: "auto" }}>Settings</Link>
      </nav>

      <div style={{ position: "fixed", inset: 0, background: `radial-gradient(circle at 60% 20%, ${ACCENT}06, transparent 50%)`, pointerEvents: "none", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1000, margin: "0 auto", padding: "32px 24px" }}>
        {/* Hero header */}
        <div style={{ display: "flex", gap: 24, padding: "28px", background: `linear-gradient(135deg, ${ACCENT}0C, rgba(5,5,16,0.95))`, border: `1px solid ${ACCENT}28`, borderRadius: 20, marginBottom: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
          <div style={{ width: 88, height: 88, borderRadius: 14, background: `linear-gradient(135deg, ${ACCENT}, #AA2DFF)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, flexShrink: 0 }}>✍️</div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 9, letterSpacing: "0.25em", color: ACCENT, fontWeight: 800, marginBottom: 4 }}>EDITORIAL WRITER · TMI INDEX</div>
            <h1 style={{ margin: "0 0 4px", fontSize: "clamp(20px,3.5vw,30px)", fontWeight: 900 }}>{name}</h1>
            <p style={{ margin: "0 0 6px", fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>{bio}</p>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#FFD700", marginBottom: 12 }}>Beat: {beat}</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link href="/magazine/submit" style={{ padding: "8px 16px", borderRadius: 8, background: ACCENT, color: "#050510", fontSize: 10, fontWeight: 900, textDecoration: "none", letterSpacing: "0.08em" }}>+ NEW ARTICLE</Link>
              <Link href="/magazine" style={{ padding: "8px 16px", borderRadius: 8, background: `${ACCENT}12`, border: `1px solid ${ACCENT}35`, color: ACCENT, fontSize: 10, fontWeight: 800, textDecoration: "none" }}>VIEW MAGAZINE</Link>
            </div>
          </div>
          <button onClick={() => setEditing(!editing)} style={{ padding: "9px 20px", borderRadius: 9, background: `${ACCENT}14`, border: `1px solid ${ACCENT}45`, color: ACCENT, fontSize: 10, fontWeight: 800, cursor: "pointer", flexShrink: 0 }}>
            {editing ? "CANCEL" : "EDIT PROFILE"}
          </button>
        </div>

        {/* Edit form */}
        {editing && (
          <div style={{ padding: "24px", background: "rgba(255,255,255,0.02)", border: `1px solid ${ACCENT}20`, borderRadius: 16, marginBottom: 24 }}>
            <form onSubmit={async (e) => {
              e.preventDefault();
              setSaveStatus("");
              try {
                const r = await fetch("/api/profile/update", { method: "POST", headers: { "content-type": "application/json" }, credentials: "include", body: JSON.stringify({ displayName: name, bio }) });
                setSaveStatus(r.ok ? "Saved!" : "Save failed.");
              } catch { setSaveStatus("Network error."); }
            }} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[{ label: "PEN NAME", val: name, setter: setName }, { label: "BEAT / SPECIALTY", val: beat, setter: setBeat }].map(f => (
                <div key={f.label}>
                  <label style={{ display: "block", fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em", fontWeight: 800, marginBottom: 6 }}>{f.label}</label>
                  <input value={f.val} onChange={e => f.setter(e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: `1px solid ${ACCENT}20`, color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                </div>
              ))}
              <div>
                <label style={{ display: "block", fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em", fontWeight: 800, marginBottom: 6 }}>BIO / EDITORIAL STATEMENT</label>
                <textarea rows={3} value={bio} onChange={e => setBio(e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: `1px solid ${ACCENT}20`, color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box", resize: "vertical", fontFamily: "inherit" }} />
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <button type="submit" style={{ padding: "10px 24px", borderRadius: 8, background: ACCENT, color: "#050510", border: "none", fontSize: 12, fontWeight: 900, cursor: "pointer" }}>SAVE</button>
                {saveStatus && <span style={{ fontSize: 11, color: saveStatus === "Saved!" ? "#00FF88" : "#FF4444" }}>{saveStatus}</span>}
              </div>
            </form>
          </div>
        )}

        {/* Stats grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12, marginBottom: 24 }}>
          {SEED_STATS.map((s, i) => (
            <div key={s.label} style={{ padding: "18px 14px", background: `${s.color}08`, border: `1px solid ${s.color}20`, borderRadius: 14, textAlign: "center" }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 9, fontWeight: 800, marginTop: 6, color: "rgba(255,255,255,0.5)", letterSpacing: "0.1em" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Articles + drafts */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
          <div style={{ padding: "20px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontSize: 9, letterSpacing: "0.2em", color: ACCENT, fontWeight: 800 }}>📝 MY ARTICLES</div>
              <Link href="/magazine/submit" style={{ fontSize: 9, color: ACCENT, textDecoration: "none", fontWeight: 700 }}>+ NEW</Link>
            </div>
            {SEED_DRAFTS.map(d => (
              <div key={d.id} style={{ padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#fff", marginBottom: 3, lineHeight: 1.3 }}>{d.title}</div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 8, fontWeight: 800, color: statusColor(d.status), background: `${statusColor(d.status)}18`, border: `1px solid ${statusColor(d.status)}30`, borderRadius: 4, padding: "1px 7px", textTransform: "uppercase" }}>{d.status}</span>
                  <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>{d.updated}</span>
                </div>
              </div>
            ))}
            <Link href="/magazine/submit" style={{ display: "block", marginTop: 12, padding: "9px 0", textAlign: "center", borderRadius: 8, background: `${ACCENT}10`, border: `1px solid ${ACCENT}25`, color: ACCENT, fontSize: 10, fontWeight: 800, textDecoration: "none" }}>
              SUBMIT NEW ARTICLE →
            </Link>
          </div>

          <div style={{ padding: "20px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16 }}>
            <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "#FFD700", fontWeight: 800, marginBottom: 14 }}>📋 EDITORIAL QUEUE</div>
            {[
              { text: "Interview: Wavetek on battle strategy",       pri: "HIGH",   color: "#FF2DAA" },
              { text: "Review: Monday Cypher April finals",          pri: "MEDIUM", color: "#FFD700" },
              { text: "Op-ed: Is beat buying killing live culture?", pri: "LOW",    color: "#00FF88" },
            ].map((t, i) => (
              <div key={i} style={{ padding: "9px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", flex: 1, lineHeight: 1.3 }}>{t.text}</span>
                <span style={{ fontSize: 8, fontWeight: 800, color: t.color, marginLeft: 8, flexShrink: 0 }}>{t.pri}</span>
              </div>
            ))}
            <Link href="/hub/writer" style={{ display: "block", marginTop: 12, padding: "9px 0", textAlign: "center", borderRadius: 8, background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.25)", color: "#FFD700", fontSize: 10, fontWeight: 800, textDecoration: "none" }}>
              MANAGE QUEUE →
            </Link>
          </div>
        </div>

        {/* Quick nav */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10, marginBottom: 24 }}>
          {[
            { href: "/hub/writer",         label: "Writer Hub",      color: ACCENT    },
            { href: "/magazine",           label: "Magazine",        color: "#FFD700" },
            { href: "/magazine/submit",    label: "Submit Article",  color: "#FF2DAA" },
            { href: "/articles",           label: "Article Index",   color: "#AA2DFF" },
            { href: "/messages",           label: "Messages",        color: "#00FF88" },
            { href: "/billing",            label: "Billing",         color: "#FF6B35" },
            { href: "/subscribe",          label: "Upgrade Plan",    color: "#FFD700" },
            { href: "/settings",           label: "Settings",        color: "rgba(255,255,255,0.4)" },
          ].map((a) => (
            <Link key={a.href} href={a.href} style={{ display: "block", padding: "12px", borderRadius: 10, background: `${a.color}0A`, border: `1px solid ${a.color}28`, color: a.color, fontSize: 11, fontWeight: 800, textDecoration: "none", textAlign: "center" }}>{a.label}</Link>
          ))}
        </div>

        <MemoryWall accentColor={ACCENT} title="Writer Portfolio Wall" />
        <OmniPresenceEngine displayName={name || "Writer"} defaultTab="messages" />
      </div>
    </main>
  );
}
