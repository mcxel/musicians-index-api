"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const C = {
  bg: "#050815", card: "rgba(12,20,50,.9)",
  red: "#E63000", amber: "#FF8C00", gold: "#FFD700",
  green: "#00FF7F", cyan: "#00E5FF", pink: "#FF2DAA",
  battle: "#FF2DAA", cypher: "#00E5FF", challenge: "#FFD700",
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Exo+2:wght@400;600;700;800&display=swap');
.ab{animation:arB 1s ease-in-out infinite}
.ar{animation:arR 1.5s ease-in-out infinite}
.aw{animation:arW 2s ease-in-out infinite}
@keyframes arB{0%,100%{opacity:1}50%{opacity:0}}
@keyframes arR{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}}
@keyframes arW{0%,100%{box-shadow:0 0 8px #FFD700}50%{box-shadow:0 0 24px #FFD700,0 0 48px rgba(255,215,0,.4)}}
@keyframes arS{from{opacity:0;transform:translateX(-12px)}to{opacity:1;transform:translateX(0)}}
.as{animation:arS .3s ease-out}
`;

const QUEUE = [
  { initials: "KR", name: "Krypt",       song: "Drill Season",  genre: "Drill"    },
  { initials: "NQ", name: "NovaQueen",   song: "R&B Royalty",   genre: "R&B"      },
  { initials: "LB", name: "Lagos Burst", song: "Afro Heat",     genre: "Afrobeat" },
];

function fmt(s: number) { return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; }

export default function CompetePage() {
  const [defV, setDefV] = useState(0);
  const [chalV, setChalV] = useState(0);
  const [timer, setTimer] = useState(107);
  const [reacts, setReacts] = useState(0);
  const [tips, setTips] = useState(0);
  const [watch, setWatch] = useState(0);
  const [voted, setVoted] = useState<"def" | "chal" | null>(null);

  const total = defV + chalV;
  const dp = Math.round((defV / total) * 100);

  const vote = useCallback((who: "def" | "chal") => {
    if (voted) return;
    setVoted(who);
    if (who === "def") setDefV((v) => v + 1);
    else setChalV((v) => v + 1);
  }, [voted]);

  useEffect(() => {
    const t1 = setInterval(() => setTimer((s) => {
      if (s <= 1) { setTimeout(() => { setDefV(600 + Math.floor(Math.random() * 400)); setChalV(300 + Math.floor(Math.random() * 300)); setVoted(null); }, 800); return 90 + Math.floor(Math.random() * 60); }
      return s - 1;
    }), 1000);
    const t2 = setInterval(() => {
      setTips((t) => t + Math.floor(Math.random() * 15));
      setDefV((v) => v + Math.floor(Math.random() * 4));
      setChalV((v) => v + Math.floor(Math.random() * 3));
      setReacts((r) => r + Math.floor(Math.random() * 3));
      setWatch((w) => Math.max(100, w + Math.floor((Math.random() - 0.35) * 20)));
    }, 2500);
    return () => { clearInterval(t1); clearInterval(t2); };
  }, []);

  const T = (s: React.CSSProperties) => s; // inline style helper

  return (
    <main style={{ background: C.bg, fontFamily: "'Exo 2', sans-serif", color: "#fff", minHeight: "100vh", paddingBottom: 40 }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,rgba(255,45,170,.15),rgba(255,215,0,.1),rgba(0,229,255,.1))", borderBottom: "2px solid rgba(255,215,0,.3)", padding: "14px 20px", textAlign: "center" }}>
        <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "clamp(16px,4vw,22px)", fontWeight: 900, letterSpacing: "0.06em", marginBottom: 4 }}>
          <span style={{ color: C.battle }}>BATTLE</span>
          <span style={{ color: "rgba(255,255,255,.3)", margin: "0 10px" }}>·</span>
          <span style={{ color: C.cypher }}>CYPHER</span>
          <span style={{ color: "rgba(255,255,255,.3)", margin: "0 10px" }}>·</span>
          <span style={{ color: C.challenge }}>CHALLENGE</span>
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,.5)", letterSpacing: "0.12em" }}>ONE ARENA SYSTEM — RUNS ALL DAY — AUDIENCE ALWAYS WATCHING</div>
      </div>

      {/* Triangle */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderBottom: "1px solid rgba(255,255,255,.08)" }}>
        {/* BATTLE */}
        <div style={{ background: "linear-gradient(180deg,rgba(255,45,170,.12),rgba(5,8,21,1))", borderRight: "1px solid rgba(255,255,255,.08)", padding: "18px 14px" }}>
          <div style={{ textAlign: "center", marginBottom: 12 }}>
            <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 16, fontWeight: 900, color: C.battle, marginBottom: 3 }}>BATTLE</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,.4)" }}>1v1 Head-to-Head</div>
          </div>
          <div style={{ background: "rgba(255,45,170,.08)", border: "1px solid rgba(255,45,170,.3)", borderRadius: 8, padding: 12, marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              {[{ i: "WV", n: "Wavetek", role: "Challenger", c: C.battle }, { i: "BG", n: "Bar God", role: "Defender", c: C.gold }].map((p, idx) => (
                <div key={p.i} style={{ textAlign: "center", flex: 1 }}>
                  {idx === 1 && <div style={{ flex: "0 0 32px", textAlign: "center", fontFamily: "'Orbitron', sans-serif", fontSize: 18, fontWeight: 900, color: C.battle, marginBottom: 8 }}>VS</div>}
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${p.c}22`, border: `2px solid ${p.c}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 4px", fontWeight: 800, fontSize: 12, color: p.c }}>{p.i}</div>
                  <div style={{ fontSize: 10, fontWeight: 700 }}>{p.n}</div>
                  <div style={{ fontSize: 8, color: "rgba(255,255,255,.4)" }}>{p.role}</div>
                </div>
              ))}
            </div>
            <div style={{ background: "rgba(0,0,0,.3)", borderRadius: 4, padding: 6, textAlign: "center" }}>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,.4)", marginBottom: 3 }}>ROUND 2 OF 5</div>
              <div style={{ display: "flex", height: 6, borderRadius: 3, overflow: "hidden", gap: 1 }}>
                {[C.battle, C.gold, "rgba(255,255,255,.15)", "rgba(255,255,255,.15)", "rgba(255,255,255,.15)"].map((bg, i) => <div key={i} style={{ flex: 1, background: bg }} />)}
              </div>
            </div>
          </div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,.5)", lineHeight: 1.7 }}>
            <div>⚔️ Judged by crowd votes + panel</div>
            <div>🏆 Winner stays, next challenger enters</div>
            <div>🎭 Arena seats 18,500 — full audience</div>
          </div>
          <Link href="/battles" style={{ display: "block", marginTop: 12, padding: "7px 0", background: "rgba(255,45,170,.15)", border: `1px solid ${C.battle}`, borderRadius: 5, color: C.battle, fontSize: 10, fontWeight: 700, textDecoration: "none", textAlign: "center", letterSpacing: "0.08em" }}>
            ENTER BATTLE ARENA →
          </Link>
        </div>

        {/* CYPHER */}
        <div style={{ background: "linear-gradient(180deg,rgba(0,229,255,.1),rgba(5,8,21,1))", borderRight: "1px solid rgba(255,255,255,.08)", padding: "18px 14px" }}>
          <div style={{ textAlign: "center", marginBottom: 12 }}>
            <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 16, fontWeight: 900, color: C.cypher, marginBottom: 3 }}>CYPHER</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,.4)" }}>Open Mic · All Are Welcome</div>
          </div>
          <div style={{ background: "rgba(0,229,255,.07)", border: "1px solid rgba(0,229,255,.25)", borderRadius: 8, padding: 12, marginBottom: 10 }}>
            <div style={{ position: "relative", width: 80, height: 80, margin: "0 auto 8px" }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", border: "1.5px solid rgba(0,229,255,.3)" }} />
              <div style={{ width: 56, height: 56, borderRadius: "50%", border: "1.5px dashed rgba(0,229,255,.2)", position: "absolute", top: 12, left: 12 }} />
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontSize: 18 }}>🎤</div>
              {[
                { label: "N1", top: 2,  left: "50%", transform: "translateX(-50%)"                },
                { label: "N2", top: "50%", right: 2, transform: "translateY(-50%)"                 },
                { label: "N3", bottom: 2, left: "50%", transform: "translateX(-50%)"               },
                { label: "ON", top: "50%", left: 2, transform: "translateY(-50%)", gold: true as const },
              ].map((d) => {
                const { gold, ...pos } = d;
                return (
                  <div key={d.label} style={{ position: "absolute", width: 16, height: 16, borderRadius: "50%", background: gold ? "rgba(255,215,0,.2)" : "rgba(0,229,255,.3)", border: `1px solid ${gold ? C.gold : C.cypher}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7, fontWeight: 800, color: gold ? C.gold : C.cypher, ...(pos as React.CSSProperties) }}>
                    {d.label}
                  </div>
                );
              })}
            </div>
            <div style={{ textAlign: "center", fontSize: 9, color: "rgba(255,255,255,.5)" }}>Rotate around the mic all day</div>
          </div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,.5)", lineHeight: 1.7 }}>
            <div>🎤 Everyone gets the mic in rotation</div>
            <div>⚡ Drop bars, get voted up instantly</div>
            <div>🎭 Theater seats 2,730 — intimate</div>
          </div>
          <Link href="/cyphers" style={{ display: "block", marginTop: 12, padding: "7px 0", background: "rgba(0,229,255,.1)", border: `1px solid ${C.cypher}`, borderRadius: 5, color: C.cypher, fontSize: 10, fontWeight: 700, textDecoration: "none", textAlign: "center", letterSpacing: "0.08em" }}>
            ENTER CYPHER ARENA →
          </Link>
        </div>

        {/* CHALLENGE */}
        <div style={{ background: "linear-gradient(180deg,rgba(255,215,0,.1),rgba(5,8,21,1))", padding: "18px 14px" }}>
          <div style={{ textAlign: "center", marginBottom: 12 }}>
            <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 16, fontWeight: 900, color: C.challenge, marginBottom: 3 }}>CHALLENGE</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,.4)" }}>Song vs Song · Continuous</div>
          </div>
          <div style={{ background: "rgba(255,215,0,.07)", border: "1px solid rgba(255,215,0,.25)", borderRadius: 8, padding: 12, marginBottom: 10 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(0,255,127,.12)", border: "1px solid rgba(0,255,127,.3)", borderRadius: 5, padding: "5px 8px" }}>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: C.green }}>DEFENDING NOW</div>
                  <div style={{ fontSize: 11, fontWeight: 800 }}>Beat the Beat</div>
                  <div style={{ fontSize: 8, color: "rgba(255,255,255,.4)" }}>Wavetek · {defV.toLocaleString()} votes</div>
                </div>
                <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 18, fontWeight: 900, color: C.green }}>WON</div>
              </div>
              <div className="ar" style={{ textAlign: "center", fontSize: 10, color: C.gold, fontWeight: 700 }}>↓ NEXT CHALLENGER ↓</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,215,0,.1)", border: "1px solid rgba(255,215,0,.3)", borderRadius: 5, padding: "5px 8px" }}>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: C.gold }}>CHALLENGING</div>
                  <div style={{ fontSize: 11, fontWeight: 800 }}>Trap Session</div>
                  <div style={{ fontSize: 8, color: "rgba(255,255,255,.4)" }}>Bar God · {fmt(timer)} left</div>
                </div>
                <div style={{ fontSize: 11, fontWeight: 800, color: C.gold }}>LIVE</div>
              </div>
            </div>
          </div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,.5)", lineHeight: 1.7 }}>
            <div>🎵 Challenge any song live, any time</div>
            <div>👑 Winner stays, runs all day nonstop</div>
            <div>🎭 Arena seats 18,500 — packed house</div>
          </div>
          <Link href="/challenges" style={{ display: "block", marginTop: 12, padding: "7px 0", background: "rgba(255,215,0,.1)", border: `1px solid ${C.gold}`, borderRadius: 5, color: C.gold, fontSize: 10, fontWeight: 700, textDecoration: "none", textAlign: "center", letterSpacing: "0.08em" }}>
            ENTER CHALLENGE ARENA →
          </Link>
        </div>
      </div>

      {/* Shared Arena Engine */}
      <div style={{ background: "rgba(255,215,0,.04)", borderBottom: "1px solid rgba(255,215,0,.15)", padding: "12px 20px" }}>
        <div style={{ textAlign: "center", marginBottom: 10 }}>
          <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 8, fontWeight: 700, letterSpacing: "0.15em", padding: "3px 10px", borderRadius: 3, background: "rgba(255,215,0,.12)", color: C.gold, border: "1px solid rgba(255,215,0,.3)" }}>SHARED ARENA ENGINE — ALL THREE USE THIS</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8, textAlign: "center" }}>
          {[["🎭","AudienceScene","Live crowd, reactions"],["🏟","Venue Skins","Stadium, theater"],["📺","Lobby Wall","Video panels, live"],["🎤","Stage Curtain","Opens when ready"],["💰","Tips + Votes","Stripe, real-time"]].map(([icon, name, desc]) => (
            <div key={name} style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 6, padding: "8px 6px" }}>
              <div style={{ fontSize: 16, marginBottom: 3 }}>{icon}</div>
              <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,.8)" }}>{name}</div>
              <div style={{ fontSize: 8, color: "rgba(255,255,255,.4)" }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Challenge Arena */}
      <div style={{ padding: "16px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: "#FF2020", verticalAlign: "middle", marginRight: 5 }} className="ab" />
            <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 14, fontWeight: 900, color: C.challenge }}>CHALLENGE ARENA</span>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,.4)", marginLeft: 8 }}>runs all day · anyone can enter</span>
          </div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.gold }}>{watch.toLocaleString()} watching</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 220px", gap: 12 }}>
          <div>
            {/* Current match */}
            <div className="aw" style={{ background: C.card, border: `2px solid ${C.gold}`, borderRadius: 10, padding: 14, marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 9, color: C.gold, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 2 }}>SONG CHALLENGE — LIVE NOW</div>
                  <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 13, fontWeight: 900 }}>Beat the Beat vs Trap Session</div>
                </div>
                <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 20, fontWeight: 900, color: C.gold }}>{fmt(timer)}</div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 8, alignItems: "center", marginBottom: 10 }}>
                <div style={{ background: "rgba(0,255,127,.08)", border: "1px solid rgba(0,255,127,.3)", borderRadius: 6, padding: 10, textAlign: "center" }}>
                  <div style={{ fontSize: 9, color: C.green, fontWeight: 700, marginBottom: 4 }}>DEFENDING CHAMPION</div>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(0,255,127,.15)", border: `2px solid ${C.green}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 5px", fontWeight: 800, fontSize: 13 }}>WV</div>
                  <div style={{ fontSize: 11, fontWeight: 700 }}>Wavetek</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,.5)", marginBottom: 2 }}>Beat the Beat</div>
                  <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 18, fontWeight: 900, color: C.green }}>{defV.toLocaleString()}</div>
                  <div style={{ fontSize: 8, color: "rgba(255,255,255,.4)" }}>votes</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 16, fontWeight: 900, color: C.battle }}>VS</div>
                  <div style={{ fontSize: 8, color: "rgba(255,255,255,.3)", marginTop: 2 }}>SONG CHALLENGE</div>
                </div>
                <div style={{ background: "rgba(255,215,0,.07)", border: "1px solid rgba(255,215,0,.25)", borderRadius: 6, padding: 10, textAlign: "center" }}>
                  <div style={{ fontSize: 9, color: C.gold, fontWeight: 700, marginBottom: 4 }}>CHALLENGER</div>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,215,0,.12)", border: `2px solid ${C.gold}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 5px", fontWeight: 800, fontSize: 13, color: C.gold }}>BG</div>
                  <div style={{ fontSize: 11, fontWeight: 700 }}>Bar God</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,.5)", marginBottom: 2 }}>Trap Session</div>
                  <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 18, fontWeight: 900, color: C.gold }}>{chalV.toLocaleString()}</div>
                  <div style={{ fontSize: 8, color: "rgba(255,255,255,.4)" }}>votes</div>
                </div>
              </div>

              <div style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "rgba(255,255,255,.5)", marginBottom: 3 }}>
                  <span>Wavetek {dp}%</span>
                  <span>{100 - dp}% Bar God</span>
                </div>
                <div style={{ height: 8, borderRadius: 4, overflow: "hidden", background: "rgba(255,215,0,.2)" }}>
                  <div style={{ height: "100%", background: C.green, borderRadius: 4, transition: "width .5s ease", width: `${dp}%` }} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <button type="button" onClick={() => vote("def")} disabled={!!voted} style={{ padding: "8px 0", background: voted === "def" ? C.green : C.green, color: "#050815", fontFamily: "'Exo 2', sans-serif", fontSize: 11, fontWeight: 800, border: "none", borderRadius: 5, cursor: voted ? "not-allowed" : "pointer", opacity: voted && voted !== "def" ? 0.4 : 1, letterSpacing: "0.05em" }}>
                  {voted === "def" ? "✓ VOTED" : "Vote Wavetek"}
                </button>
                <button type="button" onClick={() => vote("chal")} disabled={!!voted} style={{ padding: "8px 0", background: C.gold, color: "#050815", fontFamily: "'Exo 2', sans-serif", fontSize: 11, fontWeight: 800, border: "none", borderRadius: 5, cursor: voted ? "not-allowed" : "pointer", opacity: voted && voted !== "chal" ? 0.4 : 1, letterSpacing: "0.05em" }}>
                  {voted === "chal" ? "✓ VOTED" : "Vote Bar God"}
                </button>
              </div>
            </div>

            {/* Queue */}
            <div style={{ background: C.card, border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, padding: 12 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,.4)", letterSpacing: "0.12em", marginBottom: 8 }}>NEXT UP — CHALLENGERS QUEUE</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 10 }}>
                {QUEUE.map((a, i) => (
                  <div key={a.name} className="as" style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 7px", background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 5 }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(255,45,170,.15)", border: "1px solid rgba(255,45,170,.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: C.battle, flexShrink: 0 }}>{a.initials}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 10, fontWeight: 700 }}>{a.name}</div>
                      <div style={{ fontSize: 8, color: "rgba(255,255,255,.4)" }}>{a.song} · {a.genre}</div>
                    </div>
                    <div style={{ fontSize: 8, color: "rgba(255,255,255,.3)" }}>#{i + 2}</div>
                  </div>
                ))}
              </div>
              <Link href="/challenges/create" style={{ display: "block", padding: "8px 0", background: C.battle, color: "#fff", fontFamily: "'Exo 2', sans-serif", fontSize: 11, fontWeight: 800, borderRadius: 5, textDecoration: "none", textAlign: "center", letterSpacing: "0.05em" }}>
                Challenge the Winner
              </Link>
            </div>
          </div>

          {/* Right sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {/* Audience viz */}
            <div style={{ background: C.card, border: "1px solid rgba(255,215,0,.2)", borderRadius: 10, padding: 12 }}>
              <div style={{ fontSize: 9, color: C.gold, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 8 }}>LIVE AUDIENCE</div>
              <div style={{ background: "rgba(0,0,0,.4)", borderRadius: 6, padding: 10, marginBottom: 8, minHeight: 100, position: "relative" }}>
                <div style={{ textAlign: "center", marginBottom: 6, fontSize: 8, color: "rgba(255,215,0,.5)", letterSpacing: "0.15em" }}>STAGE</div>
                <div style={{ width: 60, height: 3, background: C.gold, opacity: 0.5, margin: "0 auto 8px", borderRadius: 2 }} />
                {[6, 9, 11, 13].map((count, ri) => (
                  <div key={ri} style={{ textAlign: "center", marginBottom: 3, opacity: 0.5 + ri * 0.15 }}>
                    {Array.from({ length: count }, (_, i) => (
                      <span key={i} style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: (ri + i) % 2 === 0 ? (i % 2 === 0 ? C.green : C.gold) : "rgba(255,255,255,.3)", margin: 1 }} />
                    ))}
                  </div>
                ))}
                <div style={{ textAlign: "right", fontSize: 8, color: "rgba(255,255,255,.3)", marginTop: 4 }}>18,500 cap</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1, textAlign: "center", background: "rgba(255,45,170,.1)", borderRadius: 4, padding: 5 }}>
                  <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 14, color: C.battle }}>{reacts.toLocaleString()}</div>
                  <div style={{ fontSize: 8, color: "rgba(255,255,255,.4)" }}>reactions</div>
                </div>
                <div style={{ flex: 1, textAlign: "center", background: "rgba(0,255,127,.08)", borderRadius: 4, padding: 5 }}>
                  <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 14, color: C.green }}>${tips.toLocaleString()}</div>
                  <div style={{ fontSize: 8, color: "rgba(255,255,255,.4)" }}>tips</div>
                </div>
              </div>
            </div>

            {/* How it works */}
            <div style={{ background: C.card, border: "1px solid rgba(0,229,255,.2)", borderRadius: 10, padding: 12 }}>
              <div style={{ fontSize: 9, color: C.cyan, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 8 }}>HOW IT WORKS</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {["Any artist challenges the current champion's song","Both songs play live — audience votes in real time","Winner stays. Next challenger enters instantly","Runs all day — same as Battle and Cypher arenas"].map((text, i) => (
                  <div key={i} style={{ display: "flex", gap: 7, alignItems: "flex-start", fontSize: 10 }}>
                    <span style={{ color: C.gold, fontWeight: 800, minWidth: 14 }}>{i + 1}</span>
                    <span style={{ color: "rgba(255,255,255,.7)" }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Arena nav */}
            <div style={{ background: C.card, border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, padding: 12 }}>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,.4)", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 8 }}>ALL THREE ARENAS</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  { label: "Battle Arena",    href: "/battles",    color: C.battle,    bg: "rgba(255,45,170,.08)",  border: "rgba(255,45,170,.2)",  v: "2,100" },
                  { label: "Cypher Arena",    href: "/cyphers",    color: C.cypher,    bg: "rgba(0,229,255,.07)",   border: "rgba(0,229,255,.2)",   v: "841"   },
                  { label: "Challenge Arena", href: "/challenges", color: C.challenge, bg: "rgba(255,215,0,.08)",   border: "rgba(255,215,0,.25)",  v: "2,840" },
                ].map((a) => (
                  <Link key={a.label} href={a.href} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: a.bg, border: `1px solid ${a.border}`, borderRadius: 5, padding: "6px 9px", textDecoration: "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <span className="ab" style={{ display: "inline-block", width: 5, height: 5, borderRadius: "50%", background: a.color, boxShadow: `0 0 4px ${a.color}` }} />
                      <span style={{ fontSize: 10, fontWeight: 700, color: a.color }}>{a.label}</span>
                    </div>
                    <span style={{ fontSize: 9, color: "rgba(255,255,255,.4)" }}>{a.v} watching</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Challenge Your Song CTA */}
      <div style={{ margin: "0 20px 20px", background: "linear-gradient(135deg,rgba(255,45,170,.15),rgba(255,215,0,.1))", border: "1px solid rgba(255,215,0,.3)", borderRadius: 10, padding: "16px 20px", textAlign: "center" }}>
        <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "clamp(14px,3vw,18px)", fontWeight: 900, color: C.gold, marginBottom: 6 }}>🎤 CHALLENGE YOUR SONG HERE</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,.5)", marginBottom: 14, letterSpacing: "0.08em" }}>SONG FOR SONG · WORK FOR WORK · VIDEO FOR VIDEO</div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/challenges/create" style={{ padding: "10px 28px", background: C.gold, color: "#050815", fontFamily: "'Exo 2', sans-serif", fontSize: 12, fontWeight: 900, borderRadius: 6, textDecoration: "none", letterSpacing: "0.08em" }}>ENTER THE ARENA →</Link>
          <Link href="/battles/create" style={{ padding: "10px 20px", background: "transparent", border: `1px solid ${C.battle}`, color: C.battle, fontFamily: "'Exo 2', sans-serif", fontSize: 12, fontWeight: 800, borderRadius: 6, textDecoration: "none", letterSpacing: "0.06em" }}>START A BATTLE</Link>
          <Link href="/cyphers" style={{ padding: "10px 20px", background: "transparent", border: `1px solid ${C.cypher}`, color: C.cypher, fontFamily: "'Exo 2', sans-serif", fontSize: 12, fontWeight: 800, borderRadius: 6, textDecoration: "none", letterSpacing: "0.06em" }}>JOIN CYPHER</Link>
        </div>
      </div>
    </main>
  );
}
