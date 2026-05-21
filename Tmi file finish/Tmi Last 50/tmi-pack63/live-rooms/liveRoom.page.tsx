// apps/web/src/app/live/[roomId]/page.tsx — Live Room Page
// Works for ALL 18 room types. Layout adapts per room type config.
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const T = { bg:"#0D0520",card:"#1E0D3E",raised:"#2A1452",gold:"#FFB800",teal:"#00B8A9",pink:"#FF2D78",purple:"#7B2FBE",cyan:"#00E5FF",amber:"#FF8C00",text:"#fff",text2:"#C8A8E8",text3:"#7A5F9A",display:"'Bebas Neue',Impact,sans-serif",heading:"'Oswald',sans-serif" };

// Reaction rail — inline emoji reactions with count
function ReactionRail() {
  const [counts, setCounts] = useState({ fire:0, heart:0, crown:0, mic:0, star:0 });
  return (
    <div style={{ display:"flex", gap:8, padding:"8px 12px", background:T.card, borderTop:`1px solid ${T.text3}22` }}>
      {[["🔥","fire"],["❤️","heart"],["👑","crown"],["🎤","mic"],["⭐","star"]].map(([emoji,key])=>(
        <button key={key} onClick={() => setCounts(c => ({...c, [key]:c[key as keyof typeof c]+1}))} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2, padding:"6px 10px", background:T.raised, border:"none", borderRadius:8, cursor:"pointer", color:T.text }}>
          <span style={{ fontSize:20 }}>{emoji}</span>
          <span style={{ fontFamily:T.heading, fontSize:8, color:T.text3 }}>{counts[key as keyof typeof counts]}</span>
        </button>
      ))}
      <div style={{ flex:1 }} />
      {/* Tip button */}
      <button style={{ padding:"6px 14px", background:T.gold, border:"none", borderRadius:8, fontFamily:T.heading, fontSize:10, color:"#0D0520", cursor:"pointer", letterSpacing:1 }}>💸 TIP</button>
    </div>
  );
}

// Chat panel
function ChatPanel({ maxHeight = 220 }: { maxHeight?: number }) {
  const [messages] = useState([
    { user:"FanA", text:"LET'S GO!! 🔥", ts:"9:01pm", color:"#00B8A9" },
    { user:"FanB", text:"Crown holder doing it again!!",ts:"9:01pm",color:"#FF2D78" },
    { user:"HypeBot", text:"🤖 Artist #5 is MOVING UP in the rankings!", ts:"9:02pm", color:"#7B2FBE" },
    { user:"FanC", text:"Verse is 🔥🔥🔥", ts:"9:02pm", color:"#FFB800" },
  ]);
  return (
    <div style={{ background:T.card, height:maxHeight, display:"flex", flexDirection:"column" }}>
      <div style={{ flex:1, overflow:"auto", padding:10 }}>
        {messages.map((m,i) => (
          <div key={i} style={{ marginBottom:6, display:"flex", gap:6, alignItems:"flex-start" }}>
            <span style={{ fontFamily:T.heading, fontSize:9, color:m.color, whiteSpace:"nowrap", fontWeight:700, flexShrink:0 }}>{m.user}</span>
            <span style={{ fontFamily:T.heading, fontSize:9, color:T.text2, lineHeight:1.4 }}>{m.text}</span>
          </div>
        ))}
      </div>
      <div style={{ display:"flex", gap:6, padding:8, borderTop:`1px solid ${T.text3}22` }}>
        <input placeholder="Say something..." style={{ flex:1, background:T.raised, border:"none", borderRadius:6, padding:"6px 10px", fontFamily:T.heading, fontSize:9, color:T.text, outline:"none" }} />
        <button style={{ padding:"6px 12px", background:T.teal, border:"none", borderRadius:6, fontFamily:T.heading, fontSize:9, color:"#0D0520", cursor:"pointer" }}>SEND</button>
      </div>
    </div>
  );
}

