"use client";
import { useState } from "react";
import Link from "next/link";

const INITIAL_FLAGS = [
  { id: "ff1", name: "tv_apps", label: "TV App Support (WebOS/Tizen)", enabled: true, env: "all" },
  { id: "ff2", name: "nft_v2", label: "NFT V2 Minting Engine", enabled: true, env: "prod" },
  { id: "ff3", name: "beat_auctions", label: "Beat Auction System", enabled: false, env: "staging" },
  { id: "ff4", name: "ai_director", label: "AI Smart Camera Director", enabled: true, env: "prod" },
  { id: "ff5", name: "magazine_v2", label: "Magazine V2 Layout", enabled: false, env: "staging" },
  { id: "ff6", name: "giveaway_pipeline", label: "Sponsor Giveaway Pipeline", enabled: true, env: "prod" },
  { id: "ff7", name: "mobile_webrtc", label: "Mobile WebRTC Capture", enabled: true, env: "prod" },
];

export default function AdminFeatureFlagsPage() {
  const [flags, setFlags] = useState(INITIAL_FLAGS);
  const toggle = (id: string) => setFlags((f) => f.map((x) => x.id === id ? { ...x, enabled: !x.enabled } : x));
  return (
    <main style={{ minHeight: "100vh", background: "#05060c", color: "#fff", padding: "32px 24px 80px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <Link href="/admin" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Admin</Link>
        </div>
        <div style={{ fontSize: 10, letterSpacing: 5, color: "#AA2DFF", fontWeight: 800, marginBottom: 4 }}>ADMIN · FEATURE FLAGS</div>
        <h1 style={{ fontSize: "clamp(22px,4vw,36px)", fontWeight: 900, margin: "0 0 28px" }}>Feature Flags</h1>
        <div style={{ display: "grid", gap: 8 }}>
          {flags.map((f) => (
            <div key={f.id} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${f.enabled ? "rgba(170,45,255,0.2)" : "rgba(255,255,255,0.06)"}`, borderRadius: 10, padding: "16px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{f.label}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 3, fontFamily: "monospace" }}>{f.name} · {f.env}</div>
              </div>
              <button onClick={() => toggle(f.id)} style={{ padding: "7px 18px", borderRadius: 20, background: f.enabled ? "rgba(170,45,255,0.2)" : "rgba(255,255,255,0.06)", border: `1px solid ${f.enabled ? "#AA2DFF" : "rgba(255,255,255,0.1)"}`, color: f.enabled ? "#AA2DFF" : "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 800, cursor: "pointer", letterSpacing: "0.1em", textTransform: "uppercase" as const }}>
                {f.enabled ? "Enabled" : "Disabled"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}