"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

type DashMode = "SCHEDULED" | "LIVE";

const BOT_DOCK = [
  "StageManager",
  "RevenueBot",
  "ChatMonitor",
  "StreamMonitor",
  "BookingBot",
  "BookingBot",
];

const LIVE_BOT_DOCK = [
  { name: "StageManagerBot", pos: "left"  },
  { name: "BookingBot",      pos: "right" },
  { name: "ChatGuardBot",    pos: "left"  },
  { name: "BookingBot",      pos: "right" },
];

function BotDock({ bots }: { bots: string[] }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "8px 14px",
        background: "#030508",
        borderTop: "1px solid #1a1a2a",
        flexWrap: "wrap",
        gap: 6,
      }}
    >
      {bots.map((b, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#00bb88",
              boxShadow: "0 0 5px #00bb88",
            }}
          />
          <span style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", fontWeight: 700 }}>{b}</span>
        </div>
      ))}
    </div>
  );
}

function TipIcon({ label, emoji }: { label: string; emoji: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 3,
        minWidth: 44,
      }}
    >
      <span style={{ fontSize: 18 }}>{emoji}</span>
      <span style={{ fontSize: 7, color: "rgba(255,255,255,0.38)", fontWeight: 700, whiteSpace: "nowrap" }}>{label}</span>
    </div>
  );
}

