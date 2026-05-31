"use client";

import { useState } from "react";
import Link from "next/link";

const RECENT_CALLS = [
  { name: "Zion Freq",  avatar: "🎤", time: "2h ago",  slug: "zion-freq"  },
  { name: "DJ Lumi",    avatar: "🎧", time: "Yesterday", slug: "dj-lumi"  },
  { name: "Astra Nova", avatar: "🎼", time: "3d ago",  slug: "astra-nova" },
];
const CONTACTS = [
  { name: "Nova Cipher", avatar: "👑", genre: "EDM",     slug: "nova-cipher" },
  { name: "Wave Tek",    avatar: "🎸", genre: "Afrobeats",slug: "wave-tek"   },
  { name: "Veron Koi",   avatar: "🎹", genre: "Neo-Soul", slug: "veron-koi"  },
  { name: "Pulse Max",   avatar: "🎛️", genre: "Trap",     slug: "pulse-max"  },
  { name: "Big Ace",     avatar: "🎤", genre: "Hip-Hop",  slug: "big-ace"    },
];

export default function NewVideoCallPage() {
  const [search, setSearch] = useState("");
  const [callee, setCallee] = useState("");

  const filtered = CONTACTS.filter(
    (c) => !search || c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", fontFamily: "'Inter', sans-serif", paddingBottom: 80 }}>
      <nav style={{ background: "rgba(0,0,0,0.7)", borderBottom: "1px solid rgba(0,255,136,0.18)", padding: "12px 24px", display: "flex", gap: 20, alignItems: "center" }}>
        <Link href="/home/1" style={{ fontSize: 11, fontWeight: 900, color: "#00FF88", textDecoration: "none", letterSpacing: "0.12em" }}>TMI</Link>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Video Calls</span>
        <span style={{ fontSize: 11, color: "#00FF88", fontWeight: 700 }}>New 1-on-1</span>
        <Link href="/video/call/group" style={{ marginLeft: "auto", padding: "7px 16px", borderRadius: 6, background: "rgba(170,45,255,0.12)", border: "1px solid rgba(170,45,255,0.3)", color: "#AA2DFF", fontSize: 10, fontWeight: 800, textDecoration: "none" }}>
          GROUP CALL →
        </Link>
      </nav>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#00FF88", fontWeight: 800, marginBottom: 6 }}>WEBRTC · HD VIDEO</div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900 }}>Start a Video Call</h1>
        </div>

        {/* Camera permission notice */}
        <div style={{ padding: "14px 16px", borderRadius: 10, background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.2)", marginBottom: 24, fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>
          📹 Your browser will request camera &amp; microphone access when you start the call. TMI uses WebRTC — peer-to-peer, no recording without consent.
        </div>

        {/* Recent calls */}
        {RECENT_CALLS.length > 0 && (
          <section style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", fontWeight: 800, marginBottom: 10 }}>RECENT CALLS</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {RECENT_CALLS.map((r) => (
                <button key={r.slug} onClick={() => setCallee(r.slug)} style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "9px 14px", borderRadius: 8, cursor: "pointer", border: "none",
                  background: callee === r.slug ? "rgba(0,255,136,0.14)" : "rgba(255,255,255,0.04)",
                  outline: callee === r.slug ? "1.5px solid rgba(0,255,136,0.45)" : "1px solid rgba(255,255,255,0.08)",
                  color: "#fff",
                }}>
                  <span style={{ fontSize: 18 }}>{r.avatar}</span>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>{r.name}</div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>{r.time}</div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Search */}
        <section style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", fontWeight: 800, marginBottom: 10 }}>SEARCH CONTACTS</div>
          <input
            type="text" placeholder="Search name..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%", padding: "11px 16px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box", marginBottom: 10 }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {filtered.map((c) => (
              <button key={c.slug} onClick={() => setCallee(c.slug)} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 10, cursor: "pointer", border: "none",
                background: callee === c.slug ? "rgba(0,255,136,0.1)" : "rgba(255,255,255,0.03)",
                outline: callee === c.slug ? "1.5px solid rgba(0,255,136,0.4)" : "1px solid rgba(255,255,255,0.07)",
                color: "#fff", textAlign: "left",
              }}>
                <span style={{ fontSize: 22 }}>{c.avatar}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{c.name}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{c.genre}</div>
                </div>
                {callee === c.slug && <span style={{ color: "#00FF88" }}>✓</span>}
              </button>
            ))}
          </div>
        </section>

        <button
          disabled={!callee}
          style={{
            width: "100%", padding: "15px", borderRadius: 12, fontSize: 14, fontWeight: 900, letterSpacing: "0.1em", cursor: callee ? "pointer" : "not-allowed", border: "none",
            background: callee ? "linear-gradient(135deg, #00FF88, #00FFFF)" : "rgba(255,255,255,0.06)",
            color: callee ? "#050510" : "rgba(255,255,255,0.2)",
          }}
        >
          📹 START VIDEO CALL
        </button>
      </div>
    </main>
  );
}
