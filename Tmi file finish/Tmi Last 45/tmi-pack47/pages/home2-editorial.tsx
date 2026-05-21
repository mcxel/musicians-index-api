// apps/web/src/app/editorial/page.tsx — HOME 2: Editorial + Discovery + Marketplace
"use client";
import Link from "next/link";

const T = { bg:"#0D0520",card:"#1E0D3E",raised:"#2A1452",gold:"#FFB800",teal:"#00B8A9",pink:"#FF2D78",purple:"#7B2FBE",cyan:"#00E5FF",amber:"#FF8C00",text:"#fff",text2:"#C8A8E8",text3:"#7A5F9A",display:"'Bebas Neue',Impact,sans-serif",heading:"'Oswald',sans-serif" };
const GENRES = ["HIP HOP","POP","R&B","ROCK","JAZZ","ELECTRONIC"];
const GENRE_COLORS = [T.pink,T.teal,T.purple,T.amber,T.cyan,T.gold];

function BeltHeader({ label, color }: { label:string; color:string }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, margin:"20px 0 12px" }}>
      <span style={{ fontSize:16 }}>⚡</span>
      <div style={{ fontFamily:T.display, fontSize:20, color, letterSpacing:2 }}>{label}</div>
      <div style={{ flex:1, height:1, background:`linear-gradient(90deg, ${color}44, transparent)` }} />
    </div>
  );
}

