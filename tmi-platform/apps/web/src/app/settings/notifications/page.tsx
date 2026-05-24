"use client";
import { useState } from "react";
import Link from "next/link";

const PREFS = [
  { id: "battles", label: "Battle Invites & Results", desc: "Get notified when you're challenged or results are announced." },
  { id: "tips", label: "Tips Received", desc: "Instant notification when a fan tips you." },
  { id: "followers", label: "New Followers", desc: "Know when someone follows your profile." },
  { id: "messages", label: "Direct Messages", desc: "Receive alerts for new messages." },
  { id: "shows", label: "Show Reminders", desc: "Reminders 1 hour before a show you're attending." },
  { id: "xp", label: "XP Milestones", desc: "Celebrate rank-ups and achievements." },
  { id: "magazine", label: "Magazine Issues", desc: "New TMI magazine issues dropped." },
  { id: "promo", label: "Promotions & Offers", desc: "Special deals, sponsor giveaways, and upgrades." },
];

export default function SettingsNotificationsPage() {
  const [enabled, setEnabled] = useState<Set<string>>(new Set(["battles", "tips", "messages", "shows", "xp"]));
  const [saved, setSaved] = useState(false);
  const toggle = (id: string) => setEnabled((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  function savePrefs() {
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
        <h1 style={{ fontSize: "clamp(22px,4vw,36px)", fontWeight: 900, margin: "0 0 32px" }}>Notifications</h1>
        <div style={{ display: "grid", gap: 10 }}>
          {PREFS.map((p) => (
            <div key={p.id} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{p.label}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 3 }}>{p.desc}</div>
              </div>
              <button onClick={() => toggle(p.id)} style={{ flexShrink: 0, width: 46, height: 24, borderRadius: 12, background: enabled.has(p.id) ? "#00FFFF" : "rgba(255,255,255,0.1)", border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s" }}>
                <span style={{ position: "absolute", top: 3, left: enabled.has(p.id) ? 25 : 3, width: 18, height: 18, borderRadius: "50%", background: enabled.has(p.id) ? "#05060c" : "rgba(255,255,255,0.5)", transition: "left 0.2s" }} />
              </button>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 24, display: "flex", gap: 12, alignItems: "center" }}>
          <button onClick={savePrefs} style={{ padding: "11px 28px", borderRadius: 8, background: "#00FFFF", color: "#05060c", fontWeight: 800, fontSize: 13, cursor: "pointer", border: "none" }}>Save Preferences</button>
          {saved && <span style={{ fontSize: 12, color: "#22c55e" }}>Saved!</span>}
        </div>
      </div>
    </main>
  );
}