/* ─────────────── SCHEDULED VIEW ─────────────── */
function ScheduledView({ onGoLive }: { onGoLive: () => void }) {
  const BG = "#03070e";
  const ACCENT = "#cc8800";
  const TEAL = "#006677";

  return (
    <main style={{ minHeight: "100vh", background: BG, color: "#fff", fontFamily: "'Inter', sans-serif" }}>

      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "14px 16px",
          borderBottom: "1px solid #1a2a1a",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: 22,
            fontWeight: 900,
            color: ACCENT,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          ARTIST DASHBOARD
        </h1>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            style={{
              padding: "8px 14px",
              background: "#0a1408",
              border: "1px solid #22660033",
              borderRadius: 8,
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <span style={{ fontSize: 16 }}>📅</span>
            <span style={{ fontSize: 7, color: "rgba(255,255,255,0.4)", fontWeight: 700 }}>BOOKING</span>
          </button>
          <button
            type="button"
            style={{
              padding: "8px 14px",
              background: "#0a0e14",
              border: "1px solid #22334433",
              borderRadius: 8,
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <span style={{ fontSize: 16 }}>👤</span>
            <span style={{ fontSize: 7, color: "rgba(255,255,255,0.4)", fontWeight: 700 }}>BOOKING</span>
          </button>
        </div>
      </div>

      {/* Top actions row */}
      <div
        style={{
          display: "flex",
          gap: 10,
          padding: "12px 16px",
          borderBottom: "1px solid #0e1a0e",
        }}
      >
        {[
          { label: "UPLOAD",      icon: "⬆",  color: ACCENT },
          { label: "SET UP SHOW", icon: "⚙",  color: ACCENT },
          { label: "SPONSOR",     icon: "⬆",  color: ACCENT },
        ].map((a) => (
          <button
            key={a.label}
            type="button"
            style={{
              flex: 1,
              padding: "10px 8px",
              background: "#0a1008",
              border: `1px solid ${a.color}44`,
              borderRadius: 8,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
            }}
          >
            <span style={{ fontSize: 13, color: a.color }}>{a.icon}</span>
            <span style={{ fontSize: 9, fontWeight: 800, color: a.color, letterSpacing: "0.06em" }}>{a.label}</span>
          </button>
        ))}
      </div>

      {/* Two-column layout: stage + booking */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 0 }}>

        {/* Stage column */}
        <div style={{ padding: "12px 0 12px 16px" }}>
          {/* Stage frame */}
          <div
            style={{
              position: "relative",
              background: "#060d06",
              border: "2px solid #1a3020",
              borderRadius: 8,
              overflow: "hidden",
              aspectRatio: "16/10",
            }}
          >
            {/* Curtain */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(180deg, #2a1010 0%, #180808 50%, #0a0404 100%)",
              }}
            />
            {/* SCHEDULED badge */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                background: "rgba(0,0,0,0.6)",
                border: "1px solid #33664433",
                borderRadius: 6,
                padding: "5px 14px",
                zIndex: 2,
              }}
            >
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 900,
                  color: "rgba(255,255,255,0.4)",
                  letterSpacing: "0.18em",
                }}
              >
                SCHEDULED
              </span>
            </div>
            {/* Spotlight effect */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "30%",
                right: "30%",
                height: "60%",
                background:
                  "radial-gradient(ellipse at 50% 0%, rgba(200,140,50,0.08) 0%, transparent 70%)",
                zIndex: 1,
              }}
            />
          </div>

          {/* FAN VIEW SHOW button */}
          <button
            type="button"
            style={{
              display: "block",
              width: "100%",
              marginTop: 8,
              padding: "9px",
              background: "#0a1408",
              border: "1px solid #22440022",
              borderRadius: 7,
              cursor: "pointer",
              fontSize: 10,
              fontWeight: 800,
              color: "rgba(255,255,255,0.5)",
              letterSpacing: "0.08em",
              textAlign: "center",
            }}
          >
            FAN VIEW SHOW
          </button>

          {/* Tip icons row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 0 4px",
              overflowX: "auto",
            }}
          >
            <span style={{ fontSize: 10, fontWeight: 900, color: "#00bb88", flexShrink: 0, letterSpacing: "0.06em" }}>$ TIP</span>
            <TipIcon label="CLAP"     emoji="👏" />
            <TipIcon label="CLAP"     emoji="🤚" />
            <TipIcon label="HEART"    emoji="❤️" />
            <TipIcon label="HYPE"     emoji="🔥" />
            <TipIcon label="GIVEAWAY" emoji="🎁" />
            <TipIcon label="STATS"    emoji="📊" />
          </div>

          {/* PUBLISH */}
          <button
            type="button"
            onClick={onGoLive}
            style={{
              display: "block",
              width: "100%",
              marginTop: 6,
              padding: "13px",
              background: `linear-gradient(135deg, ${ACCENT} 0%, #aa6600 100%)`,
              border: "none",
              borderRadius: 9,
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 900,
              color: "#fff",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              boxShadow: `0 0 20px ${ACCENT}44`,
            }}
          >
            PUBLISH
          </button>

          {/* Live stats row */}
          <div
            style={{
              display: "flex",
              gap: 14,
              marginTop: 10,
              padding: "10px 0",
              borderTop: "1px solid #1a2a1a",
            }}
          >
            {[
              { label: "LIVE STREAM", value: "215",  icon: "👁", color: "#00FFFF" },
              { label: "TIPS",        value: "$865", icon: "💵", color: "#00FF88" },
              { label: "FAN RATING",  value: "4.8",  icon: "⭐", color: "#FFD700" },
            ].map((s) => (
              <div key={s.label} style={{ flex: 1, textAlign: "center" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginBottom: 2 }}>
                  <span style={{ fontSize: 12 }}>{s.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 900, color: s.color }}>{s.value}</span>
                </div>
                <div style={{ fontSize: 7, color: "rgba(255,255,255,0.3)", fontWeight: 700, letterSpacing: "0.08em" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Earnings + join */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 2 }}>
            <div
              style={{
                padding: "10px",
                background: "#070e07",
                border: "1px solid #22660022",
                borderRadius: 8,
              }}
            >
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", fontWeight: 700, marginBottom: 3 }}>$ EARNING</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: "#00FF88" }}>$945</div>
            </div>
            <div
              style={{
                padding: "10px",
                background: "#070e07",
                border: "1px solid #22660022",
                borderRadius: 8,
              }}
            >
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", fontWeight: 700, marginBottom: 3 }}>DAILY REWARD</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: ACCENT }}>$215</div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
            {[
              { label: "JOIN CYPHER",     icon: "🎤", href: "/cypher" },
              { label: "JOIN BEAT BATTLE",icon: "⚔️", href: "/beat-battle" },
            ].map((b) => (
              <Link
                key={b.label}
                href={b.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 5,
                  padding: "10px 6px",
                  background: "#08100c",
                  border: "1px solid #22440033",
                  borderRadius: 8,
                  textDecoration: "none",
                }}
              >
                <span style={{ fontSize: 14 }}>{b.icon}</span>
                <span style={{ fontSize: 8, fontWeight: 800, color: "rgba(255,255,255,0.5)", letterSpacing: "0.04em" }}>{b.label}</span>
              </Link>
            ))}
          </div>

          {/* XP / rank strip */}
          <div
            style={{
              display: "flex",
              gap: 14,
              marginTop: 10,
              padding: "8px 0",
              borderTop: "1px solid #1a2a1a",
            }}
          >
            {[
              { label: "XP",   value: "#3"  },
              { label: "FA",   value: "17%" },
              { label: "FANS", value: "70"  },
              { label: "RANK", value: "70"  },
              { label: "SHOW", value: "70"  },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 12, fontWeight: 900, color: ACCENT }}>{s.value}</div>
                <div style={{ fontSize: 7, color: "rgba(255,255,255,0.3)", fontWeight: 700 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Booking panel */}
        <div
          style={{
            width: 140,
            padding: "12px 12px 12px 8px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <div
            style={{
              background: "#050e08",
              border: "1px solid #1a3a1a",
              borderRadius: 8,
              padding: 10,
            }}
          >
            {/* Booking header */}
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 8 }}>
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  background: "#cc8800",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 9,
                }}
              >
                ✓
              </div>
              <span style={{ fontSize: 9, fontWeight: 900, color: ACCENT, letterSpacing: "0.08em" }}>BOOKING</span>
            </div>

            {/* Date */}
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#fff" }}>SAT, 11</span>
              <span style={{ fontSize: 12 }}>📅</span>
            </div>

            {/* Time slots */}
            {[["8 PM", "9 PM"], ["9 PM", "10 PM"]].map(([a, b], i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 4,
                  marginBottom: 4,
                  padding: "6px 8px",
                  background: "#0a1a0a",
                  border: "1px solid #22440022",
                  borderRadius: 5,
                }}
              >
                <span style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.5)" }}>{a}</span>
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)" }}>|</span>
                <span style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.5)" }}>{b}</span>
              </div>
            ))}

            <button
              type="button"
              style={{
                display: "block",
                width: "100%",
                marginTop: 6,
                padding: "6px",
                background: "#0a1408",
                border: "1px solid #33660033",
                borderRadius: 5,
                cursor: "pointer",
                fontSize: 8,
                fontWeight: 900,
                color: ACCENT,
                letterSpacing: "0.08em",
              }}
            >
              REQPUBLISH
            </button>

            {/* Divider */}
            <div style={{ margin: "10px 0", height: 1, background: "#1a2a1a" }} />

            {/* Promote */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                marginBottom: 6,
              }}
            >
              <span style={{ fontSize: 11 }}>→</span>
              <span style={{ fontSize: 8, fontWeight: 800, color: "rgba(255,255,255,0.4)", letterSpacing: "0.06em" }}>PROMOTE YOUR SHOW</span>
            </div>

            <div style={{ fontSize: 8, fontWeight: 800, color: "rgba(255,255,255,0.35)", letterSpacing: "0.06em", marginBottom: 8 }}>
              SPONSOR UPLOAD
            </div>

            {/* Map pin */}
            <div
              style={{
                width: "100%",
                height: 70,
                background: "#080f08",
                border: "1px solid #1a2a1a",
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
              }}
            >
              📍
            </div>
          </div>
        </div>
      </div>

      <BotDock bots={BOT_DOCK} />
    </main>
  );
}

