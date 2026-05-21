// apps/web/src/app/lobby/page.tsx — HOME 3: Live World
"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

const T = { bg:"#0D0520",card:"#1E0D3E",raised:"#2A1452",gold:"#FFB800",teal:"#00B8A9",pink:"#FF2D78",purple:"#7B2FBE",cyan:"#00E5FF",amber:"#FF8C00",text:"#fff",text2:"#C8A8E8",text3:"#7A5F9A",display:"'Bebas Neue',Impact,sans-serif",heading:"'Oswald',sans-serif" };

const LOBBY_ROOMS = [
  { id:"r1", host:"Crown Holder", viewers:0,  isLive:true,  genre:"Cypher"  }, // 0 viewers = position 1 (LAW #1)
  { id:"r2", host:"Jazz & More",  viewers:2,  isLive:true,  genre:"Jazz"    },
  { id:"r3", host:"Beat Lab",     viewers:4,  isLive:true,  genre:"Hip Hop" },
  { id:"r4", host:"Neon Nights",  viewers:6,  isLive:true,  genre:"R&B"     },
  { id:"r5", host:"Static FM",    viewers:9,  isLive:true,  genre:"Electronic"},
  { id:"r6", host:"Blue Groove",  viewers:12, isLive:true,  genre:"Soul"    },
  { id:"r7", host:"Verse Kings",  viewers:17, isLive:false, genre:"Rap"     },
  { id:"r8", host:"Open Stage",   viewers:23, isLive:true,  genre:"Pop"     },
];