export default function Home2Editorial() {
  return (
    <div style={{ background:T.bg, minHeight:"100vh", color:T.text, fontFamily:"Inter,sans-serif" }}>
      {/* TOP NAV — matches PDF exactly */}
      <div style={{ background:"#150830", borderBottom:`1px solid ${T.gold}33`, padding:"10px 20px", display:"flex", alignItems:"center", gap:12, position:"sticky", top:0, zIndex:100 }}>
        <div style={{ fontFamily:T.display, fontSize:16, color:T.gold, letterSpacing:2, lineHeight:1 }}>THE<br/>MUSICIAN'S<br/>INDEX</div>
        <div style={{ width:1, height:40, background:T.text3 }} />
        <div>
          <div style={{ fontFamily:T.heading, fontSize:8, color:T.text3, letterSpacing:1 }}>ISSUE:</div>
          <div style={{ fontFamily:T.display, fontSize:16, color:T.pink, letterSpacing:1 }}>CURRENT WEEK</div>
        </div>
        <div style={{ width:1, height:40, background:T.text3 }} />
        <div>
          <div style={{ fontFamily:T.heading, fontSize:8, color:T.text3 }}>WEEKLY CROWN WINNER</div>
          <div style={{ display:"flex", alignItems:"center", gap:4 }}>
            <span style={{ fontFamily:T.heading, fontSize:12, color:T.text2 }}>Glows</span>
            <div style={{ background:T.gold, borderRadius:99, padding:"2px 8px", fontFamily:T.display, fontSize:13, color:"#0D0520", boxShadow:`0 0 10px ${T.gold}88` }}>CROWN</div>
          </div>
        </div>
        <div style={{ flex:1 }} />
        {["🔍","🔔","👤"].map((icon,i) => (
          <div key={i} style={{ width:36, height:36, borderRadius:"50%", background:T.raised, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", fontSize:16 }}>{icon}</div>
        ))}
      </div>

      <div style={{ maxWidth:680, margin:"0 auto", padding:"0 16px" }}>

        {/* EDITORIAL BELT */}
        <BeltHeader label="EDITORIAL BELT: (CONTENT)" color={T.gold} />
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
          {/* Feature Article */}
          <div style={{ background:T.card, border:`2px solid ${T.gold}44`, borderRadius:10, padding:12, gridRow:"span 2" }}>
            <div style={{ background:T.gold, borderRadius:4, padding:"3px 8px", display:"inline-block", fontFamily:T.heading, fontSize:8, color:"#0D0520", letterSpacing:1, marginBottom:8 }}>ARTICLE FEATURE</div>
            <div style={{ width:"100%", height:100, background:`linear-gradient(135deg, ${T.purple}66, ${T.raised})`, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:40, marginBottom:8 }}>🎤</div>
            <div style={{ fontFamily:T.heading, fontSize:9, color:T.gold, marginBottom:4 }}>ARTICLE FEATURE:</div>
            <div style={{ fontFamily:T.heading, fontSize:13, color:T.text, lineHeight:1.3 }}>A Deep Dive into Indie Rock</div>
            <div style={{ fontFamily:T.heading, fontSize:9, color:T.text3, marginTop:6 }}>4 min read</div>
          </div>
          {/* Music News */}
          <div style={{ background:T.card, border:`1px solid ${T.pink}44`, borderRadius:10, padding:10 }}>
            <div style={{ background:T.pink, borderRadius:4, padding:"2px 6px", display:"inline-block", fontFamily:T.heading, fontSize:8, color:T.text, letterSpacing:1, marginBottom:6 }}>MUSIC NEWS</div>
            <div style={{ fontFamily:T.heading, fontSize:8, color:T.pink, marginBottom:4 }}>LAST HOUR:</div>
            {["Headline 1, Headline 1...","Headline 2, Headline 2...","Headline 3, Headline 2..."].map((h,i)=>(
              <div key={i} style={{ fontFamily:T.heading, fontSize:9, color:i===0?T.pink:T.text2, padding:"4px 0", borderBottom:`1px solid ${T.text3}22` }}>{h}</div>
            ))}
          </div>
          {/* Interviews */}
          <div style={{ background:T.card, border:`1px solid ${T.teal}44`, borderRadius:10, padding:10 }}>
            <div style={{ background:T.teal, borderRadius:4, padding:"2px 6px", display:"inline-block", fontFamily:T.heading, fontSize:8, color:"#0D0520", letterSpacing:1, marginBottom:6 }}>INTERVIEWS</div>
            <div style={{ width:"100%", height:60, background:`linear-gradient(135deg, ${T.teal}22, ${T.raised})`, borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, marginBottom:6 }}>🎙️</div>
            <div style={{ fontFamily:T.heading, fontSize:9, color:T.text2, lineHeight:1.3 }}>THE INDEX SPEAKS: Interview with...</div>
          </div>
          {/* Studio Recaps */}
          <div style={{ background:T.card, border:`1px solid ${T.purple}44`, borderRadius:10, padding:10 }}>
            <div style={{ background:T.purple, borderRadius:4, padding:"2px 6px", display:"inline-block", fontFamily:T.heading, fontSize:8, color:T.text, letterSpacing:1, marginBottom:6 }}>STUDIO RECAPS</div>
            <div style={{ fontFamily:T.heading, fontSize:11, color:T.text, lineHeight:1.2 }}>CYPHER HIGHLIGHTS: WEEKLY WRAP-UP</div>
          </div>
        </div>

        {/* DISCOVERY BELT */}
        <BeltHeader label="DISCOVERY BELT (CURATION)" color={T.teal} />
        <div style={{ display:"grid", gridTemplateColumns:"1.2fr 1fr 1fr", gap:10 }}>
          {/* Genre Hexagons */}
          <div style={{ background:T.card, border:`1px solid ${T.teal}44`, borderRadius:10, padding:12 }}>
            <div style={{ fontFamily:T.heading, fontSize:9, color:T.teal, letterSpacing:1, marginBottom:8 }}>GENRE CLUSTER</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6, justifyContent:"center" }}>
              {GENRES.map((g,i) => (
                <div key={g} style={{ background:`${GENRE_COLORS[i]}22`, border:`1px solid ${GENRE_COLORS[i]}`, borderRadius:6, padding:"5px 8px", fontFamily:T.heading, fontSize:8, color:GENRE_COLORS[i], cursor:"pointer", letterSpacing:0.5 }}>{g}</div>
              ))}
            </div>
          </div>
          {/* Top 10 Charts */}
          <div style={{ background:T.card, border:`1px solid ${T.gold}44`, borderRadius:10, padding:10 }}>
            <div style={{ fontFamily:T.heading, fontSize:9, color:T.gold, letterSpacing:1, marginBottom:6 }}>TOP 10 CHARTS</div>
            {[["1","Artist Headline",T.pink],["2","Ecanimory Headline",T.text2],["3","Artist Headline",T.text2],["4","Mazz Headline",T.text2],["5","Artist R&B",T.text2],["6","Electronic Headline",T.text2]].map(([n,name,color])=>(
              <div key={n} style={{ display:"flex", alignItems:"center", gap:6, padding:"3px 0", borderBottom:`1px solid ${T.text3}22` }}>
                <div style={{ fontFamily:T.display, fontSize:16, color, width:16 }}>{n}</div>
                <div style={{ fontFamily:T.heading, fontSize:9, color:T.text2, flex:1 }}>{name}</div>
              </div>
            ))}
          </div>
          {/* Weekly Playlists + A-Z */}
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            <div style={{ background:T.card, border:`1px solid ${T.purple}44`, borderRadius:10, padding:12, flex:1, textAlign:"center" }}>
              <div style={{ fontFamily:T.heading, fontSize:8, color:T.purple, letterSpacing:1, marginBottom:4 }}>WEEKLY PLAYLISTS</div>
              <div style={{ fontFamily:T.display, fontSize:18, color:T.text, lineHeight:1 }}>INDEX PICKS</div>
            </div>
            <div style={{ background:T.card, border:`1px solid ${T.cyan}44`, borderRadius:10, padding:10 }}>
              <div style={{ fontFamily:T.heading, fontSize:9, color:T.cyan, letterSpacing:1, marginBottom:4 }}>A-Z ARTIST DIRECTORY</div>
              <Link href="/artists" style={{ fontFamily:T.heading, fontSize:10, color:T.gold }}>→ Link</Link>
            </div>
          </div>
        </div>

        {/* MARKETPLACE BELT */}
        <BeltHeader label="PLATFORM & MARKETPLACE BELT" color={T.pink} />
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1.5fr 1fr", gap:10, marginBottom:24 }}>
          {/* The Store */}
          <div style={{ background:T.card, border:`1px solid ${T.gold}44`, borderRadius:10, padding:12, textAlign:"center" }}>
            <div style={{ background:T.gold, borderRadius:4, padding:"2px 8px", display:"inline-block", fontFamily:T.heading, fontSize:8, color:"#0D0520", letterSpacing:1, marginBottom:8 }}>THE STORE</div>
            <div style={{ width:70, height:70, background:`linear-gradient(135deg, ${T.raised}, ${T.card})`, borderRadius:8, border:`1px solid ${T.gold}44`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:30, margin:"0 auto 6px" }}>👕</div>
            <div style={{ fontFamily:T.heading, fontSize:9, color:T.gold }}>FEATURED MERCH</div>
          </div>
          {/* Booking Portal */}
          <div style={{ background:T.card, border:`2px solid ${T.teal}44`, borderRadius:10, padding:12 }}>
            <div style={{ fontFamily:T.display, fontSize:22, color:T.teal, letterSpacing:1, marginBottom:4 }}>BOOKING PORTAL</div>
            <div style={{ fontFamily:T.heading, fontSize:10, color:T.text2, lineHeight:1.5, marginBottom:12 }}>Venues we will listen. Venues and Olta Langos</div>
            <div style={{ background:`${T.pink}22`, border:`1px solid ${T.pink}`, borderRadius:6, padding:"6px 12px", fontFamily:T.heading, fontSize:9, color:T.pink, textAlign:"center" }}>SPONSOR SPOTLIGHT with High-end Ad</div>
          </div>
          {/* Achievements */}
          <div style={{ background:T.card, border:`1px solid ${T.purple}44`, borderRadius:10, padding:12 }}>
            <div style={{ fontFamily:T.heading, fontSize:9, color:T.purple, letterSpacing:1, marginBottom:4 }}>MY ACHIEVEMENTS</div>
            <div style={{ fontFamily:T.heading, fontSize:9, color:T.text3, marginBottom:2 }}>CURRENT SCORE:</div>
            <div style={{ fontFamily:T.display, fontSize:28, color:T.gold }}>850 pts</div>
            <div style={{ fontFamily:T.heading, fontSize:8, color:T.text3 }}>POWERED BY: [RETRO LOGO]</div>
          </div>
        </div>

        {/* World Switcher */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:6, marginBottom:24 }}>
          {[["1","Magazine","/",T.text3],["2","Editorial","#",T.gold],["3","Live World","/lobby",T.text3],["4","Sponsors","/advertise",T.text3]].map(([n,label,href,color])=>(
            <Link href={href} key={n} style={{ textDecoration:"none" }}>
              <div style={{ background:n==="2"?`${T.gold}22`:T.raised, border:`2px solid ${n==="2"?T.gold:T.text3}44`, borderRadius:8, padding:"8px 4px", textAlign:"center" }}>
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
