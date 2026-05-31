"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSmartRoom } from "@/lib/rooms/SmartRoomRouter";
import type { FanSubscriptionTier } from "./FanTierSkinEngine";

type FanHubShellProps = {
  fanSlug: string;
  displayName: string;
  tier: FanSubscriptionTier;
  tagline: string;
  startingPoints: number;
  previewWindow?: React.ReactNode;
};

const SPOTLIGHT = { name: "Chario Ace", genre: "HIP-HOP", nextShow: "8:00 PM" };

const REACTIONS = [
  { id: "thank",    label: "Thank You",     icon: "👍",  pts: 5  },
  { id: "hearts",   label: "Throw Hearts",  icon: "❤️",  pts: 8  },
  { id: "flicker",  label: "Light Flicker", icon: "🤚",  pts: 3  },
  { id: "confetti", label: "Confetti",      icon: "🎉",  pts: 6  },
  { id: "spark",    label: "Stage Spark",   icon: "✨",  pts: 10 },
];

const BOT_DOT_COLOR = "#cc2200";

function MarqueeBulbs({ count = 32, accent = "#ff6600" }: { count?: number; accent?: string }) {
  return (
    <div style={{ display: "flex", gap: 3, alignItems: "center", padding: "3px 6px" }}>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: 6,
            borderRadius: "50%",
            background: i % 2 === 0 ? accent : "#ff9900",
            boxShadow: i % 2 === 0 ? `0 0 5px ${accent}` : "0 0 5px #ff9900",
            opacity: 0.55 + (i % 3) * 0.15,
          }}
        />
      ))}
    </div>
  );
}

function AudienceSilhouettes() {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "36%",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        gap: 0,
        zIndex: 3,
      }}
    >
      {Array.from({ length: 16 }, (_, i) => {
        const h = 55 + Math.sin(i * 0.65 + 0.4) * 18;
        const w = 5.5 + Math.sin(i * 0.9) * 1.2;
        return (
          <div
            key={i}
            style={{
              width: `${w}%`,
              height: `${h}%`,
              background: "radial-gradient(ellipse at 50% 20%, #1a1010 0%, #080404 100%)",
              borderRadius: "50% 50% 0 0",
              flexShrink: 0,
              opacity: 0.92,
            }}
          />
        );
      })}
    </div>
  );
}