export default function Home3LiveWorld() {
  const [countdown, setCountdown] = useState({ h:1, m:14, s:32 });
  useEffect(() => {
    const id = setInterval(() => {
      setCountdown(c => {
        if (c.s > 0) return {...c, s:c.s-1};
        if (c.m > 0) return {...c, m:c.m-1, s:59};
        if (c.h > 0) return {h:c.h-1, m:59, s:59};
        return c;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ background:T.bg, minHeight:"100vh", color:T.text, fontFamily:"Inter,sans-serif" }}>

      {/* TOP NAV — same as Home 2 */}
      <div style={{ background:"#150830", borderBottom:`1px solid ${T.gold}33`, padding:"10px 20px", display:"flex", alignItems:"center", gap:12, position:"sticky", top:0, zIndex:100 }}>
        <div style={{ fontFamily:T.display, fontSize:16, color:T.gold, letterSpacing:2, lineHeight:1 }}>THE<br/>MUSICIAN'S<br/>INDEX</div>
        <div style={{ width:1, height:40, background:T.text3 }} />
        <div><div style={{ fontFamily:T.heading, fontSize:8, color:T.text3 }}>ISSUE:</div><div style={{ fontFamily:T.display, fontSize:16, color:T.pink }}>CURRENT WEEK</div></div>
        <div style={{ width:1, height:40, background:T.text3 }} />
        <div><div style={{ fontFamily:T.heading, fontSize:8, color:T.text3 }}>WEEKLY CROWN WINNER</div>
          <div style={{ display:"flex", alignItems:"center", gap:4 }}>
            <span style={{ fontFamily:T.heading, fontSize:12, color:T.text2 }}>Glows</span>
            <div style={{ background:T.gold, borderRadius:99, padding:"2px 8px", fontFamily:T.display, fontSize:13, color:"#0D0520", boxShadow:`0 0 10px ${T.gold}88` }}>CROWN</div>
          </div>
        </div>
        <div style={{ flex:1 }} />
        {["🔍","🔔","👤"].map((ic,i)=><div key={i} style={{ width:36,height:36,borderRadius:"50%",background:T.raised,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:16 }}>{ic}</div>)}
      </div>

      <div style={{ maxWidth:680, margin:"0 auto", padding:"0 16px" }}>

        {/* LIVE WORLD ACTIVITY BELT */}
        <div style={{ display:"flex", alignItems:"center", gap:10, margin:"16px 0 10px" }}>
          <span style={{ fontSize:16 }}>⚡</span>
          <div style={{ fontFamily:T.display, fontSize:20, color:T.gold, letterSpacing:2 }}>LIVE WORLD (ACTIVITY BELT)</div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1.4fr 1fr", gap:10, marginBottom:10 }}>
          {/* Main Preview Lobby */}
          <div style={{ background:T.card, border:`2px solid ${T.teal}`, borderRadius:12, overflow:"hidden", position:"relative" }}>
            <div style={{ width:"100%", height:140, background:`linear-gradient(135deg, ${T.purple}88, ${T.raised})`, display:"flex", alignItems:"center", justifyContent:"center", position:"relative" }}>
              <div style={{ fontSize:60 }}>🎤</div>
              <div style={{ position:"absolute", top:8, left:8, background:T.pink, borderRadius:99, padding:"3px 8px", fontFamily:T.heading, fontSize:9, letterSpacing:1, display:"flex", alignItems:"center", gap:3 }}>
                <span style={{ width:5,height:5,borderRadius:"50%",background:"#fff",display:"inline-block" }} />LIVE
              </div>
            </div>
            <div style={{ padding:10 }}>
              <div style={{ background:T.gold, borderRadius:4, padding:"2px 8px", display:"inline-block", fontFamily:T.heading, fontSize:8, color:"#0D0520", marginBottom:4 }}>MAIN PREVIEW LOBBY</div>
              <div style={{ fontFamily:T.heading, fontSize:11, color:T.text }}>Crown Holder — Live Now</div>
            </div>
          </div>

          {/* Lobby Wall — discovery-first sorted */}
          <div style={{ background:T.card, border:`1px solid ${T.gold}44`, borderRadius:12, padding:8 }}>
            <div style={{ fontFamily:T.heading, fontSize:9, color:T.gold, letterSpacing:1, marginBottom:6 }}>LOBBY WALL</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:4 }}>
              {LOBBY_ROOMS.slice(0,8).map((r,i) => (
                <Link href={`/live/${r.id}`} key={r.id} style={{ textDecoration:"none" }}>
                  <div style={{ background:T.raised, borderRadius:6, padding:4, position:"relative", height:50, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <div style={{ fontSize:18 }}>🎵</div>
                    {r.isLive && <div style={{ position:"absolute", top:3, left:3, background:T.pink, borderRadius:99, padding:"1px 4px", fontFamily:T.heading, fontSize:6, letterSpacing:0.5 }}>LIVE</div>}
                    <div style={{ position:"absolute", bottom:3, right:3, fontFamily:T.heading, fontSize:7, color:T.text3 }}>{r.viewers}👁</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* JOIN RANDOM ROOM */}
        <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:16 }}>
          <Link href="/live/random" style={{ textDecoration:"none" }}>
            <div style={{ background:`linear-gradient(135deg, ${T.pink}, ${T.purple})`, borderRadius:8, padding:"12px 20px", display:"flex", alignItems:"center", gap:8, boxShadow:`0 0 20px ${T.pink}44` }}>
              <span style={{ fontSize:20 }}>⭐</span>
              <div>
                <div style={{ fontFamily:T.display, fontSize:18, color:T.text, letterSpacing:2 }}>JOIN</div>
                <div style={{ fontFamily:T.display, fontSize:18, color:T.text, letterSpacing:2 }}>RANDOM</div>
                <div style={{ fontFamily:T.display, fontSize:18, color:T.text, letterSpacing:2 }}>ROOM</div>
              </div>
              <div style={{ fontFamily:T.display, fontSize:32, color:T.gold }}>6</div>
            </div>
          </Link>
        </div>

        {/* DISCOVERY BELT — Trends & Events */}
        <div style={{ display:"flex", alignItems:"center", gap:10, margin:"0 0 10px" }}>
          <span style={{ fontSize:16 }}>⚡</span>
          <div style={{ fontFamily:T.display, fontSize:20, color:T.teal, letterSpacing:2 }}>DISCOVERY BELT (TRENDS & EVENTS)</div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1.2fr 1fr", gap:10, marginBottom:10 }}>
          {/* World Premieres Countdown */}
          <div style={{ background:T.card, border:`1px solid ${T.teal}44`, borderRadius:10, padding:14 }}>
            <div style={{ background:T.teal, borderRadius:4, padding:"2px 8px", display:"inline-block", fontFamily:T.heading, fontSize:8, color:"#0D0520", letterSpacing:1, marginBottom:8 }}>WORLD PREMIERES</div>
            <div style={{ fontFamily:T.heading, fontSize:10, color:T.text2, marginBottom:4 }}>An upcoming exclusive drop</div>
            <div style={{ fontFamily:T.display, fontSize:28, color:T.gold, letterSpacing:2 }}>
              {String(countdown.h).padStart(2,"0")}:{String(countdown.m).padStart(2,"0")}:{String(countdown.s).padStart(2,"0")}:05
            </div>
            <div style={{ width:"100%", height:4, background:T.raised, borderRadius:2, marginTop:8 }}>
              <div style={{ width:"60%", height:"100%", background:`linear-gradient(90deg, ${T.teal}, ${T.gold})`, borderRadius:2 }} />
            </div>
            <div style={{ fontFamily:T.heading, fontSize:9, color:T.text3, marginTop:4 }}>NEW TRACK — MAIN TRACK CONT.</div>
          </div>
          {/* Event Calendar */}
          <div style={{ background:T.card, border:`1px solid ${T.purple}44`, borderRadius:10, padding:12 }}>
            <div style={{ background:T.purple, borderRadius:4, padding:"2px 8px", display:"inline-block", fontFamily:T.heading, fontSize:8, color:T.text, letterSpacing:1, marginBottom:8 }}>EVENT CALENDAR</div>
            <div style={{ fontFamily:T.heading, fontSize:9, color:T.text2, marginBottom:8 }}>Scheduled concerts and listening parties</div>
            {[["Concerts",T.pink],["Saturday",T.teal],["Wednesday",T.purple]].map(([label,color])=>(
              <div key={label} style={{ display:"flex", alignItems:"center", gap:6, padding:"4px 0", borderBottom:`1px solid ${T.text3}22` }}>
                <div style={{ width:8, height:8, borderRadius:2, background:color, flexShrink:0 }} />
                <div style={{ fontFamily:T.heading, fontSize:10, color:T.text2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* UNDISCOVERED BOOST + CYPHER ARENA */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:10 }}>
          <div style={{ background:T.card, border:`2px solid ${T.teal}`, borderRadius:10, padding:12 }}>
            <div style={{ background:T.teal, borderRadius:4, padding:"2px 8px", display:"inline-block", fontFamily:T.heading, fontSize:8, color:"#0D0520", letterSpacing:1, marginBottom:8 }}>UNDISCOVERED BOOST</div>
            <div style={{ width:44,height:44,borderRadius:"50%",background:`linear-gradient(135deg,${T.teal}44,${T.raised})`,border:`2px solid ${T.teal}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,marginBottom:6 }}>🎤</div>
            <div style={{ fontFamily:T.heading, fontSize:10, color:T.text }}>New Artist of the Day!</div>
          </div>
          <div style={{ background:T.card, border:`1px solid ${T.purple}44`, borderRadius:10, padding:12, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
            <div style={{ fontFamily:T.display, fontSize:22, color:T.purple, marginBottom:4 }}>GATEWAY</div>
            <div style={{ width:40,height:40,background:`linear-gradient(135deg,${T.purple}44,${T.raised})`,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20 }}>🎮</div>
          </div>
          <div style={{ background:T.card, border:`1px solid ${T.gold}44`, borderRadius:10, padding:12 }}>
            <div style={{ fontFamily:T.display, fontSize:14, color:T.gold, letterSpacing:1 }}>CYPHER ARENA</div>
            <div style={{ fontFamily:T.heading, fontSize:9, color:T.text2, lineHeight:1.4 }}>Go to active 1v1 battle rooms</div>
            <Link href="/cypher" style={{ fontFamily:T.heading, fontSize:9, color:T.gold }}>→ Enter</Link>
          </div>
        </div>

        {/* STREAM & WIN */}
        <div style={{ background:T.card, border:`2px solid ${T.pink}`, borderRadius:10, padding:14, display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
          <div>
            <div style={{ fontFamily:T.display, fontSize:18, color:T.text, letterSpacing:2 }}>STREAM &amp; WIN</div>
            <div style={{ fontFamily:T.heading, fontSize:10, color:T.text2 }}>Score: 0:50</div>
          </div>
          <div style={{ fontFamily:T.display, fontSize:36, color:T.pink }}>5</div>
          <div style={{ fontFamily:T.display, fontSize:36, color:T.teal }}>3</div>
          <Link href="/live" style={{ padding:"8px 16px", background:T.pink, color:T.text, border:"none", borderRadius:6, fontFamily:T.heading, fontSize:11, textDecoration:"none", letterSpacing:1 }}>PLAY NOW</Link>
        </div>

        {/* World Switcher */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:6, marginBottom:24 }}>
          {[["1","Magazine","/",T.text3],["2","Editorial","/editorial",T.text3],["3","Live World","#",T.gold],["4","Sponsors","/advertise",T.text3]].map(([n,label,href,color])=>(
            <Link href={href} key={n} style={{ textDecoration:"none" }}>
              <div style={{ background:n==="3"?`${T.gold}22`:T.raised, border:`2px solid ${n==="3"?T.gold:T.text3}44`, borderRadius:8, padding:"8px 4px", textAlign:"center" }}>
                <div style={{ fontFamily:T.display, fontSize:24, color, lineHeight:1 }}>{n}</div>
                <div style={{ fontFamily:T.heading, fontSize:8, color, letterSpacing:1 }}>{label}</div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
