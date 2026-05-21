// apps/web/src/app/advertise/page.tsx — HOME 4: Sponsors & Advertisers
"use client";
import Link from "next/link";
const T = { bg:"#0D0520",card:"#1E0D3E",raised:"#2A1452",gold:"#FFB800",teal:"#00B8A9",pink:"#FF2D78",purple:"#7B2FBE",cyan:"#00E5FF",amber:"#FF8C00",text:"#fff",text2:"#C8A8E8",text3:"#7A5F9A",display:"'Bebas Neue',Impact,sans-serif",heading:"'Oswald',sans-serif" };

const BELT_ITEMS = {
  premium_ads: [
    { title:"HERO BANNER PLACEMENT",  price:"$599/wk",  zones:"HOME1 + HOME3",  available:2  },
    { title:"LOBBY WALL TAKEOVER",    price:"$399/wk",  zones:"HOME3 WALL",     available:1  },
    { title:"GAME SHOW SPONSOR",      price:"$299/wk",  zones:"DIRTY DOZENS",   available:3  },
    { title:"CROWN WEEK PARTNER",     price:"$999/wk",  zones:"ALL SURFACES",   available:1  },
  ],
  marketplace: [
    { type:"Artist Collab",  desc:"Co-branded content package" },
    { type:"Event Sponsor",  desc:"Title sponsor a ticketed show" },
    { type:"VR Billboard",   desc:"Stadium VR sponsor board" },
    { type:"Item Drop",      desc:"Branded avatar item (500 units)" },
  ],
};

