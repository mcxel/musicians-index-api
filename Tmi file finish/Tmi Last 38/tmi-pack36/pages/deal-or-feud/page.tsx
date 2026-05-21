"use client";
import Link from "next/link";

const T = { void:"#0D0520", deep:"#150830", card:"#1E0D3E", raised:"#2A1452", cyan:"#00E5FF", gold:"#FFB800", pink:"#FF2D78", purple:"#7B2FBE", teal:"#00C896", text:"#fff", text2:"#C8A8E8", text3:"#7A5F9A", display:"'Bebas Neue',Impact,sans-serif", heading:"'Oswald',sans-serif" };

export default function DealOrFeudHub() {
  return (
    <div style={{ background:T.void, minHeight:"100vh", color:T.text, fontFamily:"Inter,sans-serif" }}>
      <div style={{ background:`linear-gradient(135deg, ${T.raised}, ${T.void})`, padding:"48px 32px 40px", borderBottom:`2px solid ${T.teal}`, textAlign:"center" }}>
        <div style={{ fontFamily:T.heading, fontSize:10, color:T.teal, letterSpacing:4, marginBottom:8 }}>THE INDEX PRESENTS</div>
        <h1 style={{ fontFamily:T.display, fontSize:64, color:T.gold, letterSpacing:4, margin:"0 0 4px", lineHeight:1 }}>DEAL OR FEUD</h1>
        <h2 style={{ fontFamily:T.display, fontSize:32, color:T.teal, letterSpacing:3, margin:"0 0 20px", lineHeight:1 }}>1000</h2>
        <div style={{ fontFamily:T.heading, fontSize:13, color:T.text2, marginBottom:24, letterSpacing:1 }}>SURVEY SAYS! REACH 1000 POINTS — OR STEAL THE BOARD</div>
        <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
          <Link href="/deal-or-feud/new" style={{ padding:"12px 28px", background:T.teal, color:T.void, borderRadius:8, fontFamily:T.heading, fontSize:13, fontWeight:700, letterSpacing:1, textDecoration:"none" }}>🎯 START GAME</Link>
          <Link href="/deal-or-feud/join" style={{ padding:"12px 28px", border:`2px solid ${T.gold}`, color:T.gold, borderRadius:8, fontFamily:T.heading, fontSize:13, letterSpacing:1, textDecoration:"none" }}>👋 JOIN A GAME</Link>
        </div>
      </div>

      <div style={{ maxWidth:960, margin:"0 auto", padding:"32px" }}>
        {/* Scoreboard example */}
        <div style={{ background:T.card, border:`1px solid rgba(0,200,150,0.3)`, borderRadius:12, padding:24, marginBottom:24 }}>
          <div style={{ fontFamily:T.display, fontSize:20, color:T.teal, letterSpacing:2, marginBottom:16 }}>HOW TO PLAY</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:16 }}>
            {[["🏠","FAMILY vs FAMILY","Two teams of up to 4 players each"],["🎯","SURVEY QUESTIONS","Top answers from 100 surveyed music fans"],["🏆","REACH 1000","First team to 1000 points wins the round"]].map(([icon, title, desc]) => (
              <div key={title} style={{ background:T.raised, borderRadius:8, padding:16, textAlign:"center" }}>
                <div style={{ fontSize:28, marginBottom:8 }}>{icon}</div>
                <div style={{ fontFamily:T.heading, fontSize:12, color:T.teal, letterSpacing:1, marginBottom:4 }}>{title}</div>
                <div style={{ fontSize:11, color:T.text2 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Active games */}
        <div style={{ background:T.card, border:`1px solid rgba(0,200,150,0.3)`, borderRadius:12, padding:20 }}>
          <div style={{ fontFamily:T.display, fontSize:18, color:T.teal, letterSpacing:2, marginBottom:16 }}>OPEN GAMES</div>
          <p style={{ color:T.text3, fontSize:13 }}>Active Deal or Feud 1000 games appear here when wired to the game session API.</p>
        </div>
      </div>
    </div>
  );
}
