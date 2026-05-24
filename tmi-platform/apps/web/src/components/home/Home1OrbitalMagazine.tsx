"use client";

import { useEffect, useRef, useState } from "react";
import HomeNavigator from "@/components/home/HomeNavigator";
import FooterHUD from "@/components/hud/FooterHUD";
import {
  getCurrentIssue,
  getIssueByGenre,
  STATIC_TEASERS,
  STATIC_LEAKS,
  type Genre,
} from "@/lib/magazine/IndexMagazineEngine";

// ─── Orbit constants ──────────────────────────────────────────────────────────

const RING_SIZE = 520;
const ORBIT_RADIUS = 218;
const CARD_W = 82;
const CARD_H = 102;
const ORBIT_DURATION = 44; // seconds per rotation
const NUM_ARTISTS = 9;

// ─── Seed artists ─────────────────────────────────────────────────────────────

const SEED_ARTISTS = [
  { name: "Astra Nova",    rank: 1, genre: "Hip Hop"    as Genre, score: 9820, delta: +312 },
  { name: "Lev Mirage",    rank: 2, genre: "R&B"        as Genre, score: 9480, delta: +88  },
  { name: "Prism Vex",     rank: 3, genre: "Electronic" as Genre, score: 9110, delta: -44  },
  { name: "Sable Court",   rank: 4, genre: "Pop"        as Genre, score: 8740, delta: +201 },
  { name: "Koda Rush",     rank: 5, genre: "Hip Hop"    as Genre, score: 8390, delta: -130 },
  { name: "Ivory Arc",     rank: 6, genre: "Jazz"       as Genre, score: 7950, delta: +67  },
  { name: "Torque Sin",    rank: 7, genre: "Rock"       as Genre, score: 7620, delta: +22  },
  { name: "Neon Psalms",   rank: 8, genre: "R&B"        as Genre, score: 7200, delta: -88  },
  { name: "Velox Prime",   rank: 9, genre: "Electronic" as Genre, score: 6890, delta: +155 },
];

// ─── Genre palette ────────────────────────────────────────────────────────────

const GENRE_PALETTE: Record<Genre, { primary: string; secondary: string; bg: string }> = {
  "Hip Hop":    { primary: "#AA2DFF", secondary: "#00FFFF", bg: "radial-gradient(ellipse at 20% 30%, rgba(120,0,255,0.6) 0%, transparent 55%), radial-gradient(ellipse at 80% 70%, rgba(0,200,180,0.4) 0%, transparent 55%), linear-gradient(160deg,#12043a 0%,#080c2a 50%,#061018 100%)" },
  "R&B":        { primary: "#00FF88", secondary: "#FF2DAA", bg: "radial-gradient(ellipse at 30% 20%, rgba(0,120,80,0.55) 0%, transparent 55%), radial-gradient(ellipse at 70% 80%, rgba(255,50,170,0.3) 0%, transparent 55%), linear-gradient(160deg,#031a0e 0%,#080d18 50%,#06100d 100%)" },
  "Pop":        { primary: "#FFD700", secondary: "#FF2DAA", bg: "radial-gradient(ellipse at 50% 20%, rgba(255,180,0,0.5) 0%, transparent 55%), radial-gradient(ellipse at 20% 80%, rgba(255,80,200,0.35) 0%, transparent 55%), linear-gradient(160deg,#1a1000 0%,#120e00 50%,#0a0800 100%)" },
  "Rock":       { primary: "#00FFFF", secondary: "#FF6600", bg: "radial-gradient(ellipse at 10% 50%, rgba(0,200,255,0.5) 0%, transparent 55%), radial-gradient(ellipse at 90% 50%, rgba(255,120,0,0.35) 0%, transparent 55%), linear-gradient(160deg,#001a1a 0%,#080c10 50%,#040606 100%)" },
  "Electronic": { primary: "#FF2DAA", secondary: "#00FFFF", bg: "radial-gradient(ellipse at 80% 20%, rgba(255,0,150,0.5) 0%, transparent 55%), radial-gradient(ellipse at 20% 80%, rgba(0,200,255,0.35) 0%, transparent 55%), linear-gradient(160deg,#1a0010 0%,#0d0818 50%,#030810 100%)" },
  "Jazz":       { primary: "#4488FF", secondary: "#FFD700", bg: "radial-gradient(ellipse at 30% 40%, rgba(30,80,255,0.5) 0%, transparent 55%), radial-gradient(ellipse at 70% 60%, rgba(255,180,0,0.25) 0%, transparent 55%), linear-gradient(160deg,#000a1a 0%,#040810 50%,#020608 100%)" },
};

