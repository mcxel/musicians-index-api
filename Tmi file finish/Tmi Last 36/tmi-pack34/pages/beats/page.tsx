"use client";
import Link from "next/link";

const T = { void:"#0D0520", deep:"#150830", card:"#1E0D3E", raised:"#2A1452", cyan:"#00E5FF", gold:"#FFB800", pink:"#FF2D78", text:"#fff", text2:"#C8A8E8", text3:"#7A5F9A", display:"'Bebas Neue',Impact,sans-serif", heading:"'Oswald',sans-serif" };

function BeatCard({ title, producer, genre, bpm, price }: any) {
  return (
    <div style={{ background: T.card, border:`1px solid rgba(0,229,255,0.2)`, borderRadius:10, overflow:"hidden" }}>
      <div style={{ background:`linear-gradient(135deg, ${T.raised}, ${T.deep})`, height:100, display:"flex", alignItems:"center", justifyContent:"center", fontSize:32 }}>🎵</div>
      <div style={{ padding:12 }}>
        <div style={{ fontFamily:T.heading, fontSize:13, fontWeight:700, color:T.text, marginBottom:2 }}>{title}</div>
        <div style={{ fontFamily:T.heading, fontSize:10, color:T.text3, marginBottom:8 }}>{producer} · {genre} · {bpm}bpm</div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontFamily:T.display, fontSize:18, color:T.gold }}>${price}</span>
          <button style={{ padding:"4px 12px", background:T.cyan, color:T.void, border:"none", borderRadius:4, fontFamily:T.heading, fontSize:10, fontWeight:700, cursor:"pointer" }}>LICENSE</button>
        </div>
      </div>
    </div>
  );
}

export default function BeatsMarketplace() {
  const demoBeats = [
    { title:"Midnight Drive", producer:"Prod. Big Ace", genre:"Trap", bpm:140, price:"29.99" },
    { title:"Crown Season", producer:"B.J. M Beats", genre:"Hip Hop", bpm:95, price:"49.99" },
    { title:"Neon Pulse", producer:"TMI Exclusive", genre:"R&B", bpm:80, price:"39.99" },
    { title:"Underground Heat", producer:"Cypher Kings", genre:"Boom Bap", bpm:88, price:"24.99" },
    { title:"Sunset Boulevard", producer:"West Coast Wave", genre:"G-Funk", bpm:92, price:"34.99" },
    { title:"Digital Soul", producer:"Future Sounds", genre:"Neo-Soul", bpm:76, price:"44.99" },
  ];

  return (
    <div style={{ background:T.void, minHeight:"100vh", color:T.text, fontFamily:"Inter,sans-serif" }}>
      <div style={{ background:T.deep, borderBottom:`1px solid rgba(255,184,0,0.3)`, padding:"32px 32px 24px" }}>
        <div style={{ maxWidth:960, margin:"0 auto" }}>
          <div style={{ fontFamily:T.heading, fontSize:10, color:T.text3, letterSpacing:3, marginBottom:4 }}>MARKETPLACE</div>
          <h1 style={{ fontFamily:T.display, fontSize:48, color:T.gold, letterSpacing:2, margin:"0 0 8px" }}>BEAT MARKETPLACE</h1>
          <p style={{ color:T.text2, fontSize:14 }}>License exclusive beats directly from producers on The Musician&apos;s Index.</p>
          <div style={{ display:"flex", gap:8, marginTop:16, flexWrap:"wrap" }}>
            {["All","Trap","Hip Hop","R&B","Pop","Electronic","Boom Bap"].map(g => (
              <button key={g} style={{ padding:"5px 14px", background: g==="All" ? T.cyan : "transparent", color: g==="All" ? T.void : T.text2, border:`1px solid rgba(0,229,255,0.3)`, borderRadius:99, fontFamily:T.heading, fontSize:10, letterSpacing:1, cursor:"pointer" }}>{g}</button>
            ))}
          </div>
        </div>
      </div>
      <div style={{ maxWidth:960, margin:"0 auto", padding:"32px 32px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:16 }}>
          {demoBeats.map((b,i) => <BeatCard key={i} {...b} />)}
        </div>
        <div style={{ textAlign:"center", marginTop:32 }}>
          <div style={{ fontFamily:T.heading, fontSize:12, color:T.text3 }}>More beats load when wired to the Beat API</div>
        </div>
      </div>
    </div>
  );
}
