"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface TabloidOverlayEngineProps {
  primary: string;
  secondary: string;
  crownArtistName: string;
  risingArtistName: string;
  activeGenre: string;
  voteCount: number;
}

const HYPE_BOT_CALLOUTS = [
  (rising: string) => `🤖 HYPE BOT: ${rising} MOVING UP`,
  (rising: string) => `⚡ NEW CHALLENGER: ${rising} JUST ENTERED`,
  (_: string) => `🔥 CROWN CHANGING HANDS TONIGHT`,
  (_: string) => `🚨 VOTE COUNT SPIKING IN FINAL 5 MIN`,
  (rising: string) => `📡 SIGNAL DETECTED: ${rising} ON THE RISE`,
  (_: string) => `🎤 CYPHER ARENA FILLING FAST`,
  (_: string) => `👑 #1 POSITION UNDER THREAT`,
  (rising: string) => `⚡ ${rising} UP 200+ POINTS THIS HOUR`,
] as const;

const STICKER_POOL = [
  { text: "WHO TOOK THE CROWN?",       color: "#FFD700", href: "/battles/weekly-cypher" },
  { text: "CYPHER ARENA OPEN",          color: "#00FFFF", href: "/live/rooms" },
  { text: "DRUM BATTLE LIVE TONIGHT",   color: "#FF2DAA", href: "/battles/live" },
  { text: "NEW MUSIC INSIDE",           color: "#00FF88", href: "/magazine" },
  { text: "STREAM & WIN CREDITS",       color: "#AA2DFF", href: "/live/rooms" },
  { text: "DON'T MISS THIS",            color: "#FF6B35", href: "/battles" },
  { text: "THE INDEX NEVER SLEEPS",     color: "#FFD700", href: "/magazine" },
  { text: "#1 JUST CHANGED",            color: "#FF2DAA", href: "/rankings" },
  { text: "HYPE BOT ACTIVE",            color: "#00FFFF", href: "/live/rooms" },
  { text: "TAKEOVER STARTS NOW",        color: "#AA2DFF", href: "/rankings" },
] as const;

interface Sticker {
  id: number;
  text: string;
  color: string;
  href: string;
  x: number;
  y: number;
  rotation: number;
  leaving: boolean;
}

interface HypeBotCallout {
  id: number;
  text: string;
  leaving: boolean;
}

let _sid = 0;
let _hid = 0;

