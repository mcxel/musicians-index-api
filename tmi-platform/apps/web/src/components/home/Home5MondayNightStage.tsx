"use client";

/**
 * Home5MondayNightStage.tsx
 * Section D — MONDAY NIGHT STAGE
 * Permanent premium anchor event. Featured host, contestants, sponsor, prize pool.
 * Live countdown ticks every second. Reward strip: 5,000 pts + XP + Store + Badge.
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import { mondayNightStageEngine } from "@/lib/competition/MondayNightStageEngine";

function formatCountdown(totalSeconds: number): { h: string; m: string; s: string } {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return {
    h: String(h).padStart(2, "0"),
    m: String(m).padStart(2, "0"),
    s: String(s).padStart(2, "0"),
  };
}

export default function Home5MondayNightStage() {
  const [countdown, setCountdown] = useState(0);
  const [show, setShow] = useState(() => mondayNightStageEngine.getNextUpcomingShow());

  useEffect(() => {
    setShow(mondayNightStageEngine.getNextUpcomingShow());
    setCountdown(mondayNightStageEngine.getCountdownToNextShow());

    const t = setInterval(() => {
      setCountdown((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const timeLeft = formatCountdown(countdown);
  const isLive = show?.status === "live" || countdown <= 0;

  return (
    <section
      style={{
        border: "1px solid rgba(255,215,0,0.4)",
        borderRadius: 14,
        overflow: "hidden",
        background: "linear-gradient(135deg, rgba(255,215,0,0.07) 0%, rgba(5,5,16,0.98) 60%, rgba(255,107,53,0.06) 100%)",
        boxShadow: "0 0 40px rgba(255,215,0,0.08)",
      }}
    >
      {/* Premium header bar */}
      <div
        style={{
          background: "linear-gradient(90deg, rgba(255,215,0,0.18) 0%, rgba(255,107,53,0.18) 100%)",
          borderBottom: "1px solid rgba(255,215,0,0.3)",
          padding: "10px 18px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <span
          style={{
            fontSize: 18,
            fontWeight: 900,
            fontFamily: "var(--font-tmi-bebas, 'Bebas Neue', Impact, sans-serif)",
            letterSpacing: "0.12em",
            color: "#FFD700",
            textShadow: "0 0 20px rgba(255,215,0,0.6)",
          }}
        >
          ★ MONDAY NIGHT STAGE
        </span>
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          {isLive ? (
            <span
              style={{
                background: "rgba(255,0,64,0.9)",
                borderRadius: 999,
                padding: "3px 12px",
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: "0.1em",
              }}
            >
              ● LIVE NOW
            </span>
          ) : (
            <span style={{ fontSize: 11, opacity: 0.6 }}>Every Monday · 8PM</span>
          )}
        </div>
      </div>

      {/* Main content */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: 0,
          padding: 18,
        }}
      >
        {/* Left — show info */}
        <div style={{ display: "grid", gap: 14 }}>
          {/* Sponsor + theme */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                background: "rgba(255,215,0,0.12)",
                border: "1px solid rgba(255,215,0,0.3)",
                borderRadius: 6,
                padding: "4px 10px",
                fontSize: 10,
                fontWeight: 700,
                color: "#FFD700",
                letterSpacing: "0.06em",
              }}
            >
              {show?.sponsorName ?? "TMI PRESENTS"}
            </div>
            <div style={{ fontSize: 13, opacity: 0.7 }}>
              {show?.theme ?? "Monday Night Battle"}
            </div>
          </div>

          {/* Featured host */}
          <div style={{ display: "grid", gap: 4 }}>
            <div style={{ fontSize: 10, opacity: 0.5, letterSpacing: "0.08em" }}>HOST</div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 900,
                fontFamily: "var(--font-tmi-bebas, 'Bebas Neue', Impact, sans-serif)",
                letterSpacing: "0.06em",
                color: "#FFD700",
              }}
            >
              {show?.hostName ?? "TMI Host"}
            </div>
          </div>

          {/* Featured contestant */}
          {show?.featured && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                padding: "8px 12px",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: show.featured.image
                    ? `url(${show.featured.image}) center/cover`
                    : "rgba(255,215,0,0.3)",
                  border: "2px solid rgba(255,215,0,0.5)",
                }}
              />
              <div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{show.featured.name}</div>
                <div style={{ fontSize: 11, opacity: 0.6 }}>{show.featured.genre}</div>
                <div style={{ fontSize: 10, color: "#FFD700" }}>
                  {show.featured.previousWins} wins
                </div>
              </div>
              <div style={{ marginLeft: "auto", fontSize: 10, opacity: 0.6 }}>FEATURED</div>
            </div>
          )}

          {/* Reward strip */}
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              padding: "10px 14px",
              background: "rgba(255,215,0,0.06)",
              border: "1px solid rgba(255,215,0,0.2)",
              borderRadius: 8,
            }}
          >
            <div style={{ fontSize: 11, opacity: 0.6, width: "100%", marginBottom: 4, letterSpacing: "0.06em" }}>
              WINNER REWARDS
            </div>
            {[
              { label: "5,000 PTS", color: "#FFD700" },
              { label: "600 XP", color: "#00FF88" },
              { label: "STORE ITEM", color: "#AA2DFF" },
              { label: "BADGE", color: "#00FFFF" },
            ].map(({ label, color }) => (
              <div
                key={label}
                style={{
                  background: `${color}18`,
                  border: `1px solid ${color}44`,
                  borderRadius: 6,
                  padding: "4px 10px",
                  fontSize: 11,
                  fontWeight: 700,
                  color,
                  letterSpacing: "0.05em",
                }}
              >
                {label}
              </div>
            ))}
            {show?.prizePool && (
              <div
                style={{
                  background: "rgba(255,107,53,0.15)",
                  border: "1px solid rgba(255,107,53,0.3)",
                  borderRadius: 6,
                  padding: "4px 10px",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#FF6B35",
                  letterSpacing: "0.05em",
                }}
              >
                ${show.prizePool.toLocaleString()} PRIZE
              </div>
            )}
          </div>

          {/* Join CTA */}
          <div style={{ display: "flex", gap: 10 }}>
            <Link
              href="/games/monday-night"
              style={{
                background: isLive
                  ? "linear-gradient(135deg, #FF0040, #FF2DAA)"
                  : "linear-gradient(135deg, #FFD700, #FF6B35)",
                color: isLive ? "#fff" : "#000",
                borderRadius: 8,
                padding: "12px 24px",
                fontWeight: 900,
                fontSize: 15,
                textAlign: "center",
                textDecoration: "none",
                letterSpacing: "0.1em",
                fontFamily: "var(--font-tmi-bebas, 'Bebas Neue', Impact, sans-serif)",
              }}
            >
              {isLive ? "WATCH LIVE" : "GET A SPOT"}
            </Link>
            <Link
              href="/games"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.7)",
                borderRadius: 8,
                padding: "12px 20px",
                fontWeight: 700,
                fontSize: 13,
                textAlign: "center",
                textDecoration: "none",
              }}
            >
              Past Shows
            </Link>
          </div>
        </div>

        {/* Right — Countdown clock */}
        <div
          style={{
            display: "grid",
            alignContent: "center",
            gap: 4,
            textAlign: "center",
            paddingLeft: 24,
            borderLeft: "1px solid rgba(255,215,0,0.2)",
            minWidth: 130,
          }}
        >
          {isLive ? (
            <>
              <div style={{ fontSize: 10, opacity: 0.6, letterSpacing: "0.1em" }}>STATUS</div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 900,
                  fontFamily: "var(--font-tmi-bebas, 'Bebas Neue', Impact, sans-serif)",
                  color: "#FF0040",
                  letterSpacing: "0.1em",
                  animation: "none",
                }}
              >
                ON AIR
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 10, opacity: 0.6, letterSpacing: "0.1em" }}>NEXT SHOW</div>
              <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                {[
                  { value: timeLeft.h, label: "HRS" },
                  { value: timeLeft.m, label: "MIN" },
                  { value: timeLeft.s, label: "SEC" },
                ].map(({ value, label }) => (
                  <div key={label} style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: 28,
                        fontWeight: 700,
                        fontFamily: "Orbitron, monospace",
                        color: "#FFD700",
                        lineHeight: 1,
                      }}
                    >
                      {value}
                    </div>
                    <div style={{ fontSize: 8, opacity: 0.5, letterSpacing: "0.08em" }}>
                      {label}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 10, opacity: 0.5, marginTop: 4 }}>
                Every Monday 8PM
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
