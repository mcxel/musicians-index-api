"use client";

import { useState } from "react";
import Link from "next/link";

const CONTACTS = [
  { name: "Nova Cipher", avatar: "👑", slug: "nova-cipher" },
  { name: "Zion Freq",   avatar: "🎤", slug: "zion-freq"   },
  { name: "Astra Nova",  avatar: "🎼", slug: "astra-nova"  },
  { name: "Wave Tek",    avatar: "🎸", slug: "wave-tek"    },
  { name: "DJ Lumi",     avatar: "🎧", slug: "dj-lumi"     },
  { name: "Veron Koi",   avatar: "🎹", slug: "veron-koi"   },
];

const EXISTING_ROOMS = [
  { name: "Producer Collab",  members: 4, accent: "#AA2DFF" },
  { name: "Beat Session Live", members: 3, accent: "#FFD700" },
];

const TIER_LIMITS: Record<string, number> = { free: 2, gold: 5, diamond: 99 };

export default function GroupCallPage() {
  const [roomName, setRoomName] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const tier: "free" | "gold" | "diamond" = "free";
  const limit = TIER_LIMITS[tier] ?? 2;

  const toggle = (slug: string) => {
    setSelected((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : prev.length < limit ? [...prev, slug] : prev
    );
  };

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", fontFamily: "'Inter', sans-serif", paddingBottom: 80 }}>
      <nav style={{ background: "rgba(0,0,0,0.7)", borderBottom: "1px solid rgba(170,45,255,0.18)", padding: "12px 24px", display: "flex", gap: 20, alignItems: "center" }}>
        <Link href="/home/1" style={{ fontSize: 11, fontWeight: 900, color: "#AA2DFF", textDecoration: "none", letterSpacing: "0.12em" }}>TMI</Link>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Video Calls</span>
        <span style={{ fontSize: 11, color: "#AA2DFF", fontWeight: 700 }}>Group Call</span>
        <Link href="/video/call/new" style={{ marginLeft: "auto", padding: "7px 16px", borderRadius: 6, background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.28)", color: "#00FF88", fontSize: 10, fontWeight: 800, textDecoration: "none" }}>
          1-ON-1 CALL
        </Link>
      </nav>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#AA2DFF", fontWeight: 800, marginBottom: 6 }}>GROUP · WEBRTC</div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900 }}>Group Video Call</h1>
        </div>

        {/* Tier limit notice */}
        <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(170,45,255,0.06)", border: "1px solid rgba(170,45,255,0.2)", marginBottom: 24, fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>
          {tier === "free" ? `Free tier: max ${limit} participants. ` : ""}
          {(tier as string) !== "diamond" && <Link href="/settings/billing" style={{ color: "#AA2DFF", textDecoration: "none", fontWeight: 700 }}>Upgrade for larger rooms →</Link>}
        </div>

        {/* Existing rooms */}
        {EXISTING_ROOMS.length > 0 && (
          <section style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", fontWeight: 800, marginBottom: 10 }}>ACTIVE GROUP ROOMS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {EXISTING_ROOMS.map((r) => (
                <div key={r.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: 10, background: `${r.accent}0A`, border: `1px solid ${r.accent}28` }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800 }}>{r.name}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{r.members} members</div>
                  </div>
                  <button style={{ padding: "7px 16px", borderRadius: 6, background: `${r.accent}18`, border: `1px solid ${r.accent}40`, color: r.accent, fontSize: 10, fontWeight: 800, cursor: "pointer" }}>
                    JOIN
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Create new */}
        <section>
          <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", fontWeight: 800, marginBottom: 10 }}>CREATE NEW ROOM</div>
          <input
            type="text" placeholder="Room name..."
            value={roomName} onChange={(e) => setRoomName(e.target.value)}
            style={{ width: "100%", padding: "11px 16px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box", marginBottom: 16 }}
          />

          <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", fontWeight: 800, marginBottom: 10 }}>INVITE ({selected.length}/{limit})</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
            {CONTACTS.map((c) => {
              const isSelected = selected.includes(c.slug);
              const disabled = !isSelected && selected.length >= limit;
              return (
                <button key={c.slug} onClick={() => toggle(c.slug)} disabled={disabled} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, cursor: disabled ? "not-allowed" : "pointer", border: "none",
                  background: isSelected ? "rgba(170,45,255,0.14)" : "rgba(255,255,255,0.03)",
                  outline: isSelected ? "1.5px solid rgba(170,45,255,0.45)" : "1px solid rgba(255,255,255,0.07)",
                  color: disabled ? "rgba(255,255,255,0.25)" : "#fff", opacity: disabled ? 0.5 : 1,
                }}>
                  <span style={{ fontSize: 20 }}>{c.avatar}</span>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>{c.name}</span>
                  {isSelected && <span style={{ marginLeft: "auto", color: "#AA2DFF" }}>✓</span>}
                </button>
              );
            })}
          </div>

          <button
            disabled={!roomName || selected.length === 0}
            style={{
              width: "100%", padding: "15px", borderRadius: 12, fontSize: 14, fontWeight: 900, letterSpacing: "0.1em", border: "none",
              cursor: roomName && selected.length > 0 ? "pointer" : "not-allowed",
              background: roomName && selected.length > 0 ? "linear-gradient(135deg, #AA2DFF, #FF2DAA)" : "rgba(255,255,255,0.06)",
              color: roomName && selected.length > 0 ? "#fff" : "rgba(255,255,255,0.2)",
            }}
          >
            📹 START GROUP CALL
          </button>
        </section>
      </div>
    </main>
  );
}