/* ─────────────── LIVE VIEW ─────────────── */
function LiveView({ onEndShow }: { onEndShow: () => void }) {
  const BG = "#060309";
  const ACCENT = "#dd3300";

  const TIP_FANS = [
    { name: "JamesSky", pct: 95 },
    { name: "Lily88",   pct: 62 },
    { name: "Alex94",   pct: 78 },
  ];

  const REACTIONS_LIVE = [
    { id: "thank",    label: "Thank You",     icon: "👍" },
    { id: "hearts",   label: "Throw Hearts",  icon: "❤️" },
    { id: "flicker",  label: "Light Flicker", icon: "💡" },
    { id: "confetti", label: "Confetti",       icon: "🎉" },
    { id: "spark",    label: "Stage Spark",   icon: "✨" },
  ];

  const [reacting, setReacting] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const fireReaction = useCallback((id: string) => {
    setReacting(id);
    setTimeout(() => setReacting(null), 500);
  }, []);

  return (
    <main style={{ minHeight: "100vh", background: BG, color: "#fff", fontFamily: "'Inter', sans-serif" }}>

      {/* Header */}
      <div
        style={{
          padding: "12px 16px 10px",
          borderBottom: "1px solid #1a0a0a",
        }}
      >
        <h1
          style={{
            margin: "0 0 10px",
            fontSize: 20,
            fontWeight: 900,
            color: ACCENT,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          ARTIST DASHBOARD
        </h1>
        {/* Message input + publish */}
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Talk to your fans or pin a message..."
            style={{
              flex: 1,
              padding: "9px 13px",
              background: "#0e0810",
              border: "1px solid #44224444",
              borderRadius: 8,
              color: "#fff",
              fontSize: 12,
              outline: "none",
              fontFamily: "inherit",
            }}
          />
        </div>
        <button
          type="button"
          style={{
            display: "block",
            width: "100%",
            padding: "10px",
            background: `linear-gradient(135deg, ${ACCENT} 0%, #aa2200 100%)`,
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 900,
            color: "#fff",
            letterSpacing: "0.08em",
            boxShadow: `0 0 16px ${ACCENT}44`,
          }}
        >
          Publish
        </button>
      </div>

      {/* Main grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 0 }}>

        {/* Left: stage + interactions + tip */}
        <div style={{ padding: "12px 0 12px 16px" }}>
          {/* Stage */}
          <div
            style={{
              position: "relative",
              background: "#0a0406",
              border: "2px solid #331a1a",
              borderRadius: 8,
              overflow: "hidden",
              aspectRatio: "16/10",
            }}
          >
            {/* ON AIR badge */}
            <div
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                background: "#cc0000",
                borderRadius: 4,
                padding: "3px 8px",
                zIndex: 3,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <div
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: "#fff",
                  boxShadow: "0 0 5px #fff",
                  animation: "pulse 1.5s infinite",
                }}
              />
              <span style={{ fontSize: 8, fontWeight: 900, color: "#fff", letterSpacing: "0.1em" }}>ON AIR</span>
            </div>
            {/* Crowd simulation */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(180deg, #1a0a06 0%, #0d0406 60%, #060202 100%)",
              }}
            />
            {/* Audience heads */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "40%",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                zIndex: 2,
              }}
            >
              {Array.from({ length: 18 }, (_, i) => (
                <div
                  key={i}
                  style={{
                    width: `${4.5 + Math.sin(i * 0.7) * 1}%`,
                    height: `${50 + Math.sin(i * 0.5 + 0.3) * 25}%`,
                    background: "#111",
                    borderRadius: "50% 50% 0 0",
                    flexShrink: 0,
                    opacity: 0.8,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Reactions */}
          <div
            style={{
              display: "flex",
              gap: 8,
              marginTop: 8,
              overflowX: "auto",
              paddingBottom: 2,
            }}
          >
            {REACTIONS_LIVE.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => fireReaction(r.id)}
                style={{
                  flex: "0 0 auto",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 3,
                  padding: "8px 10px",
                  background: reacting === r.id ? "#1a0a0a" : "#0e0810",
                  border: `1px solid ${reacting === r.id ? ACCENT : "#33224433"}`,
                  borderRadius: 9,
                  cursor: "pointer",
                  transform: reacting === r.id ? "scale(1.08)" : "scale(1)",
                  transition: "all 0.15s",
                }}
              >
                <span style={{ fontSize: 18 }}>{r.icon}</span>
                <span style={{ fontSize: 7, color: "rgba(255,255,255,0.35)", fontWeight: 700, whiteSpace: "nowrap" }}>{r.label}</span>
              </button>
            ))}
          </div>

          {/* MERCH + NFT */}
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            {[
              { label: "MERCH", icon: "👕", locked: false },
              { label: "NFT",   icon: "🎨", locked: true  },
            ].map((b) => (
              <button
                key={b.label}
                type="button"
                style={{
                  flex: 1,
                  padding: "8px",
                  background: "#0e0810",
                  border: "1px solid #33224433",
                  borderRadius: 8,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 5,
                }}
              >
                <span style={{ fontSize: 14 }}>{b.icon}</span>
                <span style={{ fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.5)" }}>{b.label}</span>
                {b.locked && <span style={{ fontSize: 10 }}>🔒</span>}
              </button>
            ))}
          </div>

          {/* $ TIP panel */}
          <div
            style={{
              marginTop: 10,
              padding: "10px",
              background: "#0a0810",
              border: "1px solid #33224433",
              borderRadius: 8,
            }}
          >
            <div style={{ fontSize: 9, fontWeight: 900, color: "#00bb88", letterSpacing: "0.1em", marginBottom: 8 }}>$ TIP</div>
            {TIP_FANS.map((f) => (
              <div key={f.name} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", width: 52, flexShrink: 0 }}>{f.name}</span>
                <div
                  style={{
                    flex: 1,
                    height: 6,
                    background: "#1a1a2a",
                    borderRadius: 3,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${f.pct}%`,
                      height: "100%",
                      background: `linear-gradient(90deg, #00bb88, #00dd99)`,
                      borderRadius: 3,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: controls */}
        <div
          style={{
            width: 130,
            padding: "12px 12px 12px 8px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {/* Assistant Mode */}
          <button
            type="button"
            style={{
              padding: "8px",
              background: "#0e0810",
              border: "1px solid #33224433",
              borderRadius: 8,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <span style={{ fontSize: 16 }}>😊</span>
            <span style={{ fontSize: 8, fontWeight: 800, color: "rgba(255,255,255,0.4)", letterSpacing: "0.06em" }}>Assistant Mode</span>
          </button>

          {/* Icon buttons */}
          <div style={{ display: "flex", gap: 6 }}>
            {["🔒", "❤️"].map((icon, i) => (
              <button
                key={i}
                type="button"
                style={{
                  flex: 1,
                  padding: "8px",
                  background: "#0e0810",
                  border: "1px solid #33224433",
                  borderRadius: 7,
                  cursor: "pointer",
                  fontSize: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {icon}
              </button>
            ))}
          </div>

          {/* BOOKNG + VIEW SHOW */}
          <div
            style={{
              background: "#0e0810",
              border: "1px solid #33224433",
              borderRadius: 8,
              padding: "8px",
            }}
          >
            <div style={{ fontSize: 8, fontWeight: 900, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", marginBottom: 5 }}>BOOKNG</div>
            <div style={{ fontSize: 18, marginBottom: 5 }}>📍</div>
            <button
              type="button"
              style={{
                display: "block",
                width: "100%",
                padding: "5px",
                background: "#1a1020",
                border: "1px solid #44224444",
                borderRadius: 5,
                cursor: "pointer",
                fontSize: 8,
                fontWeight: 800,
                color: "rgba(255,255,255,0.45)",
                letterSpacing: "0.06em",
              }}
            >
              VIEW SHOW
            </button>
          </div>

          {/* DAILY SPIN */}
          <div
            style={{
              background: "#0e0810",
              border: "1px solid #33224433",
              borderRadius: 8,
              padding: "8px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 8, fontWeight: 900, color: ACCENT, letterSpacing: "0.1em", marginBottom: 6 }}>DAILY SPIN</div>
            {/* Wheel */}
            <div
              style={{
                width: 70,
                height: 70,
                borderRadius: "50%",
                background: `conic-gradient(
                  #cc3300 0deg 60deg,
                  #993300 60deg 120deg,
                  #cc5500 120deg 180deg,
                  #884400 180deg 240deg,
                  #cc3300 240deg 300deg,
                  #aa4400 300deg 360deg
                )`,
                border: "3px solid #553300",
                margin: "0 auto 8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                boxShadow: "0 0 14px #cc330033",
              }}
            >
              🎰
            </div>
            <button
              type="button"
              style={{
                padding: "6px 14px",
                background: ACCENT,
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 9,
                fontWeight: 900,
                color: "#fff",
                letterSpacing: "0.1em",
              }}
            >
              PLAY
            </button>
          </div>

          {/* End Show */}
          <button
            type="button"
            onClick={onEndShow}
            style={{
              padding: "8px",
              background: "#1a0808",
              border: "1px solid #44111133",
              borderRadius: 7,
              cursor: "pointer",
              fontSize: 9,
              fontWeight: 800,
              color: "#cc4444",
              letterSpacing: "0.06em",
            }}
          >
            ■ END SHOW
          </button>
        </div>
      </div>

      {/* Bot dock */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "8px 16px",
          background: "#030508",
          borderTop: "1px solid #1a0a0a",
          flexWrap: "wrap",
          gap: 6,
        }}
      >
        {LIVE_BOT_DOCK.map((b, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00bb88", boxShadow: "0 0 5px #00bb88" }} />
            <span style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", fontWeight: 700 }}>{b.name}</span>
          </div>
        ))}
      </div>
    </main>
  );
}

/* ─────────────── Page root ─────────────── */
export default function ArtistDashboardPage() {
  const [mode, setMode] = useState<DashMode>("SCHEDULED");

  return mode === "SCHEDULED"
    ? <ScheduledView onGoLive={() => setMode("LIVE")} />
    : <LiveView onEndShow={() => setMode("SCHEDULED")} />;
}
