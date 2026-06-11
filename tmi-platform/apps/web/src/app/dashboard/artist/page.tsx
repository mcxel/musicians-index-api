"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdSenseSlot, { AD_SLOTS } from "@/components/ads/AdSenseSlot";

interface MeUser { id: string; email: string; name?: string; role: string; tier?: string; }
interface Reaction { id: number; emoji: string; x: number; }

const REVENUE_BARS = [34, 55, 28, 72, 96, 78, 88];

export default function ArtistDashboardPage() {
  const router = useRouter();
  const [user, setUser]       = useState<MeUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive]   = useState(true);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [chatMsg, setChatMsg] = useState("");
  const [countdown] = useState("02:34:18");
  const rxIdRef = useRef(0);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/auth/session", { cache: "no-store", credentials: "include" });
        if (res.status === 401 || res.status === 403) { router.replace("/auth"); return; }
        const data = await res.json() as { authenticated: boolean; user?: MeUser };
        if (!data.authenticated || !data.user) { router.replace("/auth"); return; }
        if (data.user.role.toLowerCase() !== "artist") { router.replace("/dashboard"); return; }
        setUser(data.user);
      } catch { router.replace("/auth"); } finally { setLoading(false); }
    };
    void load();
  }, [router]);

  const fireReaction = useCallback((emoji: string) => {
    const id = ++rxIdRef.current;
    const x = 8 + Math.random() * 82;
    setReactions(prev => [...prev.slice(-10), { id, emoji, x }]);
    setTimeout(() => setReactions(prev => prev.filter(r => r.id !== id)), 1500);
  }, []);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#050510", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ color: "#00FFFF", fontSize: 13, letterSpacing: 4, fontWeight: 700 }}>LOADING ARTIST HUB...</span>
    </div>
  );

  if (!user) return null;

  const displayName = user.name ?? user.email?.split("@")[0] ?? "Artist";
  const displayTier = (user.tier ?? "free").toUpperCase();

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", fontFamily: "'Exo 2', 'Inter', sans-serif" }}>
      <style>{`
        @keyframes art-blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes art-bobble{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
        @keyframes art-float{0%{transform:translateY(0) scale(1);opacity:1}100%{transform:translateY(-80px) scale(.2);opacity:0}}
        @keyframes art-pulse{0%,100%{box-shadow:0 0 4px #00FF88}50%{box-shadow:0 0 18px #00FF88,0 0 36px rgba(0,255,136,.3)}}
        @keyframes art-ad-pulse{0%,100%{opacity:.8}50%{opacity:1}}
        @keyframes art-flicker{0%,93%,100%{text-shadow:0 0 12px #FF2DAA,0 0 24px rgba(255,45,170,.4)}94%,99%{text-shadow:none}}
        @keyframes art-ticker{from{transform:translateX(110%)}to{transform:translateX(-110%)}}
        .art-blink{animation:art-blink 1.2s ease-in-out infinite}
        .art-bobble{animation:art-bobble 1.8s ease-in-out infinite}
        .art-float{animation:art-float 1.5s ease-out forwards}
        .art-pulse-border{animation:art-pulse 2s ease-in-out infinite}
        .art-ad-pulse{animation:art-ad-pulse 3s ease-in-out infinite}
        .art-flicker{animation:art-flicker 4s ease-in-out infinite}
        .art-ticker{animation:art-ticker 18s linear infinite;white-space:nowrap}
        .art-action-btn{display:flex;flex-direction:column;align-items:center;gap:3px;padding:5px 6px;background:transparent;border:1px solid rgba(255,45,170,.4);color:rgba(255,140,0,.9);font-size:7px;font-weight:700;cursor:pointer;border-radius:4px;flex:1;min-width:38px;transition:all .15s}
        .art-action-btn:hover{background:rgba(255,45,170,.2);color:#FFD700}
      `}</style>

      {/* ── Sticky header ── */}
      <div style={{ background: "#030610", borderBottom: "1px solid rgba(255,45,170,.3)", padding: "9px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <span className="art-flicker" style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 15, fontWeight: 900, color: "#FF2DAA", letterSpacing: ".08em", textTransform: "uppercase" }}>ARTIST STUDIO 🎤</span>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "#00FFFF", fontWeight: 700 }}>{displayName}</span>
          <span style={{ fontSize: 9, background: "rgba(255,215,0,.12)", color: "#FFD700", border: "1px solid rgba(255,215,0,.3)", padding: "2px 8px", borderRadius: 10, fontWeight: 700 }}>{displayTier}</span>
          <button
            onClick={() => setIsLive(l => !l)}
            style={{ fontSize: 9, padding: "3px 10px", background: isLive ? "rgba(0,255,136,.15)" : "transparent", border: `1px solid ${isLive ? "#00FF88" : "rgba(255,45,170,.4)"}`, color: isLive ? "#00FF88" : "rgba(255,140,0,.9)", borderRadius: 4, cursor: "pointer", fontWeight: 700, letterSpacing: ".05em" }}
          >
            {isLive ? "🔴 ON AIR" : "🟢 GO LIVE"}
          </button>
          <Link href="/settings" style={{ fontSize: 9, color: "rgba(255,255,255,.35)", border: "1px solid rgba(255,255,255,.1)", padding: "3px 8px", borderRadius: 4, textDecoration: "none", fontWeight: 700 }}>⚙️</Link>
        </div>
      </div>

      <div style={{ padding: "8px 12px" }}>

        {/* ── Welcome banner ── */}
        <div style={{ background: "rgba(8,14,38,.95)", border: "1px solid rgba(255,215,0,.4)", borderRadius: 6, padding: "8px 14px", marginBottom: 7, textAlign: "center" }}>
          <div style={{ fontFamily: "'Orbitron', sans-serif", color: "#FFD700", fontSize: 10, fontWeight: 700, letterSpacing: ".1em" }}>🎵 WELCOME TO YOUR PROMOTION HUB 🎵</div>
          <div style={{ fontSize: 8, color: "rgba(255,140,0,.5)", marginTop: 2 }}>We thank you for joining. Ready to take you and your music global. We grow together.</div>
        </div>

        {/* ── Quick actions bar ── */}
        <div style={{ display: "flex", gap: 5, marginBottom: 7, flexWrap: "wrap" }}>
          {[
            { lbl: "⬆ UPLOAD",     href: "/beats" },
            { lbl: "📅 SET UP SHOW", href: "/live/stages" },
            { lbl: "💼 SPONSOR",    href: "/dashboard/artist/sponsors" },
          ].map(({ lbl, href }) => (
            <Link key={lbl} href={href} style={{ fontSize: 8, padding: "5px 10px", background: "transparent", border: "1px solid rgba(255,45,170,.4)", color: "rgba(255,140,0,.9)", borderRadius: 4, textDecoration: "none", fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase" as const }}>{lbl}</Link>
          ))}
          <button onClick={() => setIsLive(l => !l)} style={{ fontSize: 8, padding: "5px 10px", background: isLive ? "rgba(0,255,136,.1)" : "transparent", border: `1px solid ${isLive ? "#00FF88" : "rgba(0,255,136,.4)"}`, color: isLive ? "#00FF88" : "rgba(0,255,136,.7)", borderRadius: 4, cursor: "pointer", fontWeight: 700, letterSpacing: ".05em" }}>
            {isLive ? "⏹ END SHOW" : "🔴 GO LIVE"}
          </button>
        </div>

        {/* ── Publisher input ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 7, marginBottom: 7 }}>
          <input
            value={chatMsg}
            onChange={e => setChatMsg(e.target.value)}
            placeholder="Talk to your fans or pin a message..."
            style={{ width: "100%", background: "rgba(12,20,50,.9)", border: "1px solid rgba(255,45,170,.4)", color: "rgba(255,140,0,.9)", fontSize: 11, outline: "none", borderRadius: 4, padding: "7px 11px", boxSizing: "border-box" as const }}
          />
          <div style={{ display: "flex", gap: 5 }}>
            <button style={{ padding: "7px 14px", fontSize: 10, background: "rgba(255,215,0,.12)", border: "1px solid rgba(255,215,0,.4)", color: "#FFD700", borderRadius: 4, cursor: "pointer", fontWeight: 700, letterSpacing: ".05em" }}>PUBLISH</button>
            <Link href="/hub/artist" style={{ padding: "7px 8px", fontSize: 8, background: "transparent", border: "1px solid rgba(255,45,170,.4)", color: "rgba(255,140,0,.9)", borderRadius: 4, textDecoration: "none", fontWeight: 700, display: "flex", alignItems: "center" }}>🤖 ASSISTANT</Link>
          </div>
        </div>

        {/* ── Main grid: content + sidebar ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 162px", gap: 8, marginBottom: 8 }}>

          {/* LEFT: Live or Green Room */}
          <div>
            {isLive ? (
              <>
                {/* Marquee / Live screen */}
                <div className="art-pulse-border" style={{ position: "relative", border: "2px solid #00FF88", borderRadius: 8, overflow: "hidden", background: "#06000a", height: 174, marginBottom: 6, boxShadow: "0 0 18px rgba(0,255,136,.3)" }}>
                  <div style={{ position: "absolute", inset: 12, borderRadius: 4, background: "linear-gradient(to bottom, #0a0020, #050510)", display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 10, overflow: "hidden" }}>
                    {[...Array(10)].map((_, i) => (
                      <div key={i} className="art-bobble" style={{ display: "flex", flexDirection: "column", alignItems: "center", animationDelay: `${i * 0.14}s`, margin: "0 4px" }}>
                        <div style={{ width: 18 + (i % 3) * 3, height: 18 + (i % 3) * 3, borderRadius: "50%", background: ["#5C2A00","#8B2200","#2F1B0E","#6B2C00","#4a1e00","#703200","#5C2A00","#8B2200","#2F1B0E","#703200"][i], border: `2px solid ${["#FF2DAA","#00FFFF","#FFD700","#AA2DFF","#FF9500","#00FF88","#00FFFF","#FF2DAA","#FFD700","#00FF88"][i]}` }} />
                        <div style={{ width: 12 + (i % 3) * 2, height: 20, borderRadius: "3px 3px 0 0", background: "#1a0a00" }} />
                      </div>
                    ))}
                  </div>
                  {reactions.map(r => (
                    <div key={r.id} className="art-float" style={{ position: "absolute", bottom: 20, left: `${r.x}%`, fontSize: 20, pointerEvents: "none", zIndex: 10 }}>{r.emoji}</div>
                  ))}
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,transparent,#00FF88,transparent)" }} />
                  <div style={{ position: "absolute", top: 12, right: 12, background: "#FF2DAA", borderRadius: 4, padding: "3px 9px", fontSize: 8, fontWeight: 700, fontFamily: "'Orbitron', sans-serif", zIndex: 10, display: "flex", alignItems: "center", gap: 4 }}>
                    <span className="art-blink" style={{ width: 6, height: 6, borderRadius: "50%", background: "#00FF88", boxShadow: "0 0 5px #00FF88", display: "inline-block" }} />
                    ON AIR
                  </div>
                </div>

                {/* Reaction dock */}
                <div style={{ background: "rgba(8,14,38,.95)", border: "1px solid rgba(255,45,170,.4)", borderRadius: 6, padding: 6, marginBottom: 6 }}>
                  <div style={{ display: "flex", gap: 4 }}>
                    {[["👍","Thanks"],["❤️","Hearts"],["💡","Flicker"],["🎉","Confetti"],["⚡","Spark"]].map(([em, lbl]) => (
                      <button key={lbl} className="art-action-btn" onClick={() => fireReaction(em)}>
                        <span style={{ fontSize: 15 }}>{em}</span>{lbl}
                      </button>
                    ))}
                    <div className="art-ad-pulse" style={{ flex: 1, minWidth: 50, background: "rgba(4,8,26,.95)", border: "1px solid rgba(255,140,0,.3)", borderRadius: 5, padding: "5px 4px", textAlign: "center", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>
                      <span style={{ position: "absolute", top: 2, right: 3, fontSize: 6, fontWeight: 700, color: "rgba(255,140,0,.55)", padding: "1px 3px" }}>AD</span>
                      <div style={{ fontSize: 7, fontWeight: 700, color: "rgba(255,140,0,.9)" }}>SPONSOR SLOT</div>
                      <div style={{ fontSize: 6, color: "rgba(255,140,0,.4)" }}>Reach your fans</div>
                    </div>
                  </div>
                </div>

                {/* Live tips + stats */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 7, marginBottom: 6 }}>
                  <div style={{ background: "rgba(8,14,38,.95)", border: "1px solid rgba(255,45,170,.4)", borderRadius: 6, padding: 7 }}>
                    <div style={{ display: "flex", gap: 5, alignItems: "center", marginBottom: 5 }}>
                      <span className="art-blink" style={{ width: 7, height: 7, borderRadius: "50%", background: "#00FF88", boxShadow: "0 0 5px #00FF88", display: "inline-block" }} />
                      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".12em", color: "rgba(255,149,0,.8)", textTransform: "uppercase" }}>$ LIVE TIPS</span>
                    </div>
                    {[["JamesSky","$20"],["Lily88","$15"],["Alex94","$10"]].map(([name, amt]) => (
                      <div key={name} style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
                        <span style={{ fontSize: 8 }}>🟢</span>
                        <span style={{ fontSize: 9, flex: 1 }}>{name}</span>
                        <span style={{ fontSize: 8, color: "#00FF88", fontWeight: 700 }}>+{amt}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {[["VIEWERS","215"],["TIPS","$865"],["RATING","4.8"]].map(([lbl, val]) => (
                      <div key={lbl} style={{ background: "rgba(8,14,38,.95)", border: "1px solid rgba(255,45,170,.4)", borderRadius: 4, padding: "6px", textAlign: "center", flex: 1 }}>
                        <div style={{ fontSize: 7, fontWeight: 700, letterSpacing: ".12em", color: "rgba(255,149,0,.8)", textTransform: "uppercase" }}>{lbl}</div>
                        <div style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 700, color: "#FFD700", fontSize: lbl === "VIEWERS" ? 16 : 14 }}>{val}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              /* ── GREEN ROOM ── */
              <div style={{ background: "rgba(0,12,30,.95)", border: "1px solid #00FFFF", borderRadius: 8, padding: 12, marginBottom: 7, boxShadow: "0 0 8px rgba(0,255,255,.2)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div>
                    <div style={{ fontFamily: "'Orbitron', sans-serif", color: "#00FFFF", fontSize: 12, fontWeight: 700 }}>🟢 PRIVATE LOBBY — GREEN ROOM</div>
                    <div style={{ fontSize: 8, color: "rgba(255,140,0,.5)", marginTop: 2 }}>Your pre-show waiting area. Fans can&apos;t see you yet.</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 7, fontWeight: 700, letterSpacing: ".12em", color: "rgba(0,229,255,.7)", textTransform: "uppercase" }}>Show starts in</div>
                    <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 18, color: "#FFD700" }}>{countdown}</div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                  {/* Fans waiting */}
                  <div>
                    <div style={{ fontSize: 7, fontWeight: 700, letterSpacing: ".12em", color: "rgba(0,229,255,.7)", textTransform: "uppercase", marginBottom: 5 }}>FANS WAITING</div>
                    {[["SkyFan94","Gold Tier"],["MusicLvr22","Fan"],["BeatHead33","Silver"],["FrequentFly","Fan"]].map(([name, tier]) => (
                      <div key={name} style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 6px", background: "rgba(0,229,255,.05)", borderRadius: 3, marginBottom: 3 }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00FFFF", boxShadow: "0 0 5px #00FFFF", display: "inline-block", flexShrink: 0 }} />
                        <span style={{ fontSize: 8, flex: 1 }}>{name}</span>
                        <span style={{ fontSize: 7, color: "rgba(255,140,0,.5)" }}>{tier}</span>
                      </div>
                    ))}
                    <div style={{ textAlign: "center", fontSize: 8, color: "#00FFFF", marginTop: 3 }}>+ 847 more waiting...</div>
                  </div>

                  {/* Set list */}
                  <div>
                    <div style={{ fontSize: 7, fontWeight: 700, letterSpacing: ".12em", color: "rgba(0,229,255,.7)", textTransform: "uppercase", marginBottom: 5 }}>SET LIST — TONIGHT</div>
                    {[["Big Moves", true],["Night Frequency", true],["Sound Pressure", false],["Storm Season", false]].map(([title, done], i) => (
                      <div key={String(title)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 6px", background: "rgba(255,140,0,.06)", borderRadius: 3, marginBottom: 3 }}>
                        <span style={{ fontSize: 8, color: "rgba(255,140,0,.4)" }}>{i + 1}.</span>
                        <span style={{ fontSize: 8, flex: 1 }}>{title as string}</span>
                        <input type="checkbox" defaultChecked={done as boolean} style={{ accentColor: "#00FFFF" }} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Private chat */}
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 7, fontWeight: 700, letterSpacing: ".12em", color: "rgba(0,229,255,.7)", textTransform: "uppercase", marginBottom: 4 }}>GREEN ROOM CHAT — PRIVATE</div>
                  <div style={{ background: "rgba(0,0,0,.4)", border: "1px solid rgba(0,229,255,.2)", borderRadius: 4, padding: 6, height: 64, overflowY: "auto", marginBottom: 5 }}>
                    {[["SkyFan94","Can't wait for tonight!! 🔥"],["MusicLvr22","Please play Big Moves first!"],["BeatHead33","Ready to tip heavy tonight 💰"]].map(([name, msg]) => (
                      <div key={name} style={{ fontSize: 8, color: "#00FFFF", marginBottom: 3 }}><strong>{name}:</strong> <span style={{ color: "rgba(255,140,0,.8)" }}>{msg}</span></div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 5 }}>
                    <input placeholder="Send a private message to waiting fans..." style={{ flex: 1, background: "rgba(12,20,50,.9)", border: "1px solid rgba(0,229,255,.3)", color: "rgba(255,140,0,.9)", fontSize: 9, outline: "none", borderRadius: 4, padding: "5px 9px", boxSizing: "border-box" as const }} />
                    <button style={{ padding: "5px 10px", fontSize: 9, background: "transparent", border: "1px solid #00FFFF", color: "#00FFFF", borderRadius: 4, cursor: "pointer", fontWeight: 700 }}>SEND</button>
                  </div>
                </div>

                {/* Backstage controls */}
                <div style={{ display: "flex", gap: 5 }}>
                  {["🎚 SOUND CHECK","📋 EDIT SET LIST","🎁 PLAN GIVEAWAY"].map(lbl => (
                    <button key={lbl} style={{ flex: 1, padding: 8, fontSize: 9, background: "transparent", border: "1px solid #00FFFF", color: "#00FFFF", borderRadius: 4, cursor: "pointer", fontWeight: 700 }}>{lbl}</button>
                  ))}
                  <button onClick={() => setIsLive(true)} style={{ flex: 1, padding: 8, fontSize: 9, background: "transparent", border: "1px solid #FF2DAA", color: "#FF2DAA", borderRadius: 4, cursor: "pointer", fontWeight: 700 }}>🔴 GO LIVE NOW</button>
                </div>
              </div>
            )}

            {/* Revenue + battle actions */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 5, marginBottom: 6 }}>
              <div style={{ background: "rgba(8,14,38,.95)", border: "1px solid rgba(255,45,170,.4)", borderRadius: 6, padding: 7, textAlign: "center" }}>
                <div style={{ fontSize: 7, fontWeight: 700, letterSpacing: ".12em", color: "rgba(255,149,0,.8)", textTransform: "uppercase", marginBottom: 2 }}>$ EARNING</div>
                <div style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 700, color: "#FFD700", fontSize: 14 }}>$945</div>
                <div style={{ fontSize: 7, color: "rgba(255,140,0,.4)", marginTop: 2 }}>Daily $215</div>
              </div>
              <Link href="/cypher/live" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, padding: 7, background: "transparent", border: "1px solid rgba(255,45,170,.4)", color: "rgba(255,140,0,.9)", borderRadius: 6, textDecoration: "none", fontWeight: 700, textAlign: "center" as const }}>
                <span style={{ fontSize: 16 }}>⚡</span><span style={{ fontSize: 8 }}>JOIN CYPHER</span>
              </Link>
              <Link href="/battles" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, padding: 7, background: "transparent", border: "1px solid rgba(255,45,170,.4)", color: "rgba(255,140,0,.9)", borderRadius: 6, textDecoration: "none", fontWeight: 700, textAlign: "center" as const }}>
                <span style={{ fontSize: 16 }}>🥊</span><span style={{ fontSize: 8 }}>BEAT BATTLE</span>
              </Link>
            </div>

            {/* Revenue chart */}
            <div style={{ background: "rgba(8,14,38,.95)", border: "1px solid rgba(255,45,170,.4)", borderRadius: 6, padding: 7, marginBottom: 6 }}>
              <div style={{ fontSize: 7, fontWeight: 700, letterSpacing: ".12em", color: "rgba(255,149,0,.8)", textTransform: "uppercase", marginBottom: 5 }}>Revenue Trend (7 days)</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 44 }}>
                {REVENUE_BARS.map((h, i) => (
                  <div key={i} style={{ flex: 1, height: `${h}%`, background: h > 80 ? "#FFD700" : h > 55 ? "#FF9500" : "#FF2DAA", borderRadius: "2px 2px 0 0" }} />
                ))}
              </div>
            </div>

            {/* Ad in green room only */}
            {!isLive && (
              <div className="art-ad-pulse" style={{ background: "rgba(4,8,26,.95)", border: "1px solid rgba(255,140,0,.28)", borderRadius: 5, padding: 8, position: "relative", overflow: "hidden", marginBottom: 6 }}>
                <span style={{ position: "absolute", top: 2, right: 3, fontSize: 6, fontWeight: 700, color: "rgba(255,140,0,.55)", padding: "1px 3px" }}>AD</span>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,140,0,.9)" }}>🎙 BerntoutStudio AI — Upgrade your sound</div>
                    <div style={{ fontSize: 7, color: "rgba(255,140,0,.4)" }}>AI mastering, mixing, and beat generation. Exclusive artist rates.</div>
                  </div>
                  <Link href="/store" style={{ padding: "4px 10px", fontSize: 8, background: "transparent", border: "1px solid rgba(255,45,170,.4)", color: "rgba(255,140,0,.9)", borderRadius: 4, textDecoration: "none", fontWeight: 700 }}>GET DEAL</Link>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {/* Upload track */}
            <Link href="/beats" style={{ background: "rgba(8,14,38,.95)", border: "1px solid rgba(255,45,170,.4)", borderRadius: 6, padding: 8, textDecoration: "none", textAlign: "center" as const, display: "block" }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>⬆</div>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".12em", color: "rgba(255,149,0,.8)", textTransform: "uppercase" }}>UPLOAD TRACK</div>
              <div style={{ fontSize: 7, color: "rgba(255,140,0,.4)", marginTop: 2 }}>Drop your latest</div>
            </Link>

            {/* Upcoming shows */}
            <div style={{ background: "rgba(8,14,38,.95)", border: "1px solid rgba(255,45,170,.4)", borderRadius: 6, padding: 7 }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".12em", color: "rgba(255,149,0,.8)", textTransform: "uppercase", textAlign: "center", marginBottom: 5 }}>Shows</div>
              {[["Today","8:00 PM","Main Stage"],["Jun 14","6:30 PM","Cypher Lounge"]].map(([date, time, room]) => (
                <div key={date} style={{ padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,.04)" }}>
                  <div style={{ fontSize: 8, color: "#FFD700", fontWeight: 700 }}>{date} · {time}</div>
                  <div style={{ fontSize: 7, color: "rgba(255,140,0,.4)" }}>{room}</div>
                </div>
              ))}
              <Link href="/live/stages" style={{ display: "block", marginTop: 5, fontSize: 8, fontWeight: 700, border: "1px solid rgba(255,45,170,.4)", color: "rgba(255,140,0,.9)", borderRadius: 4, textDecoration: "none", textAlign: "center" as const, padding: "3px 0", letterSpacing: ".05em", textTransform: "uppercase" as const }}>+ ADD SHOW</Link>
            </div>

            {/* Revenue summary */}
            <div style={{ background: "rgba(8,14,38,.95)", border: "1px solid rgba(255,45,170,.4)", borderRadius: 6, padding: 7, textAlign: "center" }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".12em", color: "rgba(255,149,0,.8)", textTransform: "uppercase", marginBottom: 3 }}>Total Revenue</div>
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 700, color: "#00FF88", fontSize: 18 }}>$3,845</div>
              <div style={{ fontSize: 7, color: "rgba(255,140,0,.4)", marginTop: 2 }}>+$215 today</div>
              <Link href="/dashboard/artist/earnings" style={{ display: "block", marginTop: 5, fontSize: 8, fontWeight: 700, border: "1px solid rgba(0,255,136,.3)", color: "#00FF88", borderRadius: 4, textDecoration: "none", textAlign: "center" as const, padding: "3px 0", letterSpacing: ".05em", textTransform: "uppercase" as const }}>VIEW PAYOUTS</Link>
            </div>

            {/* Fan wall mini */}
            <div style={{ background: "rgba(8,14,38,.95)", border: "1px solid rgba(255,45,170,.4)", borderRadius: 6, padding: 7 }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".12em", color: "rgba(255,149,0,.8)", textTransform: "uppercase", marginBottom: 5 }}>Top Fans</div>
              {[["SkyFan94","💛"],["MusicLvr22","❤️"],["BeatHead33","💜"]].map(([name, em]) => (
                <div key={name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontSize: 9 }}>{name}</span>
                  <span style={{ fontSize: 12 }}>{em}</span>
                </div>
              ))}
            </div>

            {/* Sidebar AD */}
            <div className="art-ad-pulse" style={{ background: "rgba(4,8,26,.95)", border: "1px solid rgba(255,140,0,.28)", borderRadius: 5, padding: "9px 7px", textAlign: "center", position: "relative", overflow: "hidden" }}>
              <span style={{ position: "absolute", top: 2, right: 3, fontSize: 6, fontWeight: 700, color: "rgba(255,140,0,.55)", padding: "1px 3px" }}>AD</span>
              <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,140,0,.9)", marginBottom: 3 }}>📢 Promote Your Track</div>
              <div style={{ fontSize: 7, color: "rgba(255,140,0,.4)", marginBottom: 5 }}>Reach 50K+ fans on TMI radio.</div>
              <Link href="/advertiser" style={{ display: "block", width: "100%", padding: "3px", fontSize: 8, fontWeight: 700, border: "1px solid rgba(255,45,170,.4)", color: "rgba(255,140,0,.9)", borderRadius: 4, textDecoration: "none", letterSpacing: ".05em", textTransform: "uppercase" as const }}>GET PROMO</Link>
            </div>
          </div>
        </div>

        {/* AdSense */}
        <AdSenseSlot slot={AD_SLOTS.dashboardSidebar} format="horizontal" label="ADVERTISEMENT" style={{ marginBottom: 8 }} />

        {/* Ticker */}
        <div style={{ background: "rgba(8,14,38,.95)", border: "1px solid rgba(255,45,170,.35)", borderRadius: 6, padding: "5px 8px", overflow: "hidden", marginBottom: 8 }}>
          <div className="art-ticker" style={{ fontSize: 8, color: "#FFD700" }}>
            🔴 LIVE: Chario Ace — Main Stage &nbsp;&nbsp;&nbsp; 💰 $2,400 in tips sent today &nbsp;&nbsp;&nbsp; 🎯 Beat Battle Tournament — 8PM Tonight &nbsp;&nbsp;&nbsp; 🏆 Billboard #1: Big KazhDog this week &nbsp;&nbsp;&nbsp; 🆕 New fan: SkyFan94 followed you &nbsp;&nbsp;&nbsp;
          </div>
        </div>

      </div>
    </main>
  );
}
