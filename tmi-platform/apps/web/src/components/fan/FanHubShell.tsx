"use client";

import { useState, useCallback, useEffect } from "react";
import { ErrorBoundary } from "@/components/admin/ErrorBoundary";
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

const C = {
  bg: "#050815",
  panel: "rgba(8,14,38,.95)",
  card: "rgba(12,20,50,.9)",
  red: "#E63000",
  orange: "#FF6B00",
  amber: "#FF8C00",
  gold: "#FFD700",
  border: "rgba(220,70,0,.5)",
  dim: "rgba(255,140,0,.4)",
  green: "#00FF7F",
  cyan: "#00E5FF",
  purple: "#9B59B6",
};

const SPOTLIGHT = { name: "Chario Ace", genre: "HIP-HOP", nextShow: "8:00 PM" };

const REACTIONS = [
  { id: "thank",    label: "Thank You", icon: "👍", pts: 5  },
  { id: "hearts",   label: "Hearts",    icon: "❤️", pts: 8  },
  { id: "flicker",  label: "Flicker",   icon: "✋", pts: 3  },
  { id: "confetti", label: "Confetti",  icon: "🎉", pts: 6  },
  { id: "spark",    label: "Spark",     icon: "⚡", pts: 10 },
  { id: "vibe",     label: "Vibe",      icon: "🎵", pts: 4  },
];

const TRACKS = [
  { num: 1, title: "Big Moves",        artist: "Chario Ace",       label: "Berntout Perductions", dur: "3:47", active: true  },
  { num: 2, title: "Wave Rider",       artist: "BJM The Rapper",   label: "BJM Beats",            dur: "4:12", active: false },
  { num: 3, title: "Thunder Zone",     artist: "Big KazhDog",      label: "Big Kash Records",     dur: "3:21", active: false },
  { num: 4, title: "Night Frequency",  artist: "Chario Ace",       label: "Berntout Perductions", dur: "5:02", active: false },
  { num: 5, title: "Sound Pressure",   artist: "BJM The Rapper",   label: "BJM Beats",            dur: "2:58", active: false },
];

// Static room shells — name/genre/icon/slug are display metadata only.
// isLive/viewers are NEVER hardcoded here; they're derived at render time
// from real GlobalLiveSessionRegistry sessions via /api/live/go (see
// useLiveRoomData below). A room with no matching live session stays
// honestly offline rather than claiming a fabricated viewer count.
const ROOM_SHELLS = [
  { id: "main-stage",     name: "Main Stage Room",  genre: "Hip-Hop · Live Sets",    icon: "🎤", featured: true,  slug: "main-stage",     categories: ["live", "concert"] },
  { id: "battle-a",       name: "Battle Arena A",   genre: "Rap Battle · Open",      icon: "⚔️", featured: false, slug: "battle-arena-a", categories: ["battle"]          },
  { id: "cypher-lounge",  name: "Cypher Lounge",    genre: "Open Mic · All genres",  icon: "🎤", featured: false, slug: "cypher-lounge",  categories: ["cypher"]          },
  { id: "chill-zone",     name: "Chill Zone",       genre: "R&B · Neo Soul",         icon: "🎶", featured: false, slug: "chill-zone",     categories: [] as string[]       },
];

interface LiveApiSession { category: string; viewerCount: number; }

function useLiveRoomData() {
  const [sessions, setSessions] = useState<LiveApiSession[]>([]);
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch('/api/live/go', { cache: 'no-store' });
        const data = await res.json() as { sessions?: LiveApiSession[] };
        if (!cancelled) setSessions(data.sessions ?? []);
      } catch {
        if (!cancelled) setSessions([]);
      }
    };
    void load();
    const id = setInterval(() => void load(), 10000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  return ROOM_SHELLS.map((shell) => {
    const matches = sessions.filter((s) => shell.categories.includes(s.category));
    const isLive = matches.length > 0;
    return {
      ...shell,
      isLive,
      viewers: matches.reduce((sum, s) => sum + s.viewerCount, 0),
    };
  });
}

const BOBBLE_COLORS = [
  { head: "#5C2A00", body: "#3d1a00", border: C.amber },
  { head: "#8B2200", body: "#5a1500", border: C.red   },
  { head: "#2F1B0E", body: "#1e1006", border: C.gold  },
  { head: "#6B2C00", body: "#451c00", border: C.orange},
  { head: "#4a1e00", body: "#2d1200", border: C.amber },
  { head: "#3a1c00", body: "#240f00", border: C.red   },
];

