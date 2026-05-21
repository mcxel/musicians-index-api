"use client";
import Link from "next/link";
import { useState } from "react";

const T = { void:"#0D0520", deep:"#150830", card:"#1E0D3E", raised:"#2A1452", cyan:"#00E5FF", gold:"#FFB800", pink:"#FF2D78", purple:"#7B2FBE", text:"#fff", text2:"#C8A8E8", text3:"#7A5F9A", display:"'Bebas Neue',Impact,sans-serif", heading:"'Oswald',sans-serif" };

export default function DirtyDozensHub() {
  const [hype, setHype] = useState(67);

  return (
    <div style={{ background:T.void, minHeight:"100vh", color:T.text, fontFamily:"Inter,sans-serif" }}>

      {/* Hero */}
      <div style={{ background:`linear-gradient(to bottom, ${T.raised}, ${T.void})`, padding:"48px 32px 40px", borderBottom:`2px solid ${T.pink}`, textAlign:"center" }}>
        <div style={{ fontFamily:T.heading, fontSize:10, color:T.pink, letterSpacing:4, marginBottom:8 }}>THE INDEX PRESENTS</div>
        <h1 style={{ fontFamily:T.display, fontSize:72, color:T.gold, letterSpacing:4, margin:"0 0 8px", lineHeight:1 }}>DIRTY DOZENS</h1>
        <div style={{ fontFamily:T.heading, fontSize:14, color:T.text2, marginBottom:24, letterSpacing:1 }}>THE CLASSIC BATTLE — CROWD JUDGES EVERYTHING</div>

        {/* Hype meter */}
        <div style={{ maxWidth:400, margin:"0 auto 24px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", fontFamily:T.heading, fontSize:10, color:T.text3, letterSpacing:1, marginBottom:6 }}>
            <span>ARENA HYPE</span>
            <span style={{ color:T.pink }}>{hype}%</span>
          </div>
          <div style={{ height:10, background:T.raised, borderRadius:99, overflow:"hidden" }}>
            <div style={{ width:`${hype}%`, height:"100%", background:`linear-gradient(to right, ${T.pink}, ${T.gold})`, borderRadius:99, transition:"width 0.5s" }} />
          </div>
        </div>

        <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
          <Link href="/dirty-dozens/new" style={{ padding:"12px 28px", background:T.pink, color:"#fff", borderRadius:8, fontFamily:T.heading, fontSize:13, fontWeight:700, letterSpacing:1, textDecoration:"none" }}>🎤 START A BATTLE</Link>
          <Link href="/dirty-dozens/watch" style={{ padding:"12px 28px", border:`2px solid ${T.gold}`, color:T.gold, borderRadius:8, fontFamily:T.heading, fontSize:13, letterSpacing:1, textDecoration:"none" }}>👁️ WATCH LIVE</Link>
        </div>
      </div>

      <div style={{ maxWidth:960, margin:"0 auto", padding:"32px" }}>
        {/* How it works */}
        <div style={{ background:T.card, border:`1px solid rgba(255,45,120,0.3)`, borderRadius:12, padding:24, marginBottom:24 }}>
          <div style={{ fontFamily:T.display, fontSize:20, color:T.pink, letterSpacing:2, marginBottom:16 }}>HOW IT WORKS</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:12 }}>
            {[["1","ENTER BATTLE","Two competitors face off"], ["2","3 ROUNDS","Each 2 minutes long"], ["3","CROWD VOTES","Energy determines winner"], ["4","WIN REWARDS","Points + exclusive items"]].map(([n, title, desc]) => (
              <div key={n} style={{ textAlign:"center", padding:12 }}>
                <div style={{ fontFamily:T.display, fontSize:48, color:T.pink, lineHeight:1, marginBottom:4 }}>{n}</div>
                <div style={{ fontFamily:T.heading, fontSize:11, color:T.gold, letterSpacing:1, marginBottom:4 }}>{title}</div>
                <div style={{ fontSize:11, color:T.text2 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Active battles + leaderboard */}
        <div style={{ display:"grid", gridTemplateColumns:"1.5fr 1fr", gap:20 }}>
          <div style={{ background:T.card, border:`1px solid rgba(255,45,120,0.3)`, borderRadius:12, padding:20 }}>
            <div style={{ fontFamily:T.display, fontSize:18, color:T.pink, letterSpacing:2, marginBottom:16 }}>LIVE BATTLES</div>
            <p style={{ color:T.text3, fontSize:13 }}>Active battles appear here when wired to the game session API.</p>
          </div>
          <div style={{ background:T.card, border:`1px solid rgba(255,184,0,0.3)`, borderRadius:12, padding:20 }}>
            <div style={{ fontFamily:T.display, fontSize:18, color:T.gold, letterSpacing:2, marginBottom:16 }}>TOP BATTLERS</div>
            {[1,2,3,4,5].map(n => (
              <div key={n} style={{ display:"flex", gap:10, alignItems:"center", padding:"7px 0", borderBottom:`1px solid rgba(255,255,255,0.05)` }}>
                <span style={{ fontFamily:T.display, fontSize:22, color:T.gold, minWidth:24 }}>{n}</span>
                <div style={{ width:32, height:32, borderRadius:"50%", background:T.raised, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>👤</div>
                <div>
                  <div style={{ fontFamily:T.heading, fontSize:12, fontWeight:700 }}>Battler #{n}</div>
                  <div style={{ fontSize:10, color:T.text3 }}>{n * 13} wins</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
