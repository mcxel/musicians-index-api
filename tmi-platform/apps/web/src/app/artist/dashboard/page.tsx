"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const C = {
  bg: "#050815", panel: "rgba(8,14,38,.95)", card: "rgba(12,20,50,.9)",
  red: "#E63000", orange: "#FF6B00", amber: "#FF8C00", gold: "#FFD700",
  green: "#00FF7F", cyan: "#00E5FF", dim: "rgba(255,140,0,.4)",
  border: "rgba(220,70,0,.5)",
};

const REVENUE_BARS = [34, 55, 28, 72, 96, 78, 88];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const BOTS = [
  { name: "StageManagerBot", status: "green" },
  { name: "RevenueBot",      status: "green" },
  { name: "ChatGuardBot",    status: "green" },
  { name: "StreamMonitor",   status: "yellow" },
  { name: "BookingBot",      status: "green" },
  { name: "BookingBot #2",   status: "off" },
];

const PLAYLIST = [
  { title: "Big Moves",       artist: "Chario Ace",       dur: "3:47", active: true  },
  { title: "Night Frequency", artist: "Chario Ace",       dur: "5:02", active: false },
  { title: "Sound Pressure",  artist: "BJM The Rapper",   dur: "2:58", active: false },
];

const FANS_WAITING = [
  { name: "SkyFan94",    tier: "Gold Tier" },
  { name: "MusicLvr22",  tier: "Fan"       },
  { name: "Beathead33",  tier: "Silver"    },
  { name: "FrequentFly", tier: "Fan"       },
];

const SETLIST = ["Big Moves", "Night Frequency", "Sound Pressure", "Storm Season"];