export default function Home4Advertise() {
  return (
    <div style={{ background:T.bg, minHeight:"100vh", color:T.text, fontFamily:"Inter,sans-serif" }}>
      {/* Hero */}
      <div style={{ background:`linear-gradient(135deg, #150830, ${T.bg})`, padding:"40px 24px 32px", textAlign:"center", borderBottom:`2px solid ${T.gold}`, position:"relative" }}>
        <div style={{ fontFamily:T.heading, fontSize:10, color:T.gold, letterSpacing:4, marginBottom:6 }}>GROW YOUR BRAND WITH</div>
        <div style={{ fontFamily:T.display, fontSize:52, color:T.gold, letterSpacing:4, lineHeight:0.9, textShadow:`0 0 30px ${T.gold}88` }}>THE INDEX</div>
        <div style={{ fontFamily:T.display, fontSize:24, color:T.text, letterSpacing:3, marginBottom:12 }}>REACH 10,000+ MUSIC FANS WEEKLY</div>
        <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
          <Link href="/sponsor/dashboard" style={{ padding:"10px 24px", background:T.gold, color:"#0D0520", borderRadius:8, fontFamily:T.display, fontSize:18, letterSpacing:2, textDecoration:"none", boxShadow:`0 0 20px ${T.gold}66` }}>BECOME A SPONSOR</Link>
          <Link href="/advertiser/dashboard" style={{ padding:"10px 24px", border:`2px solid ${T.gold}`, color:T.gold, borderRadius:8, fontFamily:T.display, fontSize:18, letterSpacing:2, textDecoration:"none" }}>ADVERTISE NOW</Link>
        </div>
      </div>

      <div style={{ maxWidth:680, margin:"0 auto", padding:"0 16px" }}>

        {/* PREMIUM AD PLACEMENTS BELT */}
        <div style={{ display:"flex", alignItems:"center", gap:10, margin:"20px 0 12px" }}>
          <span style={{ fontSize:16 }}>⚡</span>
          <div style={{ fontFamily:T.display, fontSize:20, color:T.gold, letterSpacing:2 }}>PREMIUM AD PLACEMENTS</div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          {BELT_ITEMS.premium_ads.map((item, i) => (
            <div key={i} style={{ background:T.card, border:`1px solid ${T.gold}44`, borderRadius:10, padding:14 }}>
              <div style={{ fontFamily:T.heading, fontSize:11, color:T.gold, letterSpacing:0.5, marginBottom:4 }}>{item.title}</div>
              <div style={{ fontFamily:T.display, fontSize:24, color:T.text, marginBottom:2 }}>{item.price}</div>
              <div style={{ fontFamily:T.heading, fontSize:9, color:T.teal, marginBottom:6 }}>📍 {item.zones}</div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={{ fontFamily:T.heading, fontSize:9, color:T.text3 }}>{item.available} slots left</div>
                <button style={{ padding:"4px 12px", background:T.gold, color:"#0D0520", border:"none", borderRadius:4, fontFamily:T.heading, fontSize:9, fontWeight:700, cursor:"pointer" }}>BOOK</button>
              </div>
            </div>
          ))}
        </div>

        {/* MARKETPLACE BELT */}
        <div style={{ display:"flex", alignItems:"center", gap:10, margin:"20px 0 12px" }}>
          <span style={{ fontSize:16 }}>⚡</span>
          <div style={{ fontFamily:T.display, fontSize:20, color:T.teal, letterSpacing:2 }}>SPONSOR MARKETPLACE</div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
          {BELT_ITEMS.marketplace.map((item, i) => (
            <div key={i} style={{ background:T.card, border:`1px solid ${T.teal}44`, borderRadius:10, padding:12, textAlign:"center" }}>
              <div style={{ fontSize:28, marginBottom:6 }}>
                {["🤝","🎪","🥽","👑"][i]}
              </div>
              <div style={{ fontFamily:T.heading, fontSize:10, color:T.teal, marginBottom:4 }}>{item.type}</div>
              <div style={{ fontFamily:T.heading, fontSize:8, color:T.text2, lineHeight:1.3 }}>{item.desc}</div>
            </div>
          ))}
        </div>

        {/* ANALYTICS BELT */}
        <div style={{ display:"flex", alignItems:"center", gap:10, margin:"20px 0 12px" }}>
          <span style={{ fontSize:16 }}>⚡</span>
          <div style={{ fontFamily:T.display, fontSize:20, color:T.purple, letterSpacing:2 }}>PLATFORM ANALYTICS</div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:24 }}>
          {[["10,847","WEEKLY ACTIVE FANS",T.gold],["847","ARTISTS ON PLATFORM",T.teal],["98.7%","AD DELIVERY RATE",T.pink],["3.2×","AVG SPONSOR ROI",T.purple],["$0","MIN SPEND TO START",T.cyan],["24h","AD REVIEW TIME",T.amber]].map(([val,label,color])=>(
            <div key={label} style={{ background:T.card, border:`1px solid ${color}44`, borderRadius:8, padding:12, textAlign:"center" }}>
              <div style={{ fontFamily:T.display, fontSize:24, color }}>{val}</div>
              <div style={{ fontFamily:T.heading, fontSize:8, color:T.text3, letterSpacing:1 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* DEALS BELT */}
        <div style={{ background:`linear-gradient(135deg, ${T.gold}22, ${T.card})`, border:`2px solid ${T.gold}`, borderRadius:12, padding:20, marginBottom:24 }}>
          <div style={{ fontFamily:T.display, fontSize:22, color:T.gold, letterSpacing:2, marginBottom:8 }}>LOCAL SPONSOR DEAL</div>
          <div style={{ fontFamily:T.heading, fontSize:11, color:T.text2, lineHeight:1.6, marginBottom:12 }}>
            The Musician's Index pairs local businesses with local artists in your city. Pay once, get featured across every page an artist from your city appears on.
          </div>
          <Link href="/sponsor/local" style={{ padding:"10px 20px", background:T.gold, color:"#0D0520", borderRadius:8, fontFamily:T.display, fontSize:16, letterSpacing:2, textDecoration:"none" }}>START LOCAL DEAL →</Link>
        </div>

        {/* World Switcher */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:6, marginBottom:24 }}>
          {[["1","Magazine","/",T.text3],["2","Editorial","/editorial",T.text3],["3","Live World","/lobby",T.text3],["4","Sponsors","#",T.gold]].map(([n,label,href,color])=>(
            <Link href={href} key={n} style={{ textDecoration:"none" }}>
              <div style={{ background:n==="4"?`${T.gold}22`:T.raised, border:`2px solid ${n==="4"?T.gold:T.text3}44`, borderRadius:8, padding:"8px 4px", textAlign:"center" }}>
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
