// apps/web/src/app/dashboard/fan/page.tsx — Fan Dashboard
"use client";
import Link from "next/link";
const T = { bg:"#0D0520",card:"#1E0D3E",raised:"#2A1452",gold:"#FFB800",teal:"#00B8A9",pink:"#FF2D78",purple:"#7B2FBE",cyan:"#00E5FF",amber:"#FF8C00",text:"#fff",text2:"#C8A8E8",text3:"#7A5F9A",teal2:"#00C896",display:"'Bebas Neue',Impact,sans-serif",heading:"'Oswald',sans-serif" };

export default function FanDashboard() {
  return (
    <div style={{ background:T.bg, minHeight:"100vh", color:T.text, fontFamily:"Inter,sans-serif" }}>
      {/* Header */}
      <div style={{ background:"#150830", borderBottom:`1px solid ${T.teal}33`, padding:"16px 20px", display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ width:44, height:44, borderRadius:"50%", background:`linear-gradient(135deg,${T.teal}66,${T.raised})`, border:`2px solid ${T.teal}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>👤</div>
        <div>
          <div style={{ fontFamily:T.display, fontSize:18, color:T.teal, letterSpacing:1 }}>FAN DASHBOARD</div>
          <div style={{ fontFamily:T.heading, fontSize:10, color:T.text3, letterSpacing:1 }}>Fan Account · FREE · 850 pts</div>
        </div>
        <div style={{ flex:1 }} />
        <Link href="/shop" style={{ padding:"6px 14px", background:T.gold, color:"#0D0520", border:"none", borderRadius:6, fontFamily:T.heading, fontSize:10, textDecoration:"none", letterSpacing:1 }}>🛒 SHOP</Link>
      </div>

      <div style={{ maxWidth:680, margin:"0 auto", padding:"20px 16px" }}>

        {/* STATS */}
        <div style={{ fontFamily:T.display, fontSize:18, color:T.teal, letterSpacing:2, marginBottom:10 }}>MY STATS</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:20 }}>
          {[["850","POINTS",T.gold],["12","ROOMS JOINED",T.teal],["3","TICKETS",T.pink],["5","FOLLOWED ARTISTS",T.purple],["4","ACHIEVEMENTS",T.cyan],["#47","LEADERBOARD",T.amber]].map(([v,l,c])=>(
            <div key={l} style={{ background:T.card, border:`1px solid ${c}33`, borderRadius:10, padding:12, textAlign:"center" }}>
              <div style={{ fontFamily:T.display, fontSize:26, color:c }}>{v}</div>
              <div style={{ fontFamily:T.heading, fontSize:8, color:T.text3, letterSpacing:1 }}>{l}</div>
            </div>
          ))}
        </div>

        {/* QUICK LINKS */}
        <div style={{ fontFamily:T.display, fontSize:18, color:T.teal, letterSpacing:2, marginBottom:10 }}>QUICK ACCESS</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:8, marginBottom:20 }}>
          {[["🎫","My Tickets","/tickets",T.pink],["💰","My Wallet","/wallet",T.gold],["👑","Points & Rewards","/rewards",T.purple],["🎯","Achievements","/achievements",T.cyan],["❤️","Following","/following",T.pink],["💬","Messages","/messages",T.teal]].map(([icon,label,href,color])=>(
            <Link href={href as string} key={label as string} style={{ textDecoration:"none" }}>
              <div style={{ background:T.card, border:`1px solid ${color as string}44`, borderRadius:10, padding:14, display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:20 }}>{icon}</span>
                <div style={{ fontFamily:T.heading, fontSize:11, color:color as string }}>{label}</div>
                <div style={{ flex:1 }} />
                <span style={{ color:T.text3 }}>→</span>
              </div>
            </Link>
          ))}
        </div>

        {/* LIVE NOW */}
        <div style={{ fontFamily:T.display, fontSize:18, color:T.pink, letterSpacing:2, marginBottom:10 }}>LIVE NOW</div>
        <div style={{ background:T.card, border:`2px solid ${T.pink}`, borderRadius:12, padding:16, display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
          <div style={{ width:56, height:56, borderRadius:8, background:`linear-gradient(135deg,${T.purple}66,${T.raised})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:28 }}>🎤</div>
          <div>
            <div style={{ fontFamily:T.heading, fontSize:12, color:T.text, marginBottom:2 }}>Crown Holder is LIVE</div>
            <div style={{ fontFamily:T.heading, fontSize:9, color:T.text3 }}>847 viewers · Cypher</div>
          </div>
          <div style={{ flex:1 }} />
          <Link href="/live/crown-holder" style={{ padding:"8px 16px", background:T.pink, color:T.text, borderRadius:6, fontFamily:T.heading, fontSize:10, textDecoration:"none", letterSpacing:1, boxShadow:`0 0 12px ${T.pink}44` }}>JOIN →</Link>
        </div>

      </div>
    </div>
  );
}