// ─── Orbit math ───────────────────────────────────────────────────────────────

function orbitPos(i: number): { left: number; top: number } {
  const angleRad = ((-90 + i * (360 / NUM_ARTISTS)) * Math.PI) / 180;
  const cx = RING_SIZE / 2;
  const cy = RING_SIZE / 2;
  return {
    left: cx + ORBIT_RADIUS * Math.cos(angleRad) - CARD_W / 2,
    top:  cy + ORBIT_RADIUS * Math.sin(angleRad) - CARD_H / 2,
  };
}

// ─── Leak notification types ──────────────────────────────────────────────────

type LeakEdge = "top-left" | "top-right" | "bottom-left" | "bottom-right";
interface LeakNote { id: number; text: string; edge: LeakEdge }

const LEAK_EDGE_STYLES: Record<LeakEdge, React.CSSProperties> = {
  "top-left":     { top: 72, left: 16 },
  "top-right":    { top: 72, right: 16 },
  "bottom-left":  { bottom: 60, left: 16 },
  "bottom-right": { bottom: 60, right: 16 },
};

const LEAK_EDGES: LeakEdge[] = ["top-left", "top-right", "bottom-left", "bottom-right"];

// ─── Component ────────────────────────────────────────────────────────────────

type CrownPhase = "pre" | "materializing" | "crowned";