export default function FanHubShell({
  fanSlug,
  displayName,
  tier,
  startingPoints,
}: FanHubShellProps) {
  const router = useRouter();
  const [points, setPoints] = useState(startingPoints);
  const [message, setMessage] = useState("");
  const [fired, setFired] = useState<string | null>(null);
  const [tipSent, setTipSent] = useState(false);
  const spinLocked = tier === "free";

  const goToShow = useCallback(() => {
    const roomId = getSmartRoom();
    router.push(`/live/rooms/${roomId}?from=fan-hub&fan=${fanSlug}`);
  }, [router, fanSlug]);

  const fireReaction = useCallback((id: string, pts: number) => {
    setFired(id);
    setPoints((p) => p + pts);
    setTimeout(() => setFired(null), 550);
  }, []);

  const sendTip = useCallback(() => {
    setTipSent(true);
    setTimeout(() => setTipSent(false), 1800);
  }, []);

  // Disable body scroll when viewing full-screen
  useEffect(() => {
    document.body.style.overscrollBehavior = "contain";
    return () => { document.body.style.overscrollBehavior = ""; };
  }, []);

  const BG = "#040610";
  const ACCENT = "#cc2200";
  const PANEL_BG = "#07091a";
  const BORDER = "#cc220033";

  return (
    <main
      style={{
        minHeight: "100vh",
        background: BG,
        color: "#fff",
        fontFamily: "'Inter', 'SF Pro Display', sans-serif",
        overflowX: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Top header ── */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 14px",
          borderBottom: `1px solid ${BORDER}`,
          background: "#030510",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{ fontSize: 18 }}>💀</span>
          <span
            style={{
              fontSize: 17,
              fontWeight: 900,
              letterSpacing: "0.05em",
              color: "#ff4422",
              textTransform: "uppercase",
            }}
          >
            FAN DASHBOARD
          </span>
          <span style={{ fontSize: 18 }}>💀</span>
        </div>
        <Link
          href="/fan/trivia"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "6px 12px",
            background: "#160606",
            border: "1px solid #cc220044",
            borderRadius: 8,
            textDecoration: "none",
          }}
        >
          <span style={{ fontSize: 14 }}>💀</span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 900,
              color: "#ff4422",
              letterSpacing: "0.1em",
            }}
          >
            TRIVA
          </span>
        </Link>
      </header>

      {/* ── Artist spotlight + SPIN / VOTE ── */}
      <div
        style={{
          padding: "10px 14px",
          background: "#05060f",
          borderBottom: `1px solid ${BORDER}`,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 12,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 8,
                color: "rgba(255,255,255,0.38)",
                letterSpacing: "0.18em",
                fontWeight: 700,
                marginBottom: 3,
              }}
            >
              Artist Spotlight
            </div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 900,
                color: "#ff6644",
                lineHeight: 1.1,
                marginBottom: 2,
              }}
            >
              {SPOTLIGHT.name}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", fontWeight: 700, letterSpacing: "0.1em" }}>
                {SPOTLIGHT.genre}
              </span>
              <span style={{ fontSize: 12, color: "#ff6644" }}>▶</span>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: 8,
                color: "rgba(255,255,255,0.38)",
                letterSpacing: "0.14em",
                fontWeight: 700,
                marginBottom: 2,
              }}
            >
              NEXT SHOW
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: "#ff6644", lineHeight: 1 }}>
              {SPOTLIGHT.nextShow}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <button
            type="button"
            onClick={() => !spinLocked && setPoints((p) => p + 50)}
            style={{
              flex: 1,
              padding: "10px 8px",
              background: "#0c0814",
              border: "1px solid #44228866",
              borderRadius: 10,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              cursor: spinLocked ? "not-allowed" : "pointer",
              opacity: spinLocked ? 0.55 : 1,
            }}
          >
            <span style={{ fontSize: 20 }}>🔒</span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 900,
                color: "#cc88ff",
                letterSpacing: "0.08em",
              }}
            >
              SPIN
            </span>
          </button>
          <button
            type="button"
            onClick={goToShow}
            style={{
              flex: 1,
              padding: "10px 8px",
              background: "#081408",
              border: "1px solid #22440066",
              borderRadius: 10,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              cursor: "pointer",
            }}
          >
            <span style={{ fontSize: 20, color: "#44cc88" }}>✓</span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 900,
                color: "#44cc88",
                letterSpacing: "0.08em",
              }}
            >
              VOTE
            </span>
          </button>
        </div>
      </div>

      {/* ── Main area: stage + right panel ── */}
      <div style={{ display: "flex", gap: 0, flex: 1, minHeight: 0 }}>

        {/* Stage column */}
        <div style={{ flex: 1, padding: "10px 0 10px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
          <MarqueeBulbs accent="#ff6600" />

          {/* Stage frame */}
          <div
            style={{
              position: "relative",
              borderRadius: 8,
              overflow: "hidden",
              border: "3px solid #ff6600",
              boxShadow: "0 0 24px #ff660033, inset 0 0 50px #00000099",
              background: "#080205",
              aspectRatio: "4/3",
              flexShrink: 0,
            }}
          >
            {/* Curtain gradient */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(180deg, #3d0a0a 0%, #220606 45%, #100303 75%, #050101 100%)",
                zIndex: 0,
              }}
            />
            {/* Stage lighting haze */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "20%",
                right: "20%",
                height: "50%",
                background:
                  "radial-gradient(ellipse at 50% 0%, rgba(255,100,60,0.12) 0%, transparent 70%)",
                zIndex: 1,
              }}
            />
            <AudienceSilhouettes />
          </div>

          <MarqueeBulbs accent="#ff6600" />
        </div>

        {/* Right panel */}
        <div
          style={{
            width: 118,
            flexShrink: 0,
            padding: "10px 10px 10px 8px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {/* SHOP */}
          <div
            style={{
              background: PANEL_BG,
              border: `1px solid ${BORDER}`,
              borderRadius: 8,
              padding: "8px 6px",
            }}
          >
            <div
              style={{
                fontSize: 8,
                letterSpacing: "0.2em",
                color: "#cc88ff",
                fontWeight: 900,
                textAlign: "center",
                marginBottom: 5,
              }}
            >
              SHOP
            </div>
            <div
              style={{
                fontSize: 7,
                color: "rgba(255,255,255,0.38)",
                fontWeight: 700,
                textAlign: "center",
                marginBottom: 6,
                letterSpacing: "0.06em",
              }}
            >
              COSMETIC STORE
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-around",
                marginBottom: 8,
              }}
            >
              {["FREE", "RAF", "EPIC"].map((label) => (
                <div key={label} style={{ textAlign: "center" }}>
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      background: "#120e22",
                      border: "1.5px solid #44224466",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      margin: "0 auto 3px",
                    }}
                  >
                    ⭕
                  </div>
                  <span
                    style={{
                      fontSize: 6,
                      color: "rgba(255,255,255,0.3)",
                      fontWeight: 700,
                      letterSpacing: "0.05em",
                    }}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-around" }}>
              {(["🔒", "🏪", "⭐"] as const).map((icon, i) => (
                <button
                  key={i}
                  type="button"
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    background: "#12102a",
                    border: "1px solid #33224444",
                    fontSize: 13,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* BILLBOARD FANS */}
          <div
            style={{
              background: PANEL_BG,
              border: `1px solid ${BORDER}`,
              borderRadius: 8,
              padding: "8px 6px",
            }}
          >
            <div
              style={{
                fontSize: 7,
                letterSpacing: "0.14em",
                color: "#cc88ff",
                fontWeight: 900,
                textAlign: "center",
                marginBottom: 7,
              }}
            >
              BILLBOARD FANS
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ fontSize: 13 }}>👤</span>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#cc88ff" }}>38.5K</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ fontSize: 13 }}>❤</span>
                <span style={{ fontSize: 11, fontWeight: 700 }}>
                  8
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ fontSize: 13 }}>😊</span>
                <span
                  style={{ fontSize: 8, color: "rgba(255,255,255,0.45)", fontWeight: 600 }}
                >
                  SByeeGil
                </span>
              </div>
            </div>
          </div>

          {/* PUNPOINTS */}
          <button
            type="button"
            style={{
              padding: "8px 4px",
              background: "#160a06",
              border: "1px solid #cc660044",
              borderRadius: 8,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
            }}
          >
            <span style={{ fontSize: 15 }}>🪙</span>
            <span
              style={{
                fontSize: 7,
                fontWeight: 900,
                color: "#ff9944",
                letterSpacing: "0.08em",
              }}
            >
              PUNPOINTS
            </span>
          </button>

          {/* Points display */}
          <div
            style={{
              textAlign: "center",
              padding: "6px 4px",
              background: "#0a0712",
              border: "1px solid #33224433",
              borderRadius: 7,
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 900, color: "#cc88ff" }}>
              {points.toLocaleString()}
            </div>
            <div style={{ fontSize: 6, color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em", fontWeight: 700 }}>
              PTS
            </div>
          </div>
        </div>
      </div>

      {/* ── Reaction bar ── */}
      <div
        style={{
          display: "flex",
          gap: 8,
          padding: "8px 14px",
          overflowX: "auto",
          borderTop: `1px solid ${BORDER}`,
          flexShrink: 0,
          msOverflowStyle: "none",
          scrollbarWidth: "none",
        }}
      >
        {REACTIONS.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => fireReaction(r.id, r.pts)}
            style={{
              flex: "0 0 auto",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              padding: "9px 11px",
              background: fired === r.id ? `${ACCENT}1a` : "#07091a",
              border: `1px solid ${fired === r.id ? ACCENT : "#33224433"}`,
              borderRadius: 10,
              cursor: "pointer",
              transform: fired === r.id ? "scale(1.1)" : "scale(1)",
              transition: "all 0.15s",
            }}
          >
            <span style={{ fontSize: 20 }}>{r.icon}</span>
            <span
              style={{
                fontSize: 7,
                color: "rgba(255,255,255,0.4)",
                fontWeight: 700,
                whiteSpace: "nowrap",
                letterSpacing: "0.04em",
              }}
            >
              {r.label}
            </span>
          </button>
        ))}
      </div>

      {/* ── Crowd message input ── */}
      <div style={{ padding: "6px 14px 0", flexShrink: 0 }}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Say something to the crowd..."
          style={{
            width: "100%",
            padding: "11px 15px",
            background: "#07091a",
            border: "1px solid #33224444",
            borderRadius: 10,
            color: "#fff",
            fontSize: 12,
            outline: "none",
            boxSizing: "border-box",
            fontFamily: "inherit",
          }}
        />
      </div>

      {/* ── Bot dock ── */}
      <div
        style={{
          display: "flex",
          gap: 16,
          padding: "8px 14px",
          borderTop: `1px solid ${BORDER}`,
          overflowX: "auto",
          flexShrink: 0,
          msOverflowStyle: "none",
          scrollbarWidth: "none",
        }}
      >
        {["StageManagerBot", "BookingBot", "ChatGuardBot"].map((bot) => (
          <div key={bot} style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: BOT_DOT_COLOR,
                boxShadow: `0 0 5px ${BOT_DOT_COLOR}`,
              }}
            />
            <span
              style={{
                fontSize: 8,
                color: "rgba(255,255,255,0.35)",
                fontWeight: 700,
                whiteSpace: "nowrap",
              }}
            >
              {bot}
            </span>
          </div>
        ))}
      </div>

      {/* ── Video player controls bar ── */}
      <div
        style={{
          position: "sticky",
          bottom: 0,
          background: "#07050c",
          borderTop: "1px solid #22111122",
          padding: "8px 14px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexShrink: 0,
        }}
      >
        {/* $ TIP */}
        <button
          type="button"
          onClick={sendTip}
          style={{
            padding: "6px 13px",
            background: tipSent ? "#009900" : "#006600",
            border: "none",
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 900,
            color: "#fff",
            cursor: "pointer",
            letterSpacing: "0.06em",
            transition: "background 0.2s",
            flexShrink: 0,
          }}
        >
          $ TIP
        </button>

        <div style={{ width: 1, height: 20, background: "#33333355", flexShrink: 0 }} />

        {/* Controls */}
        {[
          { icon: "▶", label: "play", action: goToShow },
          { icon: "👋", label: "wave", action: () => fireReaction("wave", 3) },
          { icon: "❤️", label: "heart", action: () => fireReaction("hearts", 8) },
          { icon: "🔊", label: "audio", action: () => {} },
          { icon: "⚙️", label: "settings", action: () => {} },
          { icon: "⛶", label: "fullscreen", action: goToShow },
        ].map((c) => (
          <button
            key={c.label}
            type="button"
            onClick={c.action}
            aria-label={c.label}
            style={{
              background: "none",
              border: "none",
              fontSize: 16,
              color: "#aa7766",
              cursor: "pointer",
              padding: "4px",
              opacity: 0.7,
              flexShrink: 0,
            }}
          >
            {c.icon}
          </button>
        ))}

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", fontWeight: 700 }}>
            {displayName}
          </span>
        </div>
      </div>
    </main>
  );
}
