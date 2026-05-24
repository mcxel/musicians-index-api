"use client";
import { useState } from "react";
import Link from "next/link";

const TOGGLES = [
  { id: "public_profile", label: "Public Profile", desc: "Anyone can view your profile page." },
  { id: "show_earnings", label: "Show Earnings on Profile", desc: "Display your total tips and earnings publicly." },
  { id: "show_online", label: "Show Online Status", desc: "Others can see when you're active on TMI." },
  { id: "allow_dm", label: "Allow Direct Messages", desc: "Non-followers can send you messages." },
  { id: "show_in_search", label: "Appear in Search", desc: "Your profile appears in TMI search results." },
  { id: "data_ads", label: "Personalized Ads", desc: "Allow TMI to use your activity for ad targeting." },
];

export default function SettingsPrivacyPage() {
  const [on, setOn] = useState<Set<string>>(new Set(["public_profile", "show_online", "show_in_search"]));
  const [saved, setSaved] = useState(false);
  const toggle = (id: string) => setOn((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  function saveSettings() {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <main style={{ minHeight: "100vh", background: "#05060c", color: "#fff", padding: "32px 24px 80px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <Link href="/settings" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Settings</Link>
        </div>
        <div style={{ fontSize: 10, letterSpacing: 5, color: "#00FFFF", fontWeight: 800, marginBottom: 4 }}>SETTINGS</div>
        <h1 style={{ fontSize: "clamp(22px,4vw,36px)", fontWeight: 900, margin: "0 0 32px" }}>Privacy</h1>
        <div style={{ display: "grid", gap: 10 }}>
          {TOGGLES.map((t) => (
            <div key={t.id} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{t.label}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 3 }}>{t.desc}</div>
              </div>
              <button onClick={() => toggle(t.id)} style={{ flexShrink: 0, width: 46, height: 24, borderRadius: 12, background: on.has(t.id) ? "#00FFFF" : "rgba(255,255,255,0.1)", border: "none", cursor: "pointer", position: "relative" }}>
                <span style={{ position: "absolute", top: 3, left: on.has(t.id) ? 25 : 3, width: 18, height: 18, borderRadius: "50%", background: on.has(t.id) ? "#05060c" : "rgba(255,255,255,0.5)" }} />
              </button>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 24, display: "flex", gap: 12, alignItems: "center" }}>
          <button onClick={saveSettings} style={{ padding: "11px 28px", borderRadius: 8, background: "#00FFFF", color: "#05060c", fontWeight: 800, fontSize: 13, cursor: "pointer", border: "none" }}>Save</button>
          {saved && <span style={{ fontSize: 12, color: "#22c55e" }}>Saved!</span>}
          <Link href="/privacy" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textDecoration: "none", alignSelf: "center" }}>Privacy Policy</Link>
        </div>
      </div>
    </main>
  );
}