const css = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Exo+2:wght@300;400;600;700&display=swap');
@keyframes fanBobble{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
@keyframes fanEq{0%,100%{height:4px}50%{height:var(--eqh)}}
@keyframes fanFloatUp{0%{transform:translateY(0) scale(1);opacity:1}100%{transform:translateY(-80px) scale(.2);opacity:0}}
@keyframes fanPulse{0%,100%{box-shadow:0 0 4px #E63000}50%{box-shadow:0 0 18px #E63000,0 0 36px rgba(230,48,0,.3)}}
@keyframes fanGlow{0%,100%{box-shadow:0 0 8px #00E5FF,0 0 16px rgba(0,229,255,.3)}50%{box-shadow:0 0 16px #00E5FF,0 0 32px rgba(0,229,255,.5)}}
@keyframes fanSpin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
@keyframes fanAdFade{0%,100%{opacity:.8}50%{opacity:1}}
@keyframes fanBlink{0%,100%{opacity:1}50%{opacity:0}}
@keyframes fanTicker{from{transform:translateX(110%)}to{transform:translateX(-110%)}}
.fan-bobble{animation:fanBobble 1.8s ease-in-out infinite}
.fan-eq-bar{display:inline-block;width:3px;border-radius:1px;background:#E63000;vertical-align:bottom;margin:0 1px}
.fan-float-em{animation:fanFloatUp 1.5s ease-out forwards;position:absolute;font-size:22px;pointer-events:none;z-index:20}
.fan-spin-cd{animation:fanSpin 4s linear infinite}
.fan-ad-pulse{animation:fanAdFade 3s ease-in-out infinite}
.fan-glow-cyan{animation:fanGlow 2.5s ease-in-out infinite}
.fan-pulse-border{animation:fanPulse 2s ease-in-out infinite}
.fan-blink{animation:fanBlink 1.2s ease-in-out infinite}
.fan-ticker-text{animation:fanTicker 20s linear infinite}
.fan-room-card{background:rgba(12,20,50,.9);border:1px solid rgba(220,70,0,.5);border-radius:6px;overflow:hidden;cursor:pointer;transition:all .15s}
.fan-room-card:hover{border-color:#E63000;box-shadow:0 0 10px rgba(230,48,0,.2)}
.fan-room-card.featured{border-color:#FFD700;box-shadow:0 0 8px rgba(255,215,0,.15)}
.fan-track{padding:5px 8px;border-radius:4px;cursor:pointer;display:flex;align-items:center;gap:7px;transition:background .12s}
.fan-track:hover{background:rgba(230,48,0,.15)}
.fan-track.active{background:rgba(230,48,0,.25);border-left:2px solid #E63000}
`;

export default function FanHubShell({
  fanSlug,
  displayName,
  tier,
  startingPoints,
}: FanHubShellProps) {
  if (!fanSlug) {
    return (
      <div style={{padding:24,background:'#050815',color:'#ffd',borderRadius:8}}>
        <h3>Profile missing</h3>
        <p>Fan profile not found. Create or open a fan profile to continue.</p>
      </div>
    );
  }
  const router = useRouter();
  const [points, setPoints] = useState(startingPoints);
  const [firedId, setFiredId] = useState<string | null>(null);
  const [floats, setFloats] = useState<{ id: number; em: string; x: number }[]>([]);
  const [floatId, setFloatId] = useState(0);
  const [tipSent, setTipSent] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTrack, setActiveTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [roomFilter, setRoomFilter] = useState("ALL");
  const rooms = useLiveRoomData();
  const spinLocked = tier === "free";

  const goToShow = useCallback(() => {
    const roomId = getSmartRoom();
    router.push(`/live/rooms/${roomId}?from=fan-hub&fan=${fanSlug}`);
  }, [router, fanSlug]);

  const fireReaction = useCallback((id: string, em: string, pts: number) => {
    setFiredId(id);
    setPoints((p) => p + pts);
    const nid = floatId + 1;
    setFloatId(nid);
    setFloats((f) => [...f, { id: nid, em, x: 15 + Math.random() * 70 }]);
    setTimeout(() => setFiredId(null), 550);
    setTimeout(() => setFloats((f) => f.filter((x) => x.id !== nid)), 1600);
  }, [floatId]);

  const sendTip = useCallback(() => {
    setTipSent(true);
    setTimeout(() => setTipSent(false), 1800);
  }, []);

  useEffect(() => {
    document.body.style.overscrollBehavior = "contain";
    return () => { document.body.style.overscrollBehavior = ""; };
  }, []);

  const panel = (children: React.ReactNode, extra?: React.CSSProperties) => (
    <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 6, ...extra }}>
      {children}
    </div>
  );

  const lbl = (text: string, color?: string) => (
    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", color: color ?? C.amber, textTransform: "uppercase", marginBottom: 4 }}>{text}</div>
  );

  const tmiBtn = (label: string, href?: string, onClick?: () => void, variant?: "gold" | "cyan" | "green", small?: boolean) => {
    const style: React.CSSProperties = {
      background: "transparent",
      border: `1px solid ${variant === "gold" ? C.gold : variant === "cyan" ? C.cyan : variant === "green" ? C.green : C.red}`,
      color: variant === "gold" ? C.gold : variant === "cyan" ? C.cyan : variant === "green" ? C.green : C.amber,
      fontFamily: "'Exo 2', sans-serif",
      fontSize: small ? 8 : 10,
      fontWeight: 700,
      cursor: "pointer",
      borderRadius: 4,
      padding: small ? "3px 7px" : "5px 9px",
      letterSpacing: "0.05em",
      textTransform: "uppercase" as const,
      textDecoration: "none",
    };
    if (href) return <Link href={href} style={style}>{label}</Link>;
    return <button type="button" onClick={onClick} style={style}>{label}</button>;
  };

  return (
    <ErrorBoundary>
    <main style={{ minHeight: "100vh", background: C.bg, color: C.amber, fontFamily: "'Exo 2', sans-serif", overflowX: "hidden" }}>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", marginBottom: 7, borderBottom: `1px solid ${C.border}`, background: "#030610" }}>
        <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 18, fontWeight: 900, color: C.red, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          FAN DASHBOARD ☠
        </div>
        <div style={{ display: "flex", gap: 5 }}>
          {tmiBtn("☠ TRIVIA", "/fan/trivia")}
          {tier !== "free" && tmiBtn("⭐ UPGRADED", undefined, undefined, "gold")}
        </div>
      </div>

      <div style={{ padding: "0 8px" }}>

        {/* TOP ROW: Main content + Right col */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 170px", gap: 7, marginBottom: 7 }}>
          <div>
            {/* Artist Spotlight */}
            {panel(
              <div style={{ padding: "8px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  {lbl("Artist Spotlight")}
                  <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 14, fontWeight: 700, color: C.gold }}>{SPOTLIGHT.name}</div>
                  <div style={{ fontSize: 10, color: C.red, fontWeight: 600 }}>{SPOTLIGHT.genre}</div>
                </div>
                <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                  <button type="button" onClick={() => !spinLocked && setPoints((p) => p + 50)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "6px 10px", background: "transparent", border: `1px solid ${C.red}`, borderRadius: 4, color: C.amber, cursor: spinLocked ? "not-allowed" : "pointer", opacity: spinLocked ? 0.5 : 1 }}>
                    <span style={{ fontSize: 17 }}>📡</span><span style={{ fontSize: 7 }}>SPIN</span>
                  </button>
                  <button type="button" onClick={goToShow} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "6px 10px", background: "transparent", border: `1px solid ${C.red}`, borderRadius: 4, color: C.amber, cursor: "pointer" }}>
                    <span style={{ fontSize: 17, color: C.green }}>✓</span><span style={{ fontSize: 7 }}>VOTE</span>
                  </button>
                  <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 6, padding: "6px 12px", textAlign: "center" }}>
                    <div style={{ fontSize: 7, fontWeight: 700, letterSpacing: "0.12em", color: C.amber, textTransform: "uppercase" }}>Next Show</div>
                    <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 15, fontWeight: 700, color: C.gold }}>{SPOTLIGHT.nextShow}</div>
                  </div>
                </div>
              </div>,
              { marginBottom: 6 }
            )}

            {/* Marquee screen */}
            <div className="fan-pulse-border" style={{ position: "relative", border: `2px solid ${C.red}`, borderRadius: 8, overflow: "hidden", background: "#06000a", height: 180, marginBottom: 6 }}>
              {/* Stage background */}
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 0%, rgba(230,48,0,0.08) 0%, transparent 70%), linear-gradient(180deg,#1a0400 0%,#080205 60%,#030103 100%)" }} />
              {/* Bobblehead crowd in screen */}
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 8, padding: "0 30px 0", zIndex: 2 }}>
                {BOBBLE_COLORS.map((c, i) => (
                  <div key={i} className="fan-bobble" style={{ animationDelay: `${i * 0.3}s`, display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ width: 22, height: 22, borderRadius: "50%", background: c.head, border: `2px solid ${c.border}` }} />
                    <div style={{ width: 16, height: 24, borderRadius: "3px 3px 0 0", background: c.body, margin: "0 auto" }} />
                  </div>
                ))}
              </div>
              {/* Floating reactions */}
              {floats.map((f) => (
                <span key={f.id} className="fan-float-em" style={{ left: `${f.x}%`, bottom: "40%" }}>{f.em}</span>
              ))}
              {/* LIVE badge */}
              <div style={{ position: "absolute", top: 8, left: 10, display: "flex", alignItems: "center", gap: 4, zIndex: 5 }}>
                <span className="fan-blink" style={{ width: 6, height: 6, borderRadius: "50%", background: C.green, boxShadow: `0 0 5px ${C.green}`, display: "inline-block" }} />
                <span style={{ fontSize: 8, color: C.green, fontWeight: 700, letterSpacing: "0.1em" }}>LIVE</span>
              </div>
              {/* Viewer count */}
              <div style={{ position: "absolute", top: 8, right: 10, fontSize: 8, color: C.amber, fontWeight: 700 }}>👁 2,730</div>
            </div>

            {/* Action dock */}
            {panel(
              <div style={{ padding: 6, marginBottom: 6 }}>
                <div style={{ display: "flex", gap: 4 }}>
                  {REACTIONS.map((r) => (
                    <button key={r.id} type="button" onClick={() => fireReaction(r.id, r.icon, r.pts)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "5px 6px", background: firedId === r.id ? "rgba(230,48,0,.2)" : "transparent", border: `1px solid ${firedId === r.id ? C.red : C.border}`, borderRadius: 4, color: C.amber, fontSize: 7, fontWeight: 700, cursor: "pointer", transition: "all .15s", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                      <span style={{ fontSize: 15, lineHeight: 1 }}>{r.icon}</span>
                      {r.label}
                    </button>
                  ))}
                  {/* AD slot inline */}
                  <div className="fan-ad-pulse" style={{ flex: 1, minWidth: 50, background: "rgba(4,8,26,.95)", border: "1px solid rgba(255,140,0,.3)", borderRadius: 5, padding: "6px 8px", textAlign: "center", position: "relative", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>
                    <div style={{ position: "absolute", top: 3, right: 4, background: "rgba(255,140,0,.2)", border: `1px solid ${C.dim}`, borderRadius: 3, fontSize: 6, fontWeight: 700, color: C.dim, padding: "1px 4px" }}>AD</div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: C.amber }}>SPONSOR</div>
                    <div style={{ fontSize: 7, color: C.dim }}>Your Ad Here</div>
                  </div>
                </div>
              </div>
            )}

            {/* Chat */}
            <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Say something to the crowd..." style={{ width: "100%", padding: "7px 11px", background: "rgba(12,20,50,.9)", border: `1px solid ${C.border}`, borderRadius: 4, color: C.amber, fontFamily: "'Exo 2', sans-serif", fontSize: 11, outline: "none", boxSizing: "border-box", marginBottom: 6 }} />

            {/* Fan Analytics */}
            {panel(
              <div style={{ padding: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  {lbl("Fan Analytics")}
                  <span style={{ fontSize: 9, color: C.cyan }}>24 min session</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div>
                    {[["Watch time", "24h"], ["Tips sent", "8"], ["Artists followed", "3"]].map(([k, v]) => (
                      <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                        <span style={{ fontSize: 9, color: C.dim }}>{k}</span>
                        <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 11, fontWeight: 700, color: C.gold }}>{v}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 48 }}>
                    {[35, 58, 25, 80, 100, 70, 88].map((h, i) => (
                      <div key={i} style={{ flex: 1, height: `${h}%`, background: h >= 80 ? C.gold : h >= 60 ? C.orange : C.red, borderRadius: "2px 2px 0 0" }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {/* Cosmetic Shop */}
            {panel(
              <div style={{ padding: 7 }}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", color: C.amber, textTransform: "uppercase", textAlign: "center", marginBottom: 4 }}>Cosmetic Shop</div>
                <div style={{ display: "flex", gap: 4, marginBottom: 5 }}>
                  {[["🔴", "FREE"], ["💧", "RAF"], ["⭕", "EPIC"]].map(([icon, label]) => (
                    <button key={label} type="button" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "4px 2px", background: "transparent", border: `1px solid ${C.red}`, borderRadius: 4, color: C.amber, fontSize: 13, cursor: "pointer" }}>
                      {icon}<span style={{ fontSize: 7 }}>{label}</span>
                    </button>
                  ))}
                </div>
                <div className="fan-ad-pulse" style={{ marginBottom: 5, padding: "5px 6px", background: "rgba(4,8,26,.95)", border: "1px solid rgba(255,140,0,.3)", borderRadius: 5, position: "relative", textAlign: "center" }}>
                  <div style={{ position: "absolute", top: 3, right: 4, background: "rgba(255,140,0,.2)", border: `1px solid ${C.dim}`, borderRadius: 3, fontSize: 6, fontWeight: 700, color: C.dim, padding: "1px 4px" }}>AD</div>
                  <div style={{ fontSize: 8, fontWeight: 700, color: C.orange }}>🎯 Upgrade to Gold</div>
                  <div style={{ fontSize: 7, color: C.dim, marginTop: 1 }}>Remove ads + bonus PunPoints</div>
                </div>
              </div>
            )}

            {/* Billboard Fans */}
            {panel(
              <div style={{ padding: 7, textAlign: "center" }}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", color: C.amber, textTransform: "uppercase", marginBottom: 4 }}>Billboard Fans</div>
                <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 18, fontWeight: 700, color: C.gold }}>38.5K</div>
                <div style={{ fontSize: 9, color: C.orange, marginTop: 2 }}>SByeeGil</div>
                <div style={{ display: "flex", justifyContent: "center", gap: 8, fontSize: 9, marginTop: 4 }}>
                  <span>❤️ <strong style={{ color: C.gold }}>8</strong></span>
                  <span>🟡 <strong style={{ color: C.gold }}>6</strong></span>
                </div>
              </div>
            )}

            {/* PunPoints */}
            {panel(
              <div style={{ padding: 7, textAlign: "center" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginBottom: 3 }}>
                  <span>🟠</span>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", color: C.amber, textTransform: "uppercase" }}>PunPoints</div>
                </div>
                <div style={{ fontSize: 13, marginBottom: 5 }}>⭐⭐⭐⭐⭐</div>
                <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 16, fontWeight: 700, color: C.gold, marginBottom: 5 }}>{points.toLocaleString()}</div>
                <button type="button" style={{ width: "100%", padding: 4, background: "transparent", border: `1px solid ${C.red}`, borderRadius: 4, color: C.amber, fontFamily: "'Exo 2', sans-serif", fontSize: 8, fontWeight: 700, cursor: "pointer", letterSpacing: "0.05em" }}>UPGRADE</button>
              </div>
            )}

            {/* Memory Wall */}
            {panel(
              <div style={{ padding: 7, textAlign: "center", cursor: "pointer" }} onClick={() => router.push("/fan/memory-wall")}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", color: C.amber, textTransform: "uppercase", marginBottom: 3 }}>Memory Wall</div>
                <div style={{ fontSize: 16, marginBottom: 2 }}>🎞</div>
                <div style={{ fontSize: 7, color: C.dim }}>Videos · Audio · Images</div>
              </div>
            )}

            {/* Sidebar AD */}
            <div className="fan-ad-pulse" style={{ padding: "9px 7px", background: "rgba(4,8,26,.95)", border: "1px solid rgba(255,140,0,.3)", borderRadius: 5, position: "relative", cursor: "pointer" }}>
              <div style={{ position: "absolute", top: 3, right: 4, background: "rgba(255,140,0,.2)", border: `1px solid ${C.dim}`, borderRadius: 3, fontSize: 6, fontWeight: 700, color: C.dim, padding: "1px 4px" }}>AD</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.amber, marginBottom: 3 }}>🎵 BerntoutStudio AI</div>
              <div style={{ fontSize: 7, color: C.dim, marginBottom: 5 }}>Make beats with AI. Free trial.</div>
              <button type="button" style={{ width: "100%", padding: 3, background: "transparent", border: `1px solid ${C.red}`, borderRadius: 4, color: C.amber, fontFamily: "'Exo 2', sans-serif", fontSize: 8, fontWeight: 700, cursor: "pointer" }}>TRY FREE</button>
            </div>
          </div>
        </div>

        {/* PLAYLIST ENGINE */}
        <div className="fan-glow-cyan" style={{ background: C.panel, border: `1px solid ${C.cyan}`, borderRadius: 6, padding: 10, marginBottom: 7 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 11, color: C.cyan, fontWeight: 700 }}>🎵 PLAYLIST ENGINE</div>
              <div style={{ fontSize: 8, color: C.dim, background: "rgba(0,229,255,.1)", border: "1px solid rgba(0,229,255,.3)", padding: "2px 6px", borderRadius: 3 }}>SUBMARINE SKIN v1</div>
            </div>
            <div style={{ display: "flex", gap: 5 }}>
              {tmiBtn("🔀 SHUFFLE", undefined, undefined, "cyan", true)}
              {tmiBtn("🔁 LOOP", undefined, undefined, "cyan", true)}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 10, alignItems: "center", marginBottom: 8 }}>
            {/* Spinning CD */}
            <div className="fan-spin-cd" style={{ width: 56, height: 56, borderRadius: "50%", background: "radial-gradient(circle at 30% 30%,#1a0a00,#050815)", border: `2px solid ${C.cyan}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: C.bg, border: `1px solid ${C.dim}` }} />
            </div>

            {/* Now playing */}
            <div>
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 12, fontWeight: 700, color: C.gold }}>{TRACKS[activeTrack].title} – {TRACKS[activeTrack].artist}</div>
              <div style={{ fontSize: 9, color: C.dim, marginBottom: 5 }}>{TRACKS[activeTrack].label} · HIP-HOP</div>
              {/* EQ bars */}
              <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 16 }}>
                {[{h:"16px",d:"0.4s"},{h:"12px",d:"0.6s"},{h:"16px",d:"0.5s"},{h:"14px",d:"0.7s"},{h:"10px",d:"0.4s"},{h:"16px",d:"0.8s"},{h:"13px",d:"0.5s"},{h:"16px",d:"0.6s"}].map((b, i) => (
                  <span key={i} className="fan-eq-bar" style={{ animation: `fanEq ${b.d} ease-in-out infinite ${i * 0.05}s`, ["--eqh" as string]: b.h, height: b.h } as React.CSSProperties} />
                ))}
              </div>
              {/* Progress bar */}
              <div style={{ marginTop: 5, height: 3, background: "rgba(0,229,255,.2)", borderRadius: 2, cursor: "pointer" }}>
                <div style={{ height: 3, background: C.cyan, borderRadius: 2, width: "38%", transition: "width .5s" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
                <span style={{ fontSize: 7, color: C.dim }}>1:24</span>
                <span style={{ fontSize: 7, color: C.dim }}>{TRACKS[activeTrack].dur}</span>
              </div>
            </div>

            {/* Controls */}
            <div style={{ display: "flex", flexDirection: "column", gap: 5, alignItems: "center" }}>
              <div style={{ display: "flex", gap: 5 }}>
                <button type="button" onClick={() => setActiveTrack((t) => Math.max(0, t - 1))} style={{ padding: "4px 7px", fontSize: 11, background: "transparent", border: `1px solid ${C.cyan}`, borderRadius: 4, color: C.cyan, cursor: "pointer" }}>⏮</button>
                <button type="button" onClick={() => setIsPlaying((p) => !p)} style={{ padding: "4px 8px", fontSize: 13, background: "transparent", border: `1px solid ${C.cyan}`, borderRadius: 4, color: C.cyan, cursor: "pointer" }}>
                  {isPlaying ? "⏸" : "▶"}
                </button>
                <button type="button" onClick={() => setActiveTrack((t) => Math.min(TRACKS.length - 1, t + 1))} style={{ padding: "4px 7px", fontSize: 11, background: "transparent", border: `1px solid ${C.cyan}`, borderRadius: 4, color: C.cyan, cursor: "pointer" }}>⏭</button>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ fontSize: 9 }}>🔊</span>
                <input type="range" min="0" max="100" defaultValue="75" style={{ width: 60, accentColor: C.cyan }} />
              </div>
            </div>
          </div>

          {/* Track list */}
          <div style={{ maxHeight: 120, overflowY: "auto" }}>
            {TRACKS.map((t, i) => (
              <div key={t.num} className={`fan-track${i === activeTrack ? " active" : ""}`} onClick={() => setActiveTrack(i)}>
                <div style={{ fontSize: 8, color: C.dim, width: 14 }}>{t.num}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 9, color: i === activeTrack ? C.gold : C.amber }}>{t.title}</div>
                  <div style={{ fontSize: 7, color: C.dim }}>{t.artist} · {t.label}</div>
                </div>
                <span style={{ fontSize: 7, color: i === activeTrack ? C.cyan : C.dim }}>{t.dur}</span>
              </div>
            ))}
          </div>

          {/* Playlist AD */}
          <div className="fan-ad-pulse" style={{ marginTop: 7, padding: "5px 8px", background: "rgba(4,8,26,.95)", border: "1px solid rgba(255,140,0,.3)", borderRadius: 5, position: "relative" }}>
            <div style={{ position: "absolute", top: 3, right: 4, background: "rgba(255,140,0,.2)", border: `1px solid ${C.dim}`, borderRadius: 3, fontSize: 6, fontWeight: 700, color: C.dim, padding: "1px 4px" }}>AD</div>
            <div style={{ fontSize: 8, color: C.amber }}>🎧 Rent-A-Charge Kiosks — Find one near you</div>
          </div>
        </div>

        {/* FAN LOBBY WALL */}
        <div style={{ marginBottom: 7 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
            <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 14, fontWeight: 900, color: C.red, textTransform: "uppercase", letterSpacing: "0.08em" }}>🎭 LIVE LOBBY</div>
            <div style={{ display: "flex", gap: 5 }}>
              {["ALL ROOMS", "HIP-HOP", "BATTLES", "CHILL"].map((f) => (
                <button key={f} type="button" onClick={() => setRoomFilter(f)} style={{ padding: "3px 8px", background: roomFilter === f ? "rgba(230,48,0,.18)" : "transparent", border: `1px solid ${C.red}`, borderBottom: roomFilter === f ? `2px solid ${C.red}` : undefined, borderRadius: 4, color: roomFilter === f ? C.gold : C.dim, fontFamily: "'Exo 2', sans-serif", fontSize: 8, fontWeight: 700, cursor: "pointer", letterSpacing: "0.06em" }}>{f}</button>
              ))}
            </div>
          </div>

          {/* Bobblehead theater */}
          <div style={{ background: "rgba(4,2,12,.98)", border: `1px solid ${C.border}`, borderRadius: 6, padding: 10, marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", padding: "0 20px" }}>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
                {BOBBLE_COLORS.map((c, i) => (
                  <div key={i} className="fan-bobble" style={{ animationDelay: `${i * 0.3}s`, display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ width: 22, height: 22, borderRadius: "50%", background: c.head, border: `2px solid ${c.border}` }} />
                    <div style={{ width: 16, height: 24, borderRadius: "3px 3px 0 0", background: c.body, margin: "0 auto" }} />
                  </div>
                ))}
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 9, color: C.dim }}>👁 WATCHING NOW</div>
                <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 22, fontWeight: 700, color: C.gold }}>2,730</div>
                <div style={{ fontSize: 8, color: C.green }}>FANS IN LOBBY</div>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
                {[...BOBBLE_COLORS].reverse().map((c, i) => (
                  <div key={i} className="fan-bobble" style={{ animationDelay: `${(i + 0.5) * 0.3}s`, display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: c.head, border: `2px solid ${c.border}` }} />
                    <div style={{ width: 14, height: 22, borderRadius: "3px 3px 0 0", background: c.body, margin: "0 auto" }} />
                  </div>
                ))}
              </div>
            </div>
            <div style={{ height: 2, background: `linear-gradient(90deg,transparent,${C.red},transparent)`, marginTop: 6 }} />
          </div>

          {/* Room cards grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 7 }}>
            {rooms.map((room) => (
              <div key={room.id} className={`fan-room-card${room.featured ? " featured" : ""}`} onClick={() => router.push(`/live/rooms/${room.slug}`)}>
                <div style={{ height: 64, background: room.featured ? "#0a0002" : "#03080a", position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
                  {room.icon}
                  {room.isLive && (
                    <div style={{ position: "absolute", top: 4, left: 4, display: "flex", alignItems: "center", gap: 3 }}>
                      <span className="fan-blink" style={{ width: 5, height: 5, borderRadius: "50%", background: C.green, boxShadow: `0 0 5px ${C.green}`, display: "inline-block" }} />
                      <span style={{ fontSize: 7, color: C.green }}>LIVE</span>
                    </div>
                  )}
                  {room.featured && (
                    <div style={{ position: "absolute", top: 4, right: 4, background: C.gold, borderRadius: 2, fontSize: 6, padding: "1px 4px", color: "#000", fontWeight: 700 }}>FEATURED</div>
                  )}
                </div>
                <div style={{ padding: 6 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: room.featured ? C.gold : C.amber, marginBottom: 2 }}>{room.name}</div>
                  <div style={{ fontSize: 7, color: C.dim, marginBottom: 4 }}>{room.genre}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 8, color: C.amber }}>👁 {room.viewers.toLocaleString()}</span>
                    <button type="button" style={{ padding: "2px 6px", background: "transparent", border: `1px solid ${room.featured ? C.gold : C.red}`, borderRadius: 4, color: room.featured ? C.gold : C.amber, fontFamily: "'Exo 2', sans-serif", fontSize: 7, fontWeight: 700, cursor: "pointer" }}>ENTER</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bot dock */}
        <div style={{ display: "flex", gap: 16, padding: "8px 0", borderTop: `1px solid ${C.border}`, overflowX: "auto", marginBottom: 0 }}>
          {["StageManagerBot", "BookingBot", "ChatGuardBot", "RevenueBot", "StreamMonitor"].map((bot) => (
            <div key={bot} style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.red, boxShadow: `0 0 5px ${C.red}` }} />
              <span style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", fontWeight: 700, whiteSpace: "nowrap" }}>{bot}</span>
            </div>
          ))}
        </div>

      </div>

      {/* Bottom player bar */}
      <div style={{ position: "sticky", bottom: 0, background: "#07050c", borderTop: "1px solid #22111122", padding: "8px 14px", display: "flex", alignItems: "center", gap: 10 }}>
        <button type="button" onClick={sendTip} style={{ padding: "6px 13px", background: tipSent ? "#009900" : "#006600", border: "none", borderRadius: 6, fontSize: 11, fontWeight: 900, color: "#fff", cursor: "pointer", letterSpacing: "0.06em", transition: "background 0.2s", flexShrink: 0 }}>
          $ TIP
        </button>
        <div style={{ width: 1, height: 20, background: "#33333355", flexShrink: 0 }} />
        {[
          { icon: "▶", label: "play",     action: goToShow               },
          { icon: "👋", label: "wave",     action: () => fireReaction("wave",    "👋", 3)  },
          { icon: "❤️", label: "heart",    action: () => fireReaction("hearts",  "❤️", 8)  },
          { icon: "🔊", label: "audio",    action: () => {}               },
          { icon: "⚙️", label: "settings", action: () => {}               },
        ].map((c) => (
          <button key={c.label} type="button" onClick={c.action} aria-label={c.label} style={{ background: "none", border: "none", fontSize: 16, color: "#aa7766", cursor: "pointer", padding: 4, opacity: 0.7, flexShrink: 0 }}>{c.icon}</button>
        ))}
        <div style={{ marginLeft: "auto", fontSize: 9, color: "rgba(255,255,255,0.2)", fontWeight: 700 }}>{displayName}</div>
      </div>

      {/* Ticker */}
      <div style={{ overflow: "hidden", background: "rgba(230,48,0,.1)", borderTop: `1px solid ${C.border}`, padding: "4px 0" }}>
        <div className="fan-ticker-text" style={{ whiteSpace: "nowrap", fontSize: 9, color: C.amber, fontWeight: 700, letterSpacing: "0.08em" }}>
          🎵 Big Moves – Chario Ace &nbsp;⚡&nbsp; Wave Rider – BJM The Rapper &nbsp;⚡&nbsp; Thunder Zone – Big KazhDog &nbsp;⚡&nbsp; Night Frequency – Chario Ace &nbsp;⚡&nbsp; Sound Pressure – BJM The Rapper &nbsp;⚡&nbsp; LIVE ROOMS OPEN NOW · 2,730 FANS WATCHING &nbsp;⚡&nbsp; VOTE FOR YOUR FAVORITE ARTIST &nbsp;⚡&nbsp;
        </div>
      </div>
    </main>
    </ErrorBoundary>
  );
}