export default function TabloidOverlayEngine({
  primary,
  secondary,
  crownArtistName,
  risingArtistName,
  activeGenre,
  voteCount,
}: TabloidOverlayEngineProps) {
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [hypeBotCallout, setHypeBotCallout] = useState<HypeBotCallout | null>(null);
  const [headlinePulse, setHeadlinePulse] = useState(false);
  const stickerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hypeBotTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pulseTimerRef   = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sticker spawning engine — spawn 1 sticker every 12–18s
  useEffect(() => {
    let active = true;
    function scheduleNext() {
      const delay = 12000 + Math.random() * 6000;
      stickerTimerRef.current = setTimeout(() => {
        if (!active) return;
        const id = ++_sid;
        const pool = STICKER_POOL[id % STICKER_POOL.length]!;
        // Avoid center of screen (orbit zone)
        const zones = [
          { xMin: 4,  xMax: 22, yMin: 20, yMax: 70 },  // far left
          { xMin: 74, xMax: 90, yMin: 20, yMax: 70 },  // far right
          { xMin: 10, xMax: 60, yMin: 5,  yMax: 18 },  // top strip
          { xMin: 10, xMax: 60, yMin: 78, yMax: 90 },  // bottom strip
        ];
        const zone = zones[id % zones.length]!;
        const x = zone.xMin + Math.random() * (zone.xMax - zone.xMin);
        const y = zone.yMin + Math.random() * (zone.yMax - zone.yMin);
        const rotation = -14 + Math.random() * 28;
        setStickers(prev => [...prev, { id, text: pool.text, color: pool.color, href: pool.href, x, y, rotation, leaving: false }]);
        // Schedule leave
        setTimeout(() => {
          setStickers(prev => prev.map(s => s.id === id ? { ...s, leaving: true } : s));
          setTimeout(() => setStickers(prev => prev.filter(s => s.id !== id)), 700);
        }, 5500);
        scheduleNext();
      }, delay);
    }
    scheduleNext();
    return () => {
      active = false;
      if (stickerTimerRef.current) clearTimeout(stickerTimerRef.current);
    };
  }, []);

  // Hype bot callout — every 8–13s
  useEffect(() => {
    let active = true;
    function scheduleHypeBot() {
      const delay = 8000 + Math.random() * 5000;
      hypeBotTimerRef.current = setTimeout(() => {
        if (!active) return;
        const id = ++_hid;
        const fn = HYPE_BOT_CALLOUTS[id % HYPE_BOT_CALLOUTS.length]!;
        const text = fn(risingArtistName);
        setHypeBotCallout({ id, text, leaving: false });
        setTimeout(() => {
          setHypeBotCallout(prev => prev?.id === id ? { ...prev, leaving: true } : prev);
          setTimeout(() => setHypeBotCallout(prev => prev?.id === id ? null : prev), 600);
        }, 4000);
        scheduleHypeBot();
      }, delay);
    }
    scheduleHypeBot();
    return () => {
      active = false;
      if (hypeBotTimerRef.current) clearTimeout(hypeBotTimerRef.current);
    };
  }, [risingArtistName]);

  // Headline belt pulse every 4s
  useEffect(() => {
    pulseTimerRef.current = setInterval(() => {
      setHeadlinePulse(true);
      setTimeout(() => setHeadlinePulse(false), 700);
    }, 4000);
    return () => { if (pulseTimerRef.current) clearInterval(pulseTimerRef.current); };
  }, []);

  return (
    <>
      <style>{`
        @keyframes stickerSlap {
          0%   { opacity:0; transform:var(--sticker-rot) scale(0.06) translateY(14px); }
          55%  { opacity:1; transform:var(--sticker-rot) scale(1.12) translateY(-3px); }
          72%  { transform:var(--sticker-rot) scale(0.97) translateY(1px); }
          100% { opacity:1; transform:var(--sticker-rot) scale(1) translateY(0); }
        }
        @keyframes stickerLeave {
          0%   { opacity:1; transform:var(--sticker-rot) scale(1) translateY(0); }
          100% { opacity:0; transform:var(--sticker-rot) scale(0.82) translateY(-16px); }
        }
        @keyframes hypeBotSlideIn {
          0%   { opacity:0; transform:translateX(-24px) scale(0.88); }
          60%  { opacity:1; transform:translateX(4px) scale(1.04); }
          100% { opacity:1; transform:translateX(0) scale(1); }
        }
        @keyframes hypeBotSlideOut {
          0%   { opacity:1; transform:translateX(0); }
          100% { opacity:0; transform:translateX(-20px); }
        }
        @keyframes votingPulse {
          0%,100% { box-shadow:0 0 18px rgba(255,215,0,0.25), inset 0 0 12px rgba(255,215,0,0.06); }
          50%     { box-shadow:0 0 36px rgba(255,215,0,0.55), inset 0 0 20px rgba(255,215,0,0.14); }
        }
        @keyframes headlineBelt {
          0%   { transform:translateX(0); }
          100% { transform:translateX(-50%); }
        }
        @keyframes ringGlow {
          0%,100% { opacity:0.25; }
          50%     { opacity:0.8; }
        }
      `}</style>

      {/* ── VOTING LIVE banner ─────────────────────────────────────── */}
      <div style={{
        margin: "6px auto 0",
        maxWidth: 520, width: "90%",
        background: "#1C0A3E",
        border: `2px solid ${headlinePulse ? "#fff" : "#FFD700"}`,
        borderRadius: 28,
        padding: "7px 20px",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
        position: "relative", zIndex: 20, flexShrink: 0,
        transition: "border-color 0.15s ease",
        animation: "votingPulse 2s ease-in-out infinite",
      }}>
        <span style={{
          width: 8, height: 8, borderRadius: "50%", background: "#FF3B30",
          boxShadow: "0 0 8px #FF3B30", flexShrink: 0,
          animation: "ringGlow 1s ease-in-out infinite",
        }} />
        <span style={{
          fontSize: 11, fontWeight: 900, letterSpacing: "0.12em",
          color: headlinePulse ? "#fff" : "#FFD700",
          textTransform: "uppercase", transition: "color 0.15s ease",
        }}>
          VOTING LIVE!
        </span>
        <span style={{ width: 1, height: 14, background: "rgba(255,215,0,0.4)", flexShrink: 0 }} />
        <span style={{
          fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.85)",
          letterSpacing: "0.06em",
        }}>
          {voteCount.toLocaleString()} VOTES &nbsp;·&nbsp; {activeGenre.toUpperCase()}
        </span>
      </div>

      {/* ── Scrolling headline belt ──────────────────────────────────── */}
      <div style={{
        background: "rgba(0,0,0,0.38)",
        borderTop: "1px solid rgba(255,215,0,0.2)",
        borderBottom: "1px solid rgba(255,215,0,0.2)",
        overflow: "hidden", height: 22,
        display: "flex", alignItems: "center",
        position: "relative", zIndex: 20, flexShrink: 0,
      }}>
        <div style={{
          display: "flex", whiteSpace: "nowrap",
          animation: "headlineBelt 40s linear infinite",
          willChange: "transform",
        }}>
          {[0, 1].map(rep => (
            <span key={rep} style={{ display: "inline-flex", alignItems: "center" }}>
              {[
                `👑 ${crownArtistName} HOLDS #1 — FOR NOW`,
                `⚡ CYPHER ARENA OPEN • STREAM & WIN`,
                `🎤 ${activeGenre.toUpperCase()} GENRE BATTLE LIVE`,
                `🔥 CROWN UPDATING IN REAL-TIME`,
                `🚨 TONIGHT'S BATTLE LINEUP JUST DROPPED`,
                `📡 THE INDEX TRACKS EVERY MOVE`,
              ].map((line, i) => (
                <span key={i} style={{ display: "inline-flex", alignItems: "center" }}>
                  <span style={{
                    fontSize: 8, fontWeight: 900, letterSpacing: "0.1em",
                    paddingLeft: 32, paddingRight: 8,
                    color: i % 3 === 0 ? "#FFD700" : i % 3 === 1 ? secondary : "rgba(255,255,255,0.7)",
                  }}>
                    {line}
                  </span>
                  <span style={{ color: "#AA2DFF", fontSize: 8, opacity: 0.8 }}>◆</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ── Dynamic sticker overlays ─────────────────────────────────── */}
      {stickers.map(sticker => (
        <div
          key={sticker.id}
          style={{
            position: "fixed",
            left: `${sticker.x}%`,
            top: `${sticker.y}%`,
            zIndex: 600,
            ["--sticker-rot" as string]: `rotate(${sticker.rotation}deg)`,
            pointerEvents: "auto",
          }}
        >
          <Link href={sticker.href} style={{ textDecoration: "none" }}>
            <div style={{
              background: `${sticker.color}f2`,
              color: "#050510",
              padding: "9px 14px",
              fontFamily: "var(--font-tmi-impact,'Bebas Neue','Impact',sans-serif)",
              fontWeight: 900,
              fontSize: 12,
              letterSpacing: "0.06em",
              maxWidth: 200,
              lineHeight: 1.3,
              boxShadow: `0 4px 24px rgba(0,0,0,0.65), 0 0 0 2.5px rgba(0,0,0,0.35), 0 0 18px ${sticker.color}66`,
              clipPath: "polygon(0 8px,8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%)",
              animation: sticker.leaving
                ? "stickerLeave 0.65s cubic-bezier(0.7,0,0.3,1) forwards"
                : "stickerSlap 0.55s cubic-bezier(0.7,0,0.3,1) both",
              cursor: "pointer",
            }}>
              {sticker.text}
            </div>
          </Link>
        </div>
      ))}

      {/* ── Hype Bot floating callout ────────────────────────────────── */}
      {hypeBotCallout && (
        <div style={{
          position: "fixed",
          bottom: 110,
          left: 20,
          zIndex: 610,
          animation: hypeBotCallout.leaving
            ? "hypeBotSlideOut 0.55s cubic-bezier(0.7,0,0.3,1) forwards"
            : "hypeBotSlideIn 0.55s cubic-bezier(0.16,1,0.3,1) both",
          pointerEvents: "none",
        }}>
          <div style={{
            background: "rgba(5,5,16,0.96)",
            border: `1px solid ${primary}88`,
            borderLeft: `4px solid ${primary}`,
            borderRadius: 0,
            clipPath: "polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px))",
            padding: "8px 16px",
            fontSize: 10,
            fontWeight: 900,
            letterSpacing: "0.08em",
            color: primary,
            boxShadow: `0 4px 20px rgba(0,0,0,0.65), 0 0 16px ${primary}33`,
            backdropFilter: "blur(12px)",
            maxWidth: 280,
            textShadow: `0 0 12px ${primary}66`,
          }}>
            {hypeBotCallout.text}
          </div>
        </div>
      )}
    </>
  );
}
