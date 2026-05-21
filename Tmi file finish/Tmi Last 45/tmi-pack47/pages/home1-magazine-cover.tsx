// apps/web/src/app/page.tsx  — HOME 1: The Magazine Cover
// Visual spec: purple/teal/gold, 3x3 artist collage, crown winner center, Weekly Cyphers
"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

const T = {
  bg: "#120824", deep: "#0D0520", card: "#1E0D3E", raised: "#2A1452",
  gold: "#FFB800", teal: "#00B8A9", pink: "#FF2D78", purple: "#7B2FBE",
  cyan: "#00E5FF", amber: "#FF8C00", text: "#fff", text2: "#C8A8E8",
  text3: "#7A5F9A", display: "'Bebas Neue',Impact,sans-serif",
  heading: "'Oswald',sans-serif",
};

// Discovery-first: slot 1 = 0 viewers, slot 2-9 = ranked by viewerCount ASC
const MOCK_ARTISTS = [
  { pos:2, name:"Verse Theory",   genre:"Hip Hop",  viewers:0,   isLive:true,  color:T.teal   },
  { pos:6, name:"Nova Sounds",    genre:"R&B",      viewers:1,   isLive:true,  color:T.purple },
  { pos:4, name:"Blue Marlin",    genre:"Jazz",     viewers:3,   isLive:false, color:T.amber  },
  { pos:5, name:"Static Glitch",  genre:"Electronic",viewers:5,  isLive:true,  color:T.pink   },
  { pos:1, name:"Crown Holder",   genre:"Cypher",   viewers:null,isLive:true,  color:T.gold, isCrown:true },
  { pos:7, name:"Ruby Daze",      genre:"Pop",      viewers:8,   isLive:true,  color:T.cyan   },
  { pos:3, name:"Low Bass",       genre:"Reggae",   viewers:12,  isLive:false, color:T.teal   },
  { pos:6, name:"Silk Road",      genre:"Soul",     viewers:18,  isLive:true,  color:T.purple },
  { pos:8, name:"Neon Prophet",   genre:"Rap",      viewers:22,  isLive:true,  color:T.pink   },
];

function LightningBolt({ style }: { style: React.CSSProperties }) {
  return <div style={{ position:"absolute", fontSize:20, opacity:0.5, ...style }}>⚡</div>;
}
function Triangle({ style }: { style: React.CSSProperties }) {
  return <div style={{ position:"absolute", width:0, height:0, opacity:0.5, ...style }} />;
}