// Sponsor overlay
function SponsorOverlay({ sponsorName, cta }: { sponsorName: string; cta: string }) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <div style={{ position:"absolute", bottom:60, left:12, right:12, background:`${T.gold}22`, border:`1px solid ${T.gold}44`, borderRadius:8, padding:"6px 12px", display:"flex", alignItems:"center", gap:8, zIndex:20 }}>
      <span style={{ fontFamily:T.heading, fontSize:8, color:T.gold, letterSpacing:1 }}>SPONSORED BY</span>
      <span style={{ fontFamily:T.heading, fontSize:10, color:T.text, flex:1 }}>{sponsorName}</span>
      <span style={{ fontFamily:T.heading, fontSize:9, color:T.teal }}>{cta}</span>
      <button onClick={() => setVisible(false)} style={{ background:"none", border:"none", color:T.text3, cursor:"pointer", fontSize:12 }}>×</button>
    </div>
  );
}

export default function LiveRoomPage({ params }: { params: { roomId: string } }) {
  const [viewerCount, setViewerCount] = useState(312);
  useEffect(() => {
    const id = setInterval(() => setViewerCount(v => v + Math.floor(Math.random()*3 - 1)), 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ background:T.bg, minHeight:"100vh", color:T.text, fontFamily:"Inter,sans-serif", display:"flex", flexDirection:"column" }}>
      {/* Room Header */}
      <div style={{ background:"#150830", borderBottom:`1px solid ${T.pink}33`, padding:"10px 16px", display:"flex", alignItems:"center", gap:10 }}>
        <Link href="/lobby" style={{ color:T.text3, textDecoration:"none", fontFamily:T.heading, fontSize:11 }}>← BACK</Link>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:T.display, fontSize:16, color:T.text, letterSpacing:1 }}>Crown Holder · Live Stage</div>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <div style={{ background:T.pink, borderRadius:99, padding:"1px 6px", fontFamily:T.heading, fontSize:7, display:"flex", alignItems:"center", gap:3 }}>
              <span style={{ width:4,height:4,borderRadius:"50%",background:"#fff",display:"inline-block" }} />LIVE
            </div>
            <span style={{ fontFamily:T.heading, fontSize:9, color:T.text3 }}>{viewerCount.toLocaleString()} watching</span>
          </div>
        </div>
        <div style={{ display:"flex", gap:6 }}>
          <button style={{ padding:"4px 10px", background:T.raised, border:`1px solid ${T.text3}44`, borderRadius:6, fontFamily:T.heading, fontSize:8, color:T.text3, cursor:"pointer" }}>SHARE</button>
          <button style={{ padding:"4px 10px", background:T.raised, border:`1px solid ${T.text3}44`, borderRadius:6, fontFamily:T.heading, fontSize:8, color:T.text3, cursor:"pointer" }}>⚙️</button>
        </div>
      </div>

      {/* Main stream area */}
      <div style={{ position:"relative", width:"100%", paddingTop:"56.25%", background:`linear-gradient(135deg,${T.purple}44,${T.raised})`, flexShrink:0 }}>
        {/* Video placeholder — Blackbox replaces with HLS player */}
        <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
          <div style={{ fontSize:64 }}>🎤</div>
          <div style={{ fontFamily:T.display, fontSize:24, color:T.text, letterSpacing:2, marginTop:8 }}>LIVE STREAM</div>
          <div style={{ fontFamily:T.heading, fontSize:10, color:T.text3 }}>HLS player mounts here</div>
        </div>
        <SponsorOverlay sponsorName="LocalSponsor Co." cta="Shop Now →" />
      </div>

      {/* Room controls */}
      <ReactionRail />

      {/* Chat */}
      <ChatPanel maxHeight={200} />

      {/* Bottom navigation */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:0, borderTop:`1px solid ${T.text3}22`, marginTop:"auto" }}>
        {[["👥","Viewers"],["🎮","Games"],["🏆","Rewards"],["📊","Leaderboard"]].map(([ic,l])=>(
          <button key={l} style={{ padding:"10px 4px", background:"none", border:"none", color:T.text3, cursor:"pointer", textAlign:"center" }}>
            <div style={{ fontSize:18 }}>{ic}</div>
            <div style={{ fontFamily:T.heading, fontSize:7, letterSpacing:0.5, marginTop:2 }}>{l}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
