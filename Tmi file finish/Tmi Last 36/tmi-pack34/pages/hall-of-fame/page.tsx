"use client";
import Link from "next/link";

const T = { void:"#0D0520", deep:"#150830", card:"#1E0D3E", raised:"#2A1452", cyan:"#00E5FF", gold:"#FFB800", pink:"#FF2D78", text:"#fff", text2:"#C8A8E8", text3:"#7A5F9A", display:"'Bebas Neue',Impact,sans-serif", heading:"'Oswald',sans-serif" };

export default function HallOfFame() {
  return (
    <div style={{ background:T.void, minHeight:"100vh", color:T.text, fontFamily:"Inter,sans-serif" }}>
      <div style={{ background:`linear-gradient(to bottom, ${T.raised}, ${T.void})`, padding:"48px 32px 40px", textAlign:"center", borderBottom:`1px solid rgba(255,184,0,0.3)` }}>
        <div style={{ fontSize:64, marginBottom:12 }}>👑</div>
        <h1 style={{ fontFamily:T.display, fontSize:56, color:T.gold, letterSpacing:4, margin:"0 0 8px" }}>HALL OF FAME</h1>
        <p style={{ color:T.text2, fontSize:14, letterSpacing:1 }}>EVERY CROWN WINNER — FOREVER IN THE INDEX</p>
      </div>
      <div style={{ maxWidth:800, margin:"0 auto", padding:"40px 32px" }}>
        <div style={{ background:T.card, border:`2px solid ${T.gold}`, boxShadow:`0 0 24px rgba(255,184,0,0.3)`, borderRadius:12, padding:32, textAlign:"center", marginBottom:24 }}>
          <div style={{ fontFamily:T.heading, fontSize:11, color:T.gold, letterSpacing:2, marginBottom:8 }}>THIS WEEK&apos;S CROWN</div>
          <div style={{ fontSize:48, marginBottom:8 }}>👤</div>
          <div style={{ fontFamily:T.display, fontSize:36, color:T.gold, letterSpacing:2 }}>CURRENT CHAMPION</div>
          <Link href="/profile/artist/current-champion" style={{ display:"inline-block", marginTop:12, padding:"8px 20px", border:`1px solid ${T.gold}`, color:T.gold, borderRadius:6, fontFamily:T.heading, fontSize:11, textDecoration:"none", letterSpacing:1 }}>VIEW PROFILE</Link>
        </div>
        <div style={{ fontFamily:T.display, fontSize:20, color:T.gold, letterSpacing:2, marginBottom:16 }}>PAST CHAMPIONS</div>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {[1,2,3,4,5].map(n => (
            <div key={n} style={{ background:T.card, border:`1px solid rgba(255,184,0,0.2)`, borderRadius:8, padding:"12px 16px", display:"flex", alignItems:"center", gap:16 }}>
              <span style={{ fontFamily:T.display, fontSize:28, color:T.gold, minWidth:32 }}>#{n}</span>
              <div style={{ fontSize:28 }}>👤</div>
              <div>
                <div style={{ fontFamily:T.heading, fontSize:14, fontWeight:700 }}>Champion Name</div>
                <div style={{ fontFamily:T.heading, fontSize:10, color:T.text3, letterSpacing:1 }}>Week — Hip Hop</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