export default function Home1MagazineCover() {
  const [tick, setTick] = useState(0);
  useEffect(() => { const id = setInterval(() => setTick(t => t+1), 3000); return () => clearInterval(id); }, []);

  return (
    <div style={{ background:`linear-gradient(160deg, ${T.bg} 0%, #1A0835 50%, ${T.deep} 100%)`, minHeight:"100vh", color:T.text, fontFamily:"Inter,sans-serif", overflow:"hidden", position:"relative" }}>

      {/* Decorative background elements */}
      <LightningBolt style={{ top:60,  left:30,  transform:"rotate(-20deg)", color:T.gold  }} />
      <LightningBolt style={{ top:140, right:40, transform:"rotate(15deg)",  color:T.teal  }} />
      <LightningBolt style={{ top:300, left:60,  transform:"rotate(-10deg)", color:T.pink  }} />
      <LightningBolt style={{ bottom:200, right:80, color:T.gold }} />
      <div style={{ position:"absolute", top:0, left:0, right:0, height:4, background:`linear-gradient(90deg, ${T.gold}, ${T.teal}, ${T.pink}, ${T.gold})` }} />

      <div style={{ maxWidth:480, margin:"0 auto", padding:"0 16px" }}>

        {/* MASTHEAD */}
        <div style={{ textAlign:"center", padding:"20px 0 8px", position:"relative" }}>
          <div style={{ background:`linear-gradient(135deg, ${T.purple}, ${T.deep})`, borderRadius:16, padding:"16px 24px", border:`2px solid ${T.gold}`, boxShadow:`0 0 30px ${T.gold}44` }}>
            <div style={{ fontFamily:T.heading, fontSize:10, color:T.teal, letterSpacing:3, marginBottom:2 }}>ISSUE: CURRENT WEEK</div>
            <div style={{ fontFamily:T.display, fontSize:42, color:T.gold, letterSpacing:3, lineHeight:0.9, textShadow:`0 0 20px ${T.gold}88` }}>THE</div>
            <div style={{ fontFamily:T.display, fontSize:38, color:T.text, letterSpacing:2, lineHeight:1 }}>MUSICIAN'S</div>
            <div style={{ fontFamily:T.display, fontSize:52, color:T.teal, letterSpacing:4, lineHeight:0.9, textShadow:`0 0 20px ${T.teal}88` }}>INDEX</div>
            <div style={{ height:2, background:`linear-gradient(90deg, transparent, ${T.gold}, transparent)`, margin:"8px 0" }} />
            <div style={{ fontFamily:T.heading, fontSize:12, color:T.gold, letterSpacing:1 }}>WHO TOOK THE CROWN THIS WEEK?</div>
          </div>
        </div>

        {/* 3×3 PHOTO GRID */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:6, margin:"12px 0" }}>
          {MOCK_ARTISTS.map((a, i) => (
            <Link href={`/artists/${a.name.toLowerCase().replace(/ /g,"-")}`} key={i} style={{ textDecoration:"none" }}>
              <div style={{
                background: (a as any).isCrown
                  ? `linear-gradient(135deg, ${T.gold}33, ${T.purple})`
                  : `linear-gradient(135deg, ${a.color}22, ${T.deep})`,
                border: `2px solid ${(a as any).isCrown ? T.gold : a.color}`,
                boxShadow: (a as any).isCrown ? `0 0 20px ${T.gold}66` : `0 0 8px ${a.color}33`,
                borderRadius: 10, padding:10, textAlign:"center", position:"relative",
                aspectRatio: (a as any).isCrown ? "auto" : "0.85",
                display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                transform: (a as any).isCrown ? "scale(1.04)" : "scale(1)",
                transition:"transform 0.2s",
              }}>
                {/* Position number */}
                <div style={{ position:"absolute", top:6, left:8, fontFamily:T.display, fontSize:22, color:(a as any).isCrown ? T.gold : a.color, opacity:0.9, lineHeight:1 }}>{a.pos}</div>
                {/* LIVE badge */}
                {a.isLive && <div style={{ position:"absolute", top:6, right:6, background:T.pink, borderRadius:99, padding:"2px 6px", fontFamily:T.heading, fontSize:8, letterSpacing:1, display:"flex", alignItems:"center", gap:2 }}>
                  <span style={{ width:4, height:4, borderRadius:"50%", background:"#fff", display:"inline-block", animation:`pulse-${i} 1s infinite` }} />LIVE
                </div>}
                {/* Crown */}
                {(a as any).isCrown && <div style={{ fontSize:32, marginBottom:4 }}>👑</div>}
                {/* Avatar placeholder */}
                <div style={{ width:(a as any).isCrown?72:56, height:(a as any).isCrown?72:56, borderRadius:"50%", background:`linear-gradient(135deg, ${a.color}44, ${T.raised})`, border:`2px solid ${a.color}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:(a as any).isCrown?28:22, marginBottom:6 }}>🎤</div>
                <div style={{ fontFamily:T.heading, fontSize:(a as any).isCrown?12:10, color:T.text, letterSpacing:0.5, marginBottom:2 }}>{a.name}</div>
                <div style={{ fontFamily:T.heading, fontSize:8, color:a.color, letterSpacing:1 }}>{a.genre}</div>
                {a.viewers !== null && <div style={{ fontFamily:T.heading, fontSize:7, color:T.text3, marginTop:2 }}>{a.viewers}👁</div>}
              </div>
            </Link>
          ))}
        </div>

        {/* WEEKLY CYPHERS STAMP */}
        <div style={{ textAlign:"center", margin:"8px 0 16px", position:"relative" }}>
          <div style={{ display:"inline-block", background:`linear-gradient(135deg, ${T.gold}, ${T.amber})`, borderRadius:"50%", width:100, height:100, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", boxShadow:`0 0 24px ${T.gold}66`, border:`3px solid ${T.text}`, fontFamily:T.heading, color:T.void }}>
            <div style={{ fontSize:10, fontWeight:700, color:"#0D0520", letterSpacing:1 }}>WEEKLY</div>
            <div style={{ fontSize:16, fontWeight:900, color:"#0D0520" }}>CYPHERS!</div>
          </div>
          <div style={{ fontFamily:T.display, fontSize:18, color:T.gold, letterSpacing:2, marginTop:6 }}>
            WHO TOOK THE CROWN THIS WEEK?
          </div>
        </div>

        {/* LIVE TICKER */}
        <div style={{ background:T.card, border:`1px solid ${T.teal}44`, borderRadius:8, padding:"8px 14px", display:"flex", alignItems:"center", gap:8, overflow:"hidden", marginBottom:20 }}>
          <div style={{ background:T.pink, borderRadius:99, padding:"2px 8px", fontFamily:T.heading, fontSize:9, letterSpacing:1, whiteSpace:"nowrap", flexShrink:0 }}>● LIVE</div>
          <div style={{ fontFamily:T.heading, fontSize:10, color:T.teal, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
            Crown Holder is LIVE now · Verse Theory joined · 3 new artists discovered · 847 fans online
          </div>
        </div>

        {/* WORLD SWITCHER */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:6, marginBottom:24 }}>
          {[["1","Magazine","#",T.gold],["2","Editorial","/editorial",T.teal],["3","Live World","/lobby",T.pink],["4","Sponsors","/advertise",T.purple]].map(([n,label,href,color]) => (
            <Link href={href} key={n} style={{ textDecoration:"none" }}>
              <div style={{ background:n==="1"?`${color}22`:T.raised, border:`2px solid ${n==="1"?color:T.text3}44`, borderRadius:8, padding:"8px 4px", textAlign:"center" }}>
                <div style={{ fontFamily:T.display, fontSize:24, color: n==="1" ? color : T.text3, lineHeight:1 }}>{n}</div>
                <div style={{ fontFamily:T.heading, fontSize:8, color: n==="1" ? color : T.text3, letterSpacing:1, marginTop:2 }}>{label}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* SATELLITE FOOTER */}
        <div style={{ fontFamily:T.heading, fontSize:8, color:T.text3, textAlign:"center", letterSpacing:1, paddingBottom:80 }}>
          THE MUSICIAN'S INDEX · CHICO_BASE: 39.7285°N 121.8375°W · SIGNAL: 100% · SECURE
        </div>
      </div>
    </div>
  );
}
