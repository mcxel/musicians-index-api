// apps/web/src/app/page.tsx — HOME 1: Magazine Cover (LIVE VOTING STATE)
// Matches Tmi_Homepage_1.jpg exactly: voting badges, hype bot, crown updating
"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

const T = { bg:"#120824",card:"#1E0D3E",raised:"#2A1452",gold:"#FFB800",teal:"#00B8A9",pink:"#FF2D78",purple:"#7B2FBE",cyan:"#00E5FF",amber:"#FF8C00",text:"#fff",text2:"#C8A8E8",text3:"#7A5F9A",display:"'Bebas Neue',Impact,sans-serif",heading:"'Oswald',sans-serif" };

const ARTISTS = [
  { pos:2, name:"Nova Wave",    genre:"Hip Hop",  battle:"HIP HOP GENRE BATTLE!", votes:0,  badge:"star",   color:T.teal,   isCrown:false, votingOpen:false },
  { pos:6, name:"Sky Keys",    genre:"R&B",      battle:null,                     votes:14, badge:null,     color:T.purple, isCrown:false, votingOpen:false },
  { pos:4, name:"Blaze Corp",  genre:"Hip Hop",  battle:null,                     votes:8,  badge:"hex",    color:T.amber,  isCrown:false, votingOpen:true  },
  { pos:5, name:"Static FM",   genre:"Electronic",battle:"HIP HOP GENRE BATTLE!", votes:22, badge:null,     color:T.pink,   isCrown:false, votingOpen:false },
  { pos:1, name:"Crown Holder",genre:"Cypher",   battle:null,                     votes:null,badge:"crown", color:T.gold,   isCrown:true,  votingOpen:false },
  { pos:7, name:"Verse Kings", genre:"Rap",      battle:null,                     votes:19, badge:"star",   color:T.cyan,   isCrown:false, votingOpen:true  },
  { pos:3, name:"Deep Roots",  genre:"Jazz",     battle:null,                     votes:5,  badge:null,     color:T.teal,   isCrown:false, votingOpen:false },
  { pos:6, name:"Ruby Daze",   genre:"Soul",     battle:null,                     votes:31, badge:null,     color:T.purple, isCrown:false, votingOpen:false },
  { pos:8, name:"Neon Prophet",genre:"Rap",      battle:null,                     votes:17, badge:null,     color:T.pink,   isCrown:false, votingOpen:false },
];