export default function Home1OrbitalMagazine() {
  const issue = getCurrentIssue();

  const weekNumber = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  const orbitCW = weekNumber % 2 === 0;

  const [crownPhase, setCrownPhase] = useState<CrownPhase>("pre");
  const [teaserIdx, setTeaserIdx] = useState(0);
  const [activeGenre, setActiveGenre] = useState<Genre>(SEED_ARTISTS[0].genre);
  const [leaks, setLeaks] = useState<LeakNote[]>([]);
  const leakIdRef = useRef(0);
  const leakTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const palette = GENRE_PALETTE[activeGenre];

  // Crown materialize sequence
  useEffect(() => {
    const t1 = setTimeout(() => setCrownPhase("materializing"), 1500);
    const t2 = setTimeout(() => setCrownPhase("crowned"), 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Teaser rotation every 4.5s
  useEffect(() => {
    const id = setInterval(() => {
      setTeaserIdx(i => (i + 1) % STATIC_TEASERS.length);
    }, 4500);
    return () => clearInterval(id);
  }, []);

  // Leak notification scheduler
  useEffect(() => {
    function scheduleNextLeak() {
      const delay = 8000 + Math.random() * 7000;
      leakTimeoutRef.current = setTimeout(() => {
        const id = ++leakIdRef.current;
        const text = STATIC_LEAKS[id % STATIC_LEAKS.length];
        const edge = LEAK_EDGES[id % LEAK_EDGES.length];
        setLeaks(prev => [...prev, { id, text, edge }]);
        setTimeout(() => setLeaks(prev => prev.filter(l => l.id !== id)), 3000);
        scheduleNextLeak();
      }, delay);
    }
    scheduleNextLeak();
    return () => { if (leakTimeoutRef.current) clearTimeout(leakTimeoutRef.current); };
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: palette.bg, color: "#fff", display: "flex", flexDirection: "column", transition: "background 1.2s ease", position: "relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&display=swap');

        :root {
          --font-tmi-editorial: 'Playfair Display', 'Georgia', 'Times New Roman', serif;
        }

        @keyframes tmiOrbitCW  { from { transform: rotate(0deg); }    to { transform: rotate(360deg);  } }
        @keyframes tmiOrbitCCW { from { transform: rotate(0deg); }    to { transform: rotate(-360deg); } }
        @keyframes tmiCounterCW  { from { transform: rotate(0deg); }  to { transform: rotate(-360deg); } }
        @keyframes tmiCounterCCW { from { transform: rotate(0deg); }  to { transform: rotate(360deg);  } }

        @keyframes tmiCrownMaterialize {
          0%   { opacity: 0; transform: translateY(-12px) scale(0.6); filter: blur(8px); }
          60%  { opacity: 1; transform: translateY(2px)  scale(1.15); filter: blur(0);   }
          100% { opacity: 1; transform: translateY(0)    scale(1);    filter: blur(0);   }
        }
        @keyframes tmiCrownFloat {
          0%, 100% { transform: translateY(0);    }
          50%       { transform: translateY(-5px); }
        }
        @keyframes tmiRingGlow {
          0%, 100% { opacity: 0.25; }
          50%       { opacity: 0.55; }
        }
        @keyframes tmiMastIn {
          0%   { opacity: 0; letter-spacing: 0.35em; transform: translateY(-10px); }
          100% { opacity: 1; letter-spacing: 0.22em; transform: translateY(0);     }
        }
        @keyframes tmiTeaserSlide {
          0%   { opacity: 0; transform: translateY(8px);  }
          12%  { opacity: 1; transform: translateY(0);    }
          85%  { opacity: 1; transform: translateY(0);    }
          100% { opacity: 0; transform: translateY(-8px); }
        }
        @keyframes tmiLeakIn {
          0%   { opacity: 0; transform: scale(0.88) translateY(6px); }
          100% { opacity: 1; transform: scale(1)    translateY(0);   }
        }
        @keyframes tmiLeakOut {
          0%   { opacity: 1; }
          100% { opacity: 0; transform: scale(0.9); }
        }
        @keyframes tmiPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255,215,0,0); }
          50%       { box-shadow: 0 0 20px 6px rgba(255,215,0,0.35); }
        }

        .tmi-ring {
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        .tmi-card-inner {
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
      `}</style>

      {/* Nav */}
      <HomeNavigator />

      {/* Main stage */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "32px 16px 24px", position: "relative" }}>

        {/* Masthead */}
        <div style={{ textAlign: "center", marginBottom: 24, animation: "tmiMastIn 1.1s cubic-bezier(.16,1,.3,1) both" }}>
          <div style={{
            fontFamily: "var(--font-tmi-editorial, 'Playfair Display', Georgia, serif)",
            fontSize: "clamp(18px, 4vw, 38px)",
            fontWeight: 900,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#fff",
            textShadow: `0 0 40px ${palette.primary}88, 0 2px 0 rgba(0,0,0,0.6)`,
            lineHeight: 1,
          }}>
            The Musician&apos;s Index Magazine
          </div>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", alignItems: "center", marginTop: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.25em", color: palette.primary }}>
              ISSUE #{issue.issueNumber} — {issue.editorialFocus}
            </span>
            <span style={{ width: 1, height: 10, background: "rgba(255,255,255,0.2)" }} />
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", color: "rgba(255,255,255,0.4)" }}>
              {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }).toUpperCase()}
            </span>
            <span style={{ width: 1, height: 10, background: "rgba(255,255,255,0.2)" }} />
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", color: "rgba(255,255,255,0.35)" }}>
              GENRE: {activeGenre.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Orbital crown ring */}
        <div style={{ position: "relative", width: RING_SIZE, height: RING_SIZE, maxWidth: "100%", flexShrink: 0 }}>

          {/* Glow rings */}
          <div aria-hidden style={{
            position: "absolute", inset: 0,
            borderRadius: "50%",
            border: `1px solid ${palette.primary}44`,
            animation: "tmiRingGlow 3s ease-in-out infinite",
          }} />
          <div aria-hidden style={{
            position: "absolute", inset: 20,
            borderRadius: "50%",
            border: `1px solid ${palette.secondary}22`,
            animation: "tmiRingGlow 3s ease-in-out infinite",
            animationDelay: "1.5s",
          }} />

          {/* Center label */}
          <div style={{
            position: "absolute",
            left: "50%", top: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            pointerEvents: "none",
          }}>
            <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.3em", color: palette.primary, opacity: 0.7 }}>INDEX</div>
            <div style={{ fontSize: 7, fontWeight: 700, letterSpacing: "0.2em", color: "rgba(255,255,255,0.25)", marginTop: 2 }}>TOP 9</div>
          </div>

          {/* Rotating ring */}
          <div
            className="tmi-ring"
            style={{
              position: "absolute", inset: 0,
              animationName: orbitCW ? "tmiOrbitCW" : "tmiOrbitCCW",
              animationDuration: `${ORBIT_DURATION}s`,
            }}
          >
            {SEED_ARTISTS.map((artist, i) => {
              const pos = orbitPos(i);
              const isFirst = i === 0;
              const artistPalette = GENRE_PALETTE[artist.genre];
              const deltaColor = artist.delta > 0 ? "#00FF88" : artist.delta < 0 ? "#FF4444" : "rgba(255,255,255,0.3)";
              return (
                <div
                  key={artist.name}
                  className="tmi-card-inner"
                  style={{
                    position: "absolute",
                    left: pos.left,
                    top: pos.top,
                    width: CARD_W,
                    height: CARD_H,
                    animationName: orbitCW ? "tmiCounterCW" : "tmiCounterCCW",
                    animationDuration: `${ORBIT_DURATION}s`,
                    cursor: "pointer",
                  }}
                  onClick={() => setActiveGenre(artist.genre)}
                >
                  <div style={{
                    width: "100%", height: "100%",
                    borderRadius: 10,
                    background: isFirst
                      ? `linear-gradient(135deg, ${palette.primary}33, ${palette.secondary}22)`
                      : "rgba(255,255,255,0.04)",
                    border: `1px solid ${isFirst ? palette.primary + "88" : artistPalette.primary + "44"}`,
                    boxShadow: isFirst
                      ? `0 0 20px ${palette.primary}44, inset 0 0 12px ${palette.primary}11`
                      : "none",
                    animation: isFirst ? "tmiPulse 2.5s ease-in-out infinite" : "none",
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    padding: "6px 4px",
                    textAlign: "center",
                    transition: "border-color 0.3s, box-shadow 0.3s",
                    position: "relative",
                  }}>
                    {/* Rank badge */}
                    <div style={{
                      position: "absolute", top: 4, left: 5,
                      fontSize: 7, fontWeight: 900, letterSpacing: "0.1em",
                      color: isFirst ? "#FFD700" : "rgba(255,255,255,0.25)",
                    }}>
                      #{artist.rank}
                    </div>

                    {/* Crown — only for #1, appears after materialization */}
                    {isFirst && crownPhase !== "pre" && (
                      <div style={{
                        position: "absolute", top: -14,
                        fontSize: 16,
                        animation: crownPhase === "materializing"
                          ? "tmiCrownMaterialize 1.4s cubic-bezier(.16,1,.3,1) both"
                          : "tmiCrownFloat 2.8s ease-in-out infinite",
                        filter: `drop-shadow(0 0 8px ${palette.primary})`,
                      }}>
                        👑
                      </div>
                    )}

                    {/* Avatar placeholder */}
                    <div style={{
                      width: 36, height: 36,
                      borderRadius: "50%",
                      background: `radial-gradient(circle at 35% 35%, ${artistPalette.primary}44, ${artistPalette.secondary}22)`,
                      border: `1.5px solid ${artistPalette.primary}66`,
                      marginBottom: 5,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 14,
                    }}>
                      {artist.name.charAt(0)}
                    </div>

                    {/* Name */}
                    <div style={{
                      fontSize: 8, fontWeight: 900,
                      letterSpacing: "0.06em",
                      color: isFirst ? "#fff" : "rgba(255,255,255,0.8)",
                      lineHeight: 1.2,
                      maxWidth: "100%",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}>
                      {artist.name}
                    </div>

                    {/* Score + delta */}
                    <div style={{ display: "flex", gap: 3, alignItems: "center", marginTop: 3 }}>
                      <span style={{ fontSize: 7, color: "rgba(255,255,255,0.35)", fontWeight: 700 }}>
                        {artist.score.toLocaleString()}
                      </span>
                      <span style={{ fontSize: 7, color: deltaColor, fontWeight: 900 }}>
                        {artist.delta > 0 ? `+${artist.delta}` : artist.delta}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Genre indicator pills */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginTop: 20 }}>
          {(Object.keys(GENRE_PALETTE) as Genre[]).map(g => (
            <button
              key={g}
              onClick={() => setActiveGenre(g)}
              style={{
                padding: "4px 12px", fontSize: 8, fontWeight: 900,
                letterSpacing: "0.15em", textTransform: "uppercase",
                border: `1px solid ${activeGenre === g ? GENRE_PALETTE[g].primary + "88" : "rgba(255,255,255,0.1)"}`,
                background: activeGenre === g ? `${GENRE_PALETTE[g].primary}20` : "rgba(255,255,255,0.03)",
                color: activeGenre === g ? GENRE_PALETTE[g].primary : "rgba(255,255,255,0.35)",
                borderRadius: 20, cursor: "pointer",
              }}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Tabloid teaser strip */}
        <div style={{
          marginTop: 28,
          width: "100%", maxWidth: 680,
          background: "rgba(0,0,0,0.45)",
          border: `1px solid ${palette.primary}33`,
          borderRadius: 8,
          padding: "10px 20px",
          textAlign: "center",
          overflow: "hidden",
          minHeight: 38,
          position: "relative",
        }}>
          <div style={{
            position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
            fontSize: 8, fontWeight: 900, letterSpacing: "0.2em",
            color: palette.primary,
          }}>
            BREAKING
          </div>
          <div
            key={teaserIdx}
            style={{
              fontSize: "clamp(9px, 2vw, 12px)",
              fontWeight: 900,
              letterSpacing: "0.08em",
              color: "#fff",
              textTransform: "uppercase",
              fontFamily: "var(--font-tmi-editorial, 'Playfair Display', Georgia, serif)",
              animation: "tmiTeaserSlide 4.5s ease both",
              paddingLeft: 60, paddingRight: 8,
            }}
          >
            {STATIC_TEASERS[teaserIdx]}
          </div>
        </div>

        {/* Issue theme bar */}
        <div style={{
          marginTop: 16,
          display: "flex", gap: 12, alignItems: "center",
          flexWrap: "wrap", justifyContent: "center",
        }}>
          {[1, 2, 3, 4, 5, 6].map(n => {
            const iss = getIssueByGenre(["Hip Hop", "R&B", "Pop", "Electronic", "Rock", "Jazz"][n - 1] as Genre);
            const isActive = iss.issueNumber === issue.issueNumber;
            return (
              <div key={n} style={{
                padding: "4px 12px", fontSize: 8, fontWeight: 900,
                letterSpacing: "0.12em",
                border: `1px solid ${isActive ? iss.accentColor + "88" : "rgba(255,255,255,0.08)"}`,
                borderRadius: 4,
                background: isActive ? `${iss.accentColor}15` : "transparent",
                color: isActive ? iss.accentColor : "rgba(255,255,255,0.2)",
              }}>
                ISSUE {n}
              </div>
            );
          })}
        </div>

      </main>

      {/* Footer */}
      <FooterHUD />

      {/* Leak edge notifications */}
      {leaks.map(leak => (
        <div
          key={leak.id}
          style={{
            position: "fixed",
            ...LEAK_EDGE_STYLES[leak.edge],
            zIndex: 300,
            background: "rgba(0,0,0,0.88)",
            border: `1px solid ${palette.primary}66`,
            borderRadius: 8,
            padding: "8px 14px",
            maxWidth: 220,
            animation: "tmiLeakIn 0.3s cubic-bezier(.16,1,.3,1) both",
            backdropFilter: "blur(12px)",
          }}
        >
          <div style={{ fontSize: 7, fontWeight: 900, letterSpacing: "0.2em", color: palette.primary, marginBottom: 3 }}>
            EXCLUSIVE
          </div>
          <div style={{ fontSize: 10, fontWeight: 800, color: "#fff", letterSpacing: "0.04em", lineHeight: 1.3 }}>
            {leak.text}
          </div>
        </div>
      ))}

      {/* Scanline overlay */}
      <div aria-hidden style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 200,
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.04) 3px, rgba(0,0,0,0.04) 4px)",
        backgroundSize: "100% 4px",
      }} />
    </div>
  );
}