export default function ArtistDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Artist");
  const [isLive, setIsLive] = useState(false);
  const [viewers] = useState(0);
  const [tips] = useState(0);
  const [reactions, setReactions] = useState<{ id: number; em: string; x: number }[]>([]);
  const [reactionId, setReactionId] = useState(0);

  useEffect(() => {
    fetch("/api/auth/session", { cache: "no-store", credentials: "include" })
      .then(r => r.json())
      .then((d: { authenticated?: boolean; user?: { name?: string; role?: string } }) => {
        if (!d.authenticated) { router.replace("/auth"); return; }
        setUserName(d.user?.name ?? "Artist");
        setLoading(false);
      })
      .catch(() => router.replace("/auth"));
  }, [router]);


  function fireReaction(em: string) {
    const id = reactionId + 1;
    setReactionId(id);
    setReactions(r => [...r, { id, em, x: 10 + Math.random() * 80 }]);
    setTimeout(() => setReactions(r => r.filter(x => x.id !== id)), 1600);
  }

  const panel: React.CSSProperties = { background: C.panel, border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 10px", marginBottom: 6 };
  const card: React.CSSProperties  = { background: C.card, border: `1px solid ${C.border}`, borderRadius: 5, padding: "7px 9px" };
  const lbl = (color = C.amber): React.CSSProperties => ({ fontSize: 8, fontWeight: 800, letterSpacing: "0.13em", color, textTransform: "uppercase" as const, display: "block", marginBottom: 5 });
  const btn = (bc = C.red, tc = C.amber): React.CSSProperties => ({ background: "transparent", border: `1px solid ${bc}`, color: tc, fontFamily: "inherit", fontSize: 9, fontWeight: 700, cursor: "pointer", borderRadius: 4, padding: "5px 9px", letterSpacing: "0.05em", textTransform: "uppercase" as const, transition: "all .15s" });
  const dot = (s: string) => ({ width: 6, height: 6, borderRadius: "50%", display: "inline-block", background: s === "green" ? C.green : s === "yellow" ? C.gold : "rgba(255,140,0,.3)", boxShadow: s === "green" ? `0 0 5px ${C.green}` : s === "yellow" ? `0 0 5px ${C.gold}` : "none", flexShrink: 0 });
  const healthRow: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4, fontSize: 9 };

  if (loading) return (
    <main style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ color: C.dim, fontFamily: "monospace", letterSpacing: "0.14em", textTransform: "uppercase", fontSize: 11 }}>Loading Studio…</span>
    </main>
  );

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "'Exo 2', sans-serif", color: C.amber, padding: 8 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Exo+2:wght@400;600;700&display=swap');
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes flicker{0%,93%,100%{text-shadow:0 0 12px #E63000,0 0 24px rgba(230,48,0,.4)}94%,99%{text-shadow:none}}
        @keyframes pulse{0%,100%{box-shadow:0 0 4px #E63000}50%{box-shadow:0 0 18px #E63000,0 0 36px rgba(230,48,0,.3)}}
        @keyframes eqBar{0%,100%{height:4px}50%{height:var(--eqh)}}
        @keyframes floatUp{0%{transform:translateY(0) scale(1);opacity:1}100%{transform:translateY(-80px) scale(.2);opacity:0}}
        @keyframes bobble{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
        @keyframes ticker{from{transform:translateX(110%)}to{transform:translateX(-110%)}}
        .art-blink{animation:blink 1.2s ease-in-out infinite}
        .art-flicker{animation:flicker 4s ease-in-out infinite;font-family:'Orbitron',sans-serif;font-weight:900;color:#E63000;text-transform:uppercase;letter-spacing:.08em}
        .art-pulse{animation:pulse 2s ease-in-out infinite}
        .art-ticker{animation:ticker 18s linear infinite;white-space:nowrap;display:inline-block;font-size:8px}
        .art-bobble{animation:bobble 1.8s ease-in-out infinite}
        .art-eq{display:inline-block;width:3px;border-radius:1px;background:#E63000;vertical-align:bottom;margin:0 1px}
      `}</style>

      {/* Welcome banner */}
      <div style={{ ...panel, textAlign: "center", borderColor: C.gold, marginBottom: 7 }}>
        <div style={{ fontFamily: "'Orbitron',sans-serif", color: C.gold, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em" }}>🎵 WELCOME TO YOUR PROMOTION HUB, {userName.toUpperCase()} 🎵</div>
        <div style={{ fontSize: 8, color: C.dim, marginTop: 2 }}>We thank you for joining. Ready to take you and your music global. We grow together.</div>
      </div>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
        <div className="art-flicker" style={{ fontSize: 16 }}>ARTIST DASHBOARD</div>
        <div style={{ display: "flex", gap: 4 }}>
          <Link href="/artist/upload" style={{ ...btn(), textDecoration: "none" }}>⬆ UPLOAD</Link>
          <Link href="/artist/shows/new" style={{ ...btn(), textDecoration: "none" }}>📅 SET UP SHOW</Link>
          <Link href="/hub/sponsor" style={{ ...btn(), textDecoration: "none" }}>💼 SPONSOR</Link>
          <button onClick={() => setIsLive(l => !l)} style={{ ...btn(isLive ? C.red : C.green, isLive ? C.red : C.green), fontWeight: 900 }}>
            {isLive ? "🔴 ON AIR — CLICK TO END" : "🔴 GO LIVE"}
          </button>
        </div>
      </div>

      {/* Message bar */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 7, marginBottom: 7 }}>
        <input style={{ background: C.card, border: `1px solid ${C.border}`, color: C.amber, fontFamily: "inherit", fontSize: 11, outline: "none", borderRadius: 4, padding: "7px 11px", width: "100%" }} placeholder="Talk to your fans or pin a message…" />
        <div style={{ display: "flex", gap: 5 }}>
          <button style={{ ...btn(C.gold, C.gold), padding: "7px 14px", fontSize: 10 }}>PUBLISH</button>
          <Link href="/ai/assistant" style={{ ...btn(), textDecoration: "none", padding: "7px 8px", fontSize: 8 }}>🤖 ASSISTANT</Link>
        </div>
      </div>

      {/* Main 2-column */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 170px", gap: 7, marginBottom: 7 }}>
        <div>

          {/* ── LIVE MODE ── */}
          {isLive && (
            <>
              {/* Screen */}
              <div className="art-pulse" style={{ border: `2px solid ${C.red}`, borderRadius: 8, overflow: "hidden", background: "#06000a", height: 180, marginBottom: 6, position: "relative" }}>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 6 }}>
                  {/* Bobblehead crowd */}
                  <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                    {[C.amber, C.red, C.gold, C.orange, C.amber, C.red].map((c, i) => (
                      <div key={i} className="art-bobble" style={{ animationDelay: `${i * 0.3}s`, display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${c}`, background: "#3a1200" }} />
                        <div style={{ width: 14, height: 22, borderRadius: "3px 3px 0 0", background: "#2a0e00", margin: "0 auto" }} />
                      </div>
                    ))}
                  </div>
                  <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${C.red}, transparent)`, width: "80%" }} />
                </div>
                {/* ON AIR badge */}
                <div style={{ position: "absolute", top: 12, right: 12, background: C.red, borderRadius: 4, padding: "3px 9px", fontSize: 8, fontWeight: 700, fontFamily: "'Orbitron',sans-serif", display: "flex", alignItems: "center", gap: 4 }}>
                  <span className="art-blink" style={{ ...dot("green") }} /> ON AIR
                </div>
                {/* Floating reactions */}
                <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
                  {reactions.map(r => (
                    <div key={r.id} style={{ position: "absolute", bottom: "20%", left: `${r.x}%`, fontSize: 20, animation: "floatUp 1.5s ease-out forwards" }}>{r.em}</div>
                  ))}
                </div>
              </div>

              {/* Action dock */}
              <div style={{ ...panel, padding: 6 }}>
                <div style={{ display: "flex", gap: 4 }}>
                  {[["👍","Thanks"], ["❤️","Hearts"], ["💡","Flicker"], ["🎉","Confetti"], ["⚡","Spark"]].map(([em, label]) => (
                    <button key={label} onClick={() => fireReaction(em!)} style={{ ...btn(), display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "5px 6px", flex: 1, fontSize: 7 }}>
                      <span style={{ fontSize: 15 }}>{em}</span>{label}
                    </button>
                  ))}
                  <div style={{ flex: 1, background: "rgba(4,8,26,.95)", border: "1px solid rgba(255,140,0,.3)", borderRadius: 5, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1, cursor: "pointer", minWidth: 46 }}>
                    <span style={{ fontSize: 6, fontWeight: 700, color: C.dim, padding: "1px 4px", border: "1px solid rgba(255,140,0,.4)", borderRadius: 3 }}>AD</span>
                    <div style={{ fontSize: 7, fontWeight: 700, color: C.amber }}>SPONSOR SLOT</div>
                    <div style={{ fontSize: 6, color: C.dim }}>Reach your fans</div>
                  </div>
                </div>
              </div>

              {/* Live tips + stats */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 7, marginBottom: 6 }}>
                <div style={{ ...panel }}>
                  <div style={{ display: "flex", gap: 5, alignItems: "center", marginBottom: 5 }}>
                    <span className="art-blink" style={{ ...dot("green") }} />
                    <span style={{ fontSize: 7, fontWeight: 800, letterSpacing: "0.13em", color: C.amber }}>$ LIVE TIPS</span>
                  </div>
                  {[{ name: "JamesSky", amt: "+$20" }, { name: "Lily88", amt: "+$15" }, { name: "Alex94", amt: "+$10" }].map(t => (
                    <div key={t.name} style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3, fontSize: 9 }}>
                      <span>🟢</span><span style={{ flex: 1 }}>{t.name}</span>
                      <span style={{ color: C.green, fontWeight: 700, fontFamily: "'Orbitron',sans-serif", fontSize: 8 }}>{t.amt}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {[{ lbl: "VIEWERS", val: viewers.toLocaleString() }, { lbl: "TIPS", val: `$${tips}` }, { lbl: "RATING", val: "4.8" }].map(s => (
                    <div key={s.lbl} style={{ ...card, textAlign: "center", flex: 1, padding: 6 }}>
                      <div style={{ fontSize: 7, fontWeight: 800, letterSpacing: "0.12em", color: C.amber }}>{s.lbl}</div>
                      <div style={{ fontFamily: "'Orbitron',sans-serif", fontWeight: 700, color: C.gold, fontSize: 14 }}>{s.val}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── GREEN ROOM / PRIVATE MODE ── */}
          {!isLive && (
            <div style={{ background: "rgba(0,12,30,.95)", border: `1px solid ${C.cyan}`, borderRadius: 8, padding: 12, marginBottom: 7 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div>
                  <div style={{ fontFamily: "'Orbitron',sans-serif", color: C.cyan, fontSize: 12, fontWeight: 700 }}>🟢 PRIVATE LOBBY — GREEN ROOM</div>
                  <div style={{ fontSize: 8, color: C.dim, marginTop: 2 }}>Your pre-show waiting area. Fans can't see you yet.</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ ...lbl(C.cyan), marginBottom: 2 }}>Show starts in</div>
                  <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 18, color: C.gold }}>02:34:18</div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                <div>
                  <span style={{ ...lbl(C.cyan), fontSize: 7 }}>FANS WAITING IN LOBBY</span>
                  {FANS_WAITING.map(f => (
                    <div key={f.name} style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 6px", background: "rgba(0,229,255,.06)", borderRadius: 3, marginBottom: 3 }}>
                      <span style={{ ...dot("cyan"), background: C.cyan, boxShadow: `0 0 5px ${C.cyan}` }} />
                      <span style={{ fontSize: 8, flex: 1 }}>{f.name}</span>
                      <span style={{ fontSize: 7, color: C.dim }}>{f.tier}</span>
                    </div>
                  ))}
                  <div style={{ textAlign: "center", fontSize: 8, color: C.cyan, marginTop: 3 }}>+ 847 more waiting…</div>
                </div>
                <div>
                  <span style={{ ...lbl(C.cyan), fontSize: 7 }}>SET LIST — TONIGHT</span>
                  {SETLIST.map((s, i) => (
                    <div key={s} style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 6px", background: "rgba(255,140,0,.07)", borderRadius: 3, marginBottom: 3 }}>
                      <span style={{ fontSize: 8, color: C.dim, width: 12 }}>{i + 1}.</span>
                      <span style={{ fontSize: 8, flex: 1 }}>{s}</span>
                      <input type="checkbox" defaultChecked={i < 2} style={{ accentColor: C.cyan }} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Private chat */}
              <div style={{ marginBottom: 8 }}>
                <span style={{ ...lbl(C.cyan), fontSize: 7 }}>GREEN ROOM CHAT — PRIVATE</span>
                <div style={{ background: "rgba(0,0,0,.4)", border: "1px solid rgba(0,229,255,.2)", borderRadius: 4, padding: 6, height: 70, overflowY: "auto", marginBottom: 5 }}>
                  {[{ name: "SkyFan94", msg: "Can't wait for tonight!! 🔥" }, { name: "MusicLvr22", msg: "Please play Big Moves first!" }, { name: "BeatHead33", msg: "Ready to tip heavy tonight 💰" }].map(c => (
                    <div key={c.name} style={{ fontSize: 8, color: C.cyan, marginBottom: 3 }}>
                      <strong>{c.name}:</strong> <span style={{ color: C.amber }}>{c.msg}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 5 }}>
                  <input style={{ background: C.card, border: `1px solid ${C.border}`, color: C.amber, fontFamily: "inherit", fontSize: 9, outline: "none", borderRadius: 4, padding: "5px 8px", flex: 1 }} placeholder="Send a private message to waiting fans…" />
                  <button style={{ ...btn(C.cyan, C.cyan), padding: "5px 10px", fontSize: 9 }}>SEND</button>
                </div>
              </div>

              {/* Backstage controls */}
              <div style={{ display: "flex", gap: 5 }}>
                {[["🎚", "SOUND CHECK"], ["📋", "EDIT SET LIST"], ["🎁", "PLAN GIVEAWAY"]].map(([em, label]) => (
                  <button key={label} style={{ ...btn(C.cyan, C.cyan), flex: 1, padding: 8, fontSize: 9 }}>{em} {label}</button>
                ))}
                <button onClick={() => setIsLive(true)} style={{ ...btn(C.red, C.red), flex: 1, padding: 8, fontSize: 9, fontWeight: 900 }}>🔴 GO LIVE NOW</button>
              </div>
            </div>
          )}

          {/* Revenue stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 5, marginBottom: 6 }}>
            <div style={{ ...card, textAlign: "center" }}>
              <div style={{ ...lbl(), fontSize: 7, marginBottom: 2 }}>$ EARNING</div>
              <div style={{ fontFamily: "'Orbitron',sans-serif", fontWeight: 700, color: C.gold, fontSize: 14 }}>$945</div>
              <div style={{ fontSize: 7, color: C.dim, marginTop: 2 }}>Daily $215</div>
            </div>
            <Link href="/rooms/cypher" style={{ ...card, textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, cursor: "pointer" }}>
              <span style={{ fontSize: 18 }}>⚡</span>
              <span style={{ fontSize: 8, fontWeight: 700 }}>JOIN CYPHER</span>
            </Link>
            <Link href="/battles" style={{ ...card, textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, cursor: "pointer" }}>
              <span style={{ fontSize: 18 }}>🥊</span>
              <span style={{ fontSize: 8, fontWeight: 700 }}>BEAT BATTLE</span>
            </Link>
          </div>

          {/* Revenue chart */}
          <div style={{ ...panel }}>
            <span style={{ ...lbl(), fontSize: 7 }}>Revenue Trend (7 days)</span>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 44 }}>
              {REVENUE_BARS.map((h, i) => (
                <div key={i} style={{ height: `${h}%`, background: i === 4 ? C.gold : i === 6 ? C.orange : C.red, borderRadius: "2px 2px 0 0", flex: 1 }} />
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
              {DAYS.map(d => <span key={d} style={{ fontSize: 6, color: C.dim }}>{d}</span>)}
            </div>
          </div>
        </div>

        {/* ── RIGHT SIDEBAR ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>

          {/* Booking */}
          <div style={{ ...panel }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <span style={{ ...lbl() }}>Booking</span><span>📅</span>
            </div>
            <div style={{ fontSize: 10, color: C.gold, fontWeight: 600, marginBottom: 4 }}>SAT, 11</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3, marginBottom: 5 }}>
              {["8 PM", "9 PM", "9 PM", "10 PM"].map(t => (
                <div key={t} style={{ ...card, padding: "2px 4px", textAlign: "center", fontSize: 7 }}>{t}</div>
              ))}
            </div>
            <Link href="/artist/shows/new" style={{ display: "block", textAlign: "center", padding: "3px", fontSize: 7, fontWeight: 700, color: C.amber, border: `1px solid ${C.border}`, borderRadius: 3, textDecoration: "none", marginBottom: 3 }}>REQUEST SLOT</Link>
            <Link href="/artist/shows/promote" style={{ display: "block", textAlign: "center", padding: "3px", fontSize: 7, fontWeight: 700, color: C.amber, border: `1px solid ${C.border}`, borderRadius: 3, textDecoration: "none" }}>📍 PROMOTE SHOW</Link>
          </div>

          {/* Merch + NFT */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
            <Link href="/artist/merch" style={{ ...card, textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: 7, cursor: "pointer" }}>
              <span style={{ fontSize: 16 }}>👕</span>
              <span style={{ fontSize: 7, fontWeight: 700 }}>MERCH</span>
            </Link>
            <Link href="/artist/nft" style={{ ...card, textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: 7, cursor: "pointer" }}>
              <span style={{ fontSize: 16 }}>🎨</span>
              <span style={{ fontSize: 7, fontWeight: 700 }}>NFT</span>
            </Link>
          </div>

          {/* Daily spin */}
          <div style={{ ...panel, textAlign: "center" }}>
            <span style={{ ...lbl(), fontSize: 7 }}>Daily Spin</span>
            <div style={{ width: 58, height: 58, margin: "0 auto 5px", borderRadius: "50%", border: `3px solid ${C.gold}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", background: "rgba(230,48,0,.1)", fontSize: 22 }}>🎡</div>
            <button style={{ ...btn(), width: "100%", padding: 3, fontSize: 8 }}>PLAY</button>
          </div>

          {/* XP stats */}
          <div style={{ ...panel }}>
            {[["XP", "#3"], ["FANS", "17k"], ["RANK", "70"], ["SHOW", "FA #3"]].map(([l, v]) => (
              <div key={l} style={healthRow}>
                <span style={{ fontSize: 8, color: C.dim }}>{l}</span>
                <span style={{ fontFamily: "'Orbitron',sans-serif", fontWeight: 700, color: C.gold, fontSize: 10 }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Mini playlist */}
          <div style={{ ...panel, borderColor: C.cyan }}>
            <span style={{ ...lbl(C.cyan), fontSize: 7 }}>MY PLAYLIST</span>
            {PLAYLIST.map((t, i) => (
              <div key={t.title} style={{ padding: "3px 5px", marginBottom: 2, display: "flex", alignItems: "center", gap: 5, borderRadius: 4, background: t.active ? "rgba(230,48,0,.25)" : undefined, borderLeft: t.active ? `2px solid ${C.red}` : undefined }}>
                {t.active ? (
                  <>
                    <span className="art-eq" style={{ animation: "eqBar .4s ease-in-out infinite", height: 6, ["--eqh" as string]: "12px" }} />
                    <span className="art-eq" style={{ animation: "eqBar .6s ease-in-out infinite .1s", height: 12, ["--eqh" as string]: "12px", background: C.cyan }} />
                  </>
                ) : (
                  <span style={{ fontSize: 7, color: C.dim, width: 10 }}>{i + 1}</span>
                )}
                <div style={{ flex: 1, marginLeft: t.active ? 5 : 0 }}>
                  <div style={{ fontSize: 7, color: t.active ? C.gold : C.amber }}>{t.title}</div>
                  <div style={{ fontSize: 6, color: C.dim }}>{t.dur}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Ad slot */}
          <div style={{ background: "rgba(4,8,26,.95)", border: "1px solid rgba(255,140,0,.3)", borderRadius: 5, padding: "8px 7px", textAlign: "center", position: "relative" }}>
            <span style={{ position: "absolute", top: 3, right: 4, background: "rgba(255,140,0,.2)", border: "1px solid rgba(255,140,0,.4)", borderRadius: 3, fontSize: 6, fontWeight: 700, color: C.dim, padding: "1px 4px" }}>AD</span>
            <div style={{ fontSize: 8, fontWeight: 700, color: C.amber, marginBottom: 3 }}>🎯 WillDoIt Pro</div>
            <div style={{ fontSize: 6, color: C.dim, marginBottom: 4 }}>Artist task management. Stay on schedule.</div>
            <button style={{ ...btn(), width: "100%", padding: 3, fontSize: 7 }}>EXPLORE</button>
          </div>
        </div>
      </div>

      {/* Bot bar */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", padding: "5px 10px", background: "rgba(0,0,0,.3)", border: `1px solid ${C.border}`, borderRadius: 6 }}>
        {BOTS.map((b, i) => (
          <div key={b.name} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span className={b.status !== "off" ? "art-blink" : ""} style={{ ...dot(b.status), animationDelay: `${i * 0.3}s` }} />
            <span style={{ fontSize: 7, color: C.dim }}>{b.name}</span>
          </div>
        ))}
      </div>

      {/* Ticker */}
      <div style={{ ...panel, overflow: "hidden", marginTop: 6 }}>
        <div className="art-ticker">
          🔴 LIVE: Chario Ace — Main Stage &nbsp;&nbsp;&nbsp; 🔥 Battle Arena: 3 rounds in progress &nbsp;&nbsp;&nbsp; 🆕 BJM The Rapper joined Cypher Lounge &nbsp;&nbsp;&nbsp; 💰 $2,400 in tips sent today &nbsp;&nbsp;&nbsp; 🎯 Beat Battle Tournament — 8PM Tonight &nbsp;&nbsp;&nbsp; 🏆 Billboard #1: Big KazhDog this week &nbsp;&nbsp;&nbsp;
        </div>
      </div>
    </div>
  );
}