export default function Home1LiveVoting() {
  const [crownVotes, setCrownVotes] = useState(847);
  const [hypeMsg, setHypeMsg] = useState("HYPE BOT: ARTIST #5 MOVING UP!");
  const HYPE_MSGS = ["HYPE BOT: ARTIST #5 MOVING UP!", "CROWN UPDATING...", "VOTE FOR #4!", "GENRE BATTLE ACTIVE!"];
  useEffect(() => {
    const c = setInterval(() => setCrownVotes(v => v + Math.floor(Math.random()*3)), 2500);
    const h = setInterval(() => setHypeMsg(msgs => { const i = HYPE_MSGS.indexOf(msgs); return HYPE_MSGS[(i+1)%HYPE_MSGS.length]; }), 3000);
    return () => { clearInterval(c); clearInterval(h); };
  }, []);

  return (
    <div style={{ background:`linear-gradient(160deg,${T.bg},#1A0835,${T.bg})`, minHeight:"100vh", color:T.text, fontFamily:"Inter,sans-serif", overflow:"hidden", position:"relative" }}>
      {/* Top rainbow bar */}
      <div style={{ height:3, background:`linear-gradient(90deg,${T.gold},${T.teal},${T.pink},${T.purple},${T.gold})` }} />

      <div style={{ maxWidth:480, margin:"0 auto", padding:"0 16px" }}>

        {/* MASTHEAD */}
        <div style={{ textAlign:"center", padding:"16px 0 8px" }}>
          <div style={{ background:`linear-gradient(135deg,${T.purple},${T.raised})`, borderRadius:16, padding:"14px 20px", border:`2px solid ${T.gold}`, boxShadow:`0 0 24px ${T.gold}55` }}>
            <div style={{ display:"flex", justifyContent:"center", gap:20, marginBottom:4 }}>
              <div style={{ fontFamily:T.heading, fontSize:9, color:T.teal, letterSpacing:2, textAlign:"center" }}>WHO<br/>TOOK<br/>THE</div>
              <div>
                <div style={{ fontFamily:T.display, fontSize:34, color:T.gold, letterSpacing:3, lineHeight:0.9, textShadow:`0 0 16px ${T.gold}88` }}>MUSICIAN'S</div>
                <div style={{ fontFamily:T.display, fontSize:44, color:T.teal, letterSpacing:4, lineHeight:0.9, textShadow:`0 0 16px ${T.teal}88` }}>INDEX</div>
              </div>
            </div>
            {/* Live voting ticker */}
            <div style={{ display:"flex", alignItems:"center", gap:8, justifyContent:"center", margin:"8px 0" }}>
              <div style={{ background:T.pink, borderRadius:99, padding:"2px 8px", fontFamily:T.heading, fontSize:8, letterSpacing:1, display:"flex", alignItems:"center", gap:3 }}>
                <span style={{ width:5,height:5,borderRadius:"50%",background:"#fff",display:"inline-block",animation:"pulse 1s infinite" }} />VOTING LIVE!
              </div>
              <div style={{ fontFamily:T.heading, fontSize:8, color:T.gold, animation:"fade 2s infinite" }}>| CROWN UPDATING IN real-time...</div>
            </div>
            <div style={{ fontFamily:T.display, fontSize:14, color:T.gold, letterSpacing:2 }}>WHO TOOK THE CROWN THIS WEEK?</div>
          </div>
        </div>

        {/* 3×3 LIVE VOTING GRID */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:5, margin:"8px 0" }}>
          {ARTISTS.map((a, i) => (
            <div key={i} style={{
              background:(a as any).isCrown ? `linear-gradient(135deg,${T.gold}33,${T.purple})` : `linear-gradient(135deg,${a.color}22,${T.raised})`,
              border:`2px solid ${(a as any).isCrown ? T.gold : a.color}`,
              boxShadow:(a as any).isCrown ? `0 0 24px ${T.gold}66` : `0 0 8px ${a.color}33`,
              borderRadius:10, padding:8, textAlign:"center", position:"relative",
              transform:(a as any).isCrown ? "scale(1.05)" : "scale(1)",
            }}>
              {/* Position badge */}
              <div style={{ position:"absolute", top:5, left:6, fontFamily:T.display, fontSize:20, color:(a as any).isCrown?T.gold:a.color, lineHeight:1, opacity:0.9 }}>{a.pos}</div>
              {/* Genre battle badge */}
              {a.battle && <div style={{ position:"absolute", top:4, right:4, background:T.purple, borderRadius:4, padding:"1px 4px", fontFamily:T.heading, fontSize:5, color:T.cyan, letterSpacing:0.5, lineHeight:1.2, maxWidth:50, textAlign:"center" }}>{a.battle}</div>}
              {/* Voting open badge */}
              {a.votingOpen && <div style={{ position:"absolute", bottom:4, left:4, background:T.pink, borderRadius:4, padding:"1px 4px", fontFamily:T.heading, fontSize:5, color:"#fff", letterSpacing:0.5 }}>VOTE FOR #{a.pos}!</div>}
              {/* Avatar */}
              {(a as any).isCrown && <div style={{ fontSize:26, marginBottom:2 }}>👑</div>}
              <div style={{ width:(a as any).isCrown?64:48, height:(a as any).isCrown?64:48, borderRadius:"50%", background:`linear-gradient(135deg,${a.color}44,${T.raised})`, border:`2px solid ${a.color}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:(a as any).isCrown?24:18, margin:"0 auto 4px" }}>🎤</div>
              <div style={{ fontFamily:T.heading, fontSize:9, color:T.text, marginBottom:2, lineHeight:1 }}>{a.name}</div>
              <div style={{ fontFamily:T.heading, fontSize:7, color:a.color }}>{a.genre}</div>
              {a.votes !== null && <div style={{ fontFamily:T.display, fontSize:11, color:T.gold, marginTop:2 }}>{a.votes}{(a as any).isCrown && "+"}</div>}
              {/* Crown updates live */}
              {(a as any).isCrown && <div style={{ fontFamily:T.heading, fontSize:7, color:T.gold }}>{crownVotes} VOTES</div>}
            </div>
          ))}
        </div>

        {/* HYPE BOT TICKER */}
        <div style={{ background:T.card, border:`1px solid ${T.purple}44`, borderRadius:8, padding:"6px 12px", display:"flex", alignItems:"center", gap:6, overflow:"hidden", margin:"6px 0" }}>
          <div style={{ background:T.purple, borderRadius:99, padding:"1px 6px", fontFamily:T.heading, fontSize:8, letterSpacing:1, whiteSpace:"nowrap", flexShrink:0 }}>🤖 BOT</div>
          <div style={{ fontFamily:T.heading, fontSize:9, color:T.purple, whiteSpace:"nowrap" }}>{hypeMsg}</div>
        </div>

        {/* CYPHER ARENA OPEN + STREAM & WIN */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, margin:"6px 0" }}>
          <Link href="/cypher" style={{ textDecoration:"none" }}>
            <div style={{ background:`linear-gradient(135deg,${T.gold}22,${T.card})`, border:`2px solid ${T.gold}`, borderRadius:10, padding:12, textAlign:"center", boxShadow:`0 0 14px ${T.gold}44` }}>
              <div style={{ fontFamily:T.display, fontSize:14, color:T.gold, letterSpacing:2 }}>CYPHER ARENA</div>
              <div style={{ background:T.teal, borderRadius:4, padding:"2px 8px", display:"inline-block", fontFamily:T.heading, fontSize:8, color:"#0D0520", letterSpacing:1, marginTop:4 }}>OPEN</div>
            </div>
          </Link>
          <Link href="/live/stream-and-win" style={{ textDecoration:"none" }}>
            <div style={{ background:`linear-gradient(135deg,${T.pink}22,${T.card})`, border:`2px solid ${T.pink}`, borderRadius:10, padding:12, textAlign:"center" }}>
              <div style={{ fontFamily:T.display, fontSize:13, color:T.text, letterSpacing:1 }}>STREAM &amp; WIN</div>
              <div style={{ fontFamily:T.heading, fontSize:9, color:T.text2, marginTop:2 }}>Score: 0:50</div>
            </div>
          </Link>
        </div>

        {/* WEEKLY CYPHERS FOOTER */}
        <div style={{ background:`linear-gradient(90deg,${T.gold},${T.amber})`, borderRadius:10, padding:"12px 20px", textAlign:"center", margin:"8px 0" }}>
          <div style={{ fontFamily:T.display, fontSize:28, color:"#0D0520", letterSpacing:3, lineHeight:0.9 }}>Weekly Cyphers!</div>
          <div style={{ fontFamily:T.display, fontSize:16, color:"#0D0520", letterSpacing:2 }}>Who took the crown this week?</div>
        </div>

        {/* WORLD SWITCHER */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:5, marginBottom:20, marginTop:8 }}>
          {[["1","Magazine","#",T.gold],["2","Editorial","/editorial",T.text3],["3","Live","/lobby",T.text3],["4","Sponsors","/advertise",T.text3]].map(([n,l,h,c])=>(
            <Link href={h} key={n} style={{ textDecoration:"none" }}>
              <div style={{ background:n==="1"?`${T.gold}22`:T.raised, border:`2px solid ${n==="1"?T.gold:T.text3}33`, borderRadius:8, padding:"6px 4px", textAlign:"center" }}>
                <div style={{ fontFamily:T.display, fontSize:20, color:c as string }}>{n}</div>
                <div style={{ fontFamily:T.heading, fontSize:7, color:c as string, letterSpacing:1 }}>{l}</div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
