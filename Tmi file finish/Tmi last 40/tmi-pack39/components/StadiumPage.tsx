// apps/web/src/app/stadium/page.tsx
// The VR Stadium entry page — biggest experience on the platform.

"use client";
import Link from "next/link";

const T = { void:"#0D0520", deep:"#150830", card:"#1E0D3E", raised:"#2A1452", gold:"#FFB800", pink:"#FF2D78", cyan:"#00E5FF", purple:"#7B2FBE", text:"#fff", text2:"#C8A8E8", text3:"#7A5F9A", display:"'Bebas Neue',Impact,sans-serif", heading:"'Oswald',sans-serif" };

export default function StadiumPage() {
  return (
    <div style={{ background:T.void, minHeight:"100vh", color:T.text, fontFamily:"Inter,sans-serif" }}>

      {/* Hero */}
      <div style={{ background:`linear-gradient(to bottom, #000010, ${T.void})`, padding:"64px 32px 48px", textAlign:"center", borderBottom:`2px solid ${T.gold}`, position:"relative", overflow:"hidden" }}>
        {/* Stars background */}
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 50% 30%, #1a0030 0%, transparent 70%)" }} />
        <div style={{ position:"relative", zIndex:1 }}>
          <div style={{ fontFamily:T.heading, fontSize:11, color:T.gold, letterSpacing:5, marginBottom:8 }}>THE MUSICIAN&apos;S INDEX PRESENTS</div>
          <h1 style={{ fontFamily:T.display, fontSize:96, color:T.gold, letterSpacing:6, margin:"0 0 4px", lineHeight:0.9, textShadow:`0 0 40px ${T.gold}88` }}>STADIUM</h1>
          <h2 style={{ fontFamily:T.display, fontSize:28, color:T.pink, letterSpacing:4, margin:"0 0 20px" }}>THE BIGGEST SHOW ON THE PLATFORM</h2>

          <div style={{ fontFamily:T.heading, fontSize:14, color:T.text2, maxWidth:600, margin:"0 auto 32px", lineHeight:1.8 }}>
            10,000+ avatar crowd. Live concerts. VIP boxes. Sponsor boards. Merch booths. Fireworks. Works on Meta Quest, PSVR2, Apple Vision Pro, SteamVR, and your browser.
          </div>

          <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
            <Link href="/stadium/enter" style={{ padding:"14px 32px", background:T.gold, color:T.void, borderRadius:8, fontFamily:T.display, fontSize:22, letterSpacing:2, textDecoration:"none", boxShadow:`0 0 30px ${T.gold}66` }}>
              🥽 ENTER STADIUM
            </Link>
            <Link href="/events" style={{ padding:"14px 32px", border:`2px solid ${T.gold}`, color:T.gold, borderRadius:8, fontFamily:T.display, fontSize:22, letterSpacing:2, textDecoration:"none" }}>
              🗓️ UPCOMING SHOWS
            </Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:960, margin:"0 auto", padding:"40px 32px" }}>

        {/* What's inside */}
        <div style={{ marginBottom:40 }}>
          <div style={{ fontFamily:T.display, fontSize:28, color:T.gold, letterSpacing:3, marginBottom:20, textAlign:"center" }}>WHAT&apos;S INSIDE</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:14 }}>
            {[["🎤","Main Stage","Live artist performance on a massive stage"],["👑","VIP Boxes","Private elevated boxes for VIP ticket holders"],["🏪","Merch Concourse","Browse and buy merch without leaving your seat"],["📢","Sponsor Boards","Giant rotating sponsor billboards"],["🎆","Fireworks","Triggered on wins, crowns, and special moments"],["🎥","Camera Switches","Host switches POV — stage, crowd, overhead"],["💰","Tip Jar","Tip the artist from your seat"],["🌊","Crowd Wave","Interactive crowd animation — everyone moves together"]].map(([icon, label, desc]) => (
              <div key={label} style={{ background:T.card, border:`1px solid rgba(255,184,0,0.2)`, borderRadius:10, padding:16, textAlign:"center" }}>
                <div style={{ fontSize:28, marginBottom:8 }}>{icon}</div>
                <div style={{ fontFamily:T.heading, fontSize:11, color:T.gold, letterSpacing:1, marginBottom:4 }}>{label}</div>
                <div style={{ fontSize:10, color:T.text2, lineHeight:1.5 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div style={{ background:T.card, border:`1px solid rgba(255,184,0,0.3)`, borderRadius:12, padding:24, marginBottom:32 }}>
          <div style={{ fontFamily:T.display, fontSize:22, color:T.gold, letterSpacing:2, marginBottom:16 }}>SEATING SECTIONS</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:10 }}>
            {[["GENERAL","Floor level, standing","1.0×",T.cyan],["RESERVED","Numbered seats, great view","1.5×",T.purple],["VIP","Premium elevated, catering","2.5×",T.gold],["SPONSOR BOX","Private box suite","10×",T.pink]].map(([type, desc, mult, color]) => (
              <div key={type} style={{ background:T.raised, border:`1px solid ${color}44`, borderRadius:8, padding:12, textAlign:"center" }}>
                <div style={{ fontFamily:T.heading, fontSize:11, color, letterSpacing:1, marginBottom:4 }}>{type}</div>
                <div style={{ fontSize:10, color:T.text2, marginBottom:6 }}>{desc}</div>
                <div style={{ fontFamily:T.display, fontSize:18, color }}>{mult}</div>
                <div style={{ fontSize:9, color:T.text3 }}>price multiplier</div>
              </div>
            ))}
          </div>
        </div>

        {/* Device compatibility */}
        <div style={{ background:T.card, border:`1px solid rgba(0,229,255,0.3)`, borderRadius:12, padding:24 }}>
          <div style={{ fontFamily:T.display, fontSize:22, color:T.cyan, letterSpacing:2, marginBottom:16 }}>WORKS ON EVERY DEVICE</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:12 }}>
            {[["🥽","Meta Quest","Full VR — Recommended"],["🎮","PSVR2","Full VR via browser"],["👁️","Apple Vision Pro","Immersive + AR passthrough"],["🖥️","SteamVR","Full PC VR"],["💻","Desktop","3D mouse-look mode"],["📱","Mobile","Gyroscope mode"],["📺","TV","Watch mode (no VR)"],["🌐","Any Browser","2D audience view"]].map(([icon, device, mode]) => (
              <div key={device} style={{ background:T.raised, borderRadius:8, padding:10, textAlign:"center" }}>
                <div style={{ fontSize:24, marginBottom:4 }}>{icon}</div>
                <div style={{ fontFamily:T.heading, fontSize:11, color:T.cyan, marginBottom:2 }}>{device}</div>
                <div style={{ fontSize:10, color:T.text3 }}>{mode}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
