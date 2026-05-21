"use client";
import Link from "next/link";
import { useParams } from "next/navigation";

const T = {
  void:"#0D0520",deep:"#150830",card:"#1E0D3E",raised:"#2A1452",
  cyan:"#00E5FF",gold:"#FFB800",pink:"#FF2D78",teal:"#00C896",
  amber:"#FF8C00",text:"#fff",text2:"#C8A8E8",text3:"#7A5F9A",
  display:"'Bebas Neue',Impact,sans-serif",heading:"'Oswald',sans-serif",
};

const SECTIONS = [
  { id:"vip",       label:"VIP LOUNGE",        capacity:50,   price:"$150+", color:T.gold,  emoji:"👑", note:"Bar access, dedicated staff" },
  { id:"front",     label:"FRONT ROW",          capacity:100,  price:"$75+",  color:T.cyan,  emoji:"⚡", note:"Best view of stage" },
  { id:"floor",     label:"FLOOR PIT",          capacity:300,  price:"$35+",  color:T.pink,  emoji:"🎤", note:"General admission, standing" },
  { id:"balcony",   label:"BALCONY",            capacity:200,  price:"$25+",  color:T.teal,  emoji:"🏟️", note:"Seated, elevated view" },
  { id:"sponsor",   label:"SPONSOR LOUNGE",     capacity:30,   price:"INVITE",color:T.amber, emoji:"🤝", note:"Sponsors & partners only" },
  { id:"press",     label:"PRESS BOX",          capacity:20,   price:"PRESS", color:"#C8A8E8",emoji:"📸",note:"Media credential required" },
];

const STAFF = [
  { role:"HOST",      name:"Big Ace",    emoji:"🎙️", color:T.gold },
  { role:"CO-HOST",   name:"TBD",        emoji:"🎤", color:T.cyan },
  { role:"DJ",        name:"DJ Nova",    emoji:"🎧", color:T.pink },
  { role:"JUDGE",     name:"3 Judges",   emoji:"⚖️",  color:"#C8A8E8" },
];

export default function VenueDetail() {
  const { venueId } = useParams();
  return (
    <div style={{background:T.void,minHeight:"100vh",color:T.text,fontFamily:"'Inter',sans-serif"}}>

      {/* ── HERO ── */}
      <div style={{background:`linear-gradient(to bottom,${T.raised},${T.void})`,padding:"40px 32px 32px",borderBottom:`1px solid rgba(255,184,0,0.3)`}}>
        <div style={{maxWidth:960,margin:"0 auto"}}>
          <div style={{fontFamily:T.heading,fontSize:10,color:T.text3,letterSpacing:3,marginBottom:4}}>📍 VENUE</div>
          <h1 style={{fontFamily:T.display,fontSize:48,color:T.gold,letterSpacing:3,margin:"0 0 8px"}}>{String(venueId).toUpperCase()}</h1>
          <div style={{fontFamily:T.heading,fontSize:12,color:T.text2,marginBottom:20}}>CAPACITY: 700 · CITY, CA · ALL AGES</div>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            {[["📅 EVENTS",`/venues/${venueId}/events`],["🎫 TICKETS",`/venues/${venueId}/tickets`],["📡 LIVESTREAM",`/live/${venueId}`],["📊 ANALYTICS",`/venues/${venueId}/analytics`]].map(([l,h])=>(
              <Link key={l} href={h} style={{padding:"7px 16px",border:`1px solid rgba(0,229,255,0.4)`,color:T.cyan,fontFamily:T.heading,fontSize:11,letterSpacing:1,textDecoration:"none",borderRadius:6}}>{l}</Link>
            ))}
          </div>
        </div>
      </div>

      <div style={{maxWidth:960,margin:"0 auto",padding:"32px"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}}>

          {/* ── SEATING MAP ── */}
          <div>
            <div style={{fontFamily:T.display,fontSize:22,color:T.gold,letterSpacing:2,marginBottom:16}}>SEATING SECTIONS</div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {SECTIONS.map(s=>(
                <div key={s.id} style={{background:T.card,border:`1px solid ${s.color}44`,borderLeft:`4px solid ${s.color}`,borderRadius:8,padding:"12px 16px",display:"flex",alignItems:"center",gap:14}}>
                  <span style={{fontSize:22}}>{s.emoji}</span>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:T.heading,fontSize:13,fontWeight:700,color:s.color}}>{s.label}</div>
                    <div style={{fontSize:11,color:T.text3}}>{s.note}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:18,color:s.color}}>{s.price}</div>
                    <div style={{fontSize:10,color:T.text3}}>{s.capacity} capacity</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── VENUE STAFF + CONTROLS ── */}
          <div>
            <div style={{fontFamily:T.display,fontSize:22,color:T.gold,letterSpacing:2,marginBottom:16}}>SHOW STAFF</div>
            <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:24}}>
              {STAFF.map(s=>(
                <div key={s.role} style={{background:T.card,border:`1px solid ${s.color}44`,borderRadius:8,padding:"12px 16px",display:"flex",alignItems:"center",gap:14}}>
                  <span style={{fontSize:24}}>{s.emoji}</span>
                  <div>
                    <div style={{fontFamily:T.heading,fontSize:11,color:s.color,letterSpacing:1.5}}>{s.role}</div>
                    <div style={{fontFamily:T.heading,fontSize:14,fontWeight:700,color:T.text}}>{s.name}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Lighting Control Panel */}
            <div style={{background:T.card,border:`1px solid rgba(0,229,255,0.3)`,borderRadius:10,padding:16}}>
              <div style={{fontFamily:T.heading,fontSize:11,color:T.cyan,letterSpacing:2,marginBottom:12}}>💡 LIGHTING PRESETS</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
                {[["Stage White","#fff"],["Neon Pulse",T.cyan],["Party Strobes",T.pink],["Spotlight Gold",T.gold],["Cypher Blue","#4A90D9"],["Hype Red","#FF2020"]].map(([l,c])=>(
                  <button key={l} style={{padding:"6px 4px",background:T.raised,border:`1px solid ${c}44`,borderRadius:6,color:c,fontFamily:T.heading,fontSize:9,letterSpacing:0.5,cursor:"pointer"}}>{l}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── UPCOMING SHOWS ── */}
        <div style={{marginTop:32}}>
          <div style={{fontFamily:T.display,fontSize:22,color:T.gold,letterSpacing:2,marginBottom:16}}>UPCOMING SHOWS</div>
          <div style={{background:T.card,border:`1px solid rgba(0,229,255,0.2)`,borderRadius:10,padding:20,textAlign:"center"}}>
            <div style={{fontSize:32,marginBottom:8}}>📅</div>
            <div style={{fontFamily:T.heading,fontSize:13,color:T.text2}}>Shows load when wired to the events API</div>
            <Link href={`/venues/${venueId}/events`} style={{display:"inline-block",marginTop:12,padding:"8px 20px",background:T.cyan,color:T.void,borderRadius:6,fontFamily:T.heading,fontSize:11,fontWeight:700,letterSpacing:1,textDecoration:"none"}}>VIEW ALL EVENTS</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
