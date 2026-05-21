// apps/web/src/app/advertise/page.tsx — HOME 4: Sponsor/Advertiser Tool
// Pixel-perfect from Tmi_Homepage_4.png:
// Sponsor Spotlight, Premium Ad Carousel, Campaign Builder, Inventory, Analytics, Deals
"use client";
import Link from "next/link";
const T = { bg:"#0D0520",card:"#1E0D3E",raised:"#2A1452",gold:"#FFB800",teal:"#00B8A9",pink:"#FF2D78",purple:"#7B2FBE",cyan:"#00E5FF",amber:"#FF8C00",text:"#fff",text2:"#C8A8E8",text3:"#7A5F9A",display:"'Bebas Neue',Impact,sans-serif",heading:"'Oswald',sans-serif" };

function TopNav() {
  return (
    <div style={{ background:"#150830", borderBottom:`1px solid ${T.gold}33`, padding:"10px 20px", display:"flex", alignItems:"center", gap:12, position:"sticky", top:0, zIndex:100 }}>
      <div style={{ fontFamily:T.display, fontSize:16, color:T.gold, letterSpacing:2, lineHeight:1 }}>THE<br/>MUSICIAN'S<br/>INDEX</div>
      <div style={{ width:1, height:40, background:T.text3 }} />
      <div><div style={{ fontFamily:T.heading, fontSize:8, color:T.text3 }}>ISSUE:</div><div style={{ fontFamily:T.display, fontSize:16, color:T.pink }}>CURRENT WEEK</div></div>
      <div style={{ width:1, height:40, background:T.text3 }} />
      <div><div style={{ fontFamily:T.heading, fontSize:8, color:T.text3 }}>WEEKLY CROWN WINNER</div>
        <div style={{ display:"flex", gap:4 }}><span style={{ fontFamily:T.heading, fontSize:11, color:T.text2 }}>Glows</span><div style={{ background:T.gold, borderRadius:99, padding:"2px 8px", fontFamily:T.display, fontSize:12, color:"#0D0520", boxShadow:`0 0 8px ${T.gold}88` }}>CROWN</div></div>
      </div>
      <div style={{ flex:1 }} />
      {["🔍","🔔","👤"].map((ic,i)=><div key={i} style={{ width:34,height:34,borderRadius:"50%",background:T.raised,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,cursor:"pointer" }}>{ic}</div>)}
    </div>
  );
}

const CAROUSEL_ITEMS = [
  { icon:"📢", label:"Featured Brand Campaign" },
  { icon:"🎤", label:"Sponsored Artist Spotlight" },
  { icon:"🎪", label:"Sponsored Event" },
  { icon:"⭐", label:"Sponsored Artist Spotlight" },
  { icon:"▶️", label:"Video Ad Previews" },
  { icon:"🎯", label:"Interactive Ad Card" },
];

const PLACEMENT_ZONES = [
  "Homepage Banners","Article Page Ads","Artist Profile Ads","Live Overlays","Video Pre/l-Roll",
  "Video Pre/Mid-Roll","Sponsored Cards","Newsletter/Push/Email Ads","Store Placements","Store Placements",
];

export default function Home4SponsorTool() {
  return (
    <div style={{ background:T.bg, minHeight:"100vh", color:T.text, fontFamily:"Inter,sans-serif" }}>
      <TopNav />
      <div style={{ maxWidth:680, margin:"0 auto", padding:"0 16px" }}>

        {/* WORLD SWITCHER (top right style from PDF) */}
        <div style={{ display:"flex", justifyContent:"flex-end", gap:6, padding:"10px 0 4px" }}>
          {[["1","/"],["2","/editorial"],["3","/lobby"],["<4>","#"]].map(([n,h])=>(
            <Link href={h} key={n} style={{ textDecoration:"none" }}>
              <div style={{ fontFamily:T.display, fontSize:16, color:n.includes("4")?T.gold:T.text3, border:`1px solid ${n.includes("4")?T.gold:T.text3}44`, borderRadius:4, padding:"2px 8px" }}>{n}</div>
            </Link>
          ))}
        </div>

        {/* SPONSOR SPOTLIGHT HEADER */}
        <div style={{ fontFamily:T.display, fontSize:24, color:T.gold, letterSpacing:3, marginBottom:12 }}>
          ⚡ SPONSOR SPOTLIGHT
        </div>

        {/* MAIN BILLBOARD + PREMIUM AD CAROUSEL */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1.2fr", gap:10, marginBottom:14 }}>
          {/* Main Billboard */}
          <div style={{ background:T.card, border:`2px solid ${T.teal}`, borderRadius:10, padding:14 }}>
            <div style={{ fontFamily:T.heading, fontSize:9, color:T.teal, letterSpacing:1, marginBottom:8 }}>MAIN BILLBOARD AD</div>
            <div style={{ width:"100%", height:100, background:`linear-gradient(135deg,#1a1a2e,${T.raised})`, borderRadius:8, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", border:`1px solid ${T.teal}44`, marginBottom:8 }}>
              <div style={{ fontSize:32, marginBottom:4 }}>🎧</div>
              <div style={{ fontFamily:T.display, fontSize:14, color:T.text, letterSpacing:1, textAlign:"center" }}>PREMIUM<br/>BRAND AD</div>
              <div style={{ fontFamily:T.heading, fontSize:8, color:T.text3, textAlign:"center" }}>(e.g., fictional luxury<br/>headphone brand)</div>
            </div>
          </div>

          {/* Premium Ad Carousel */}
          <div style={{ background:T.card, border:`1px solid ${T.gold}44`, borderRadius:10, padding:12 }}>
            <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8 }}>
              <div style={{ fontFamily:T.heading, fontSize:9, color:T.gold, letterSpacing:1, flex:1 }}>PREMIUM AD CAROUSEL</div>
              {/* BRAND TAKEOVER BANNER star */}
              <div style={{ background:`linear-gradient(135deg,${T.pink},${T.purple})`, borderRadius:6, padding:"4px 8px", fontFamily:T.heading, fontSize:7, color:T.text, letterSpacing:0.5, textAlign:"center", lineHeight:1.2 }}>BRAND<br/>TAKEOVER<br/>BANNER ⭐</div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:5 }}>
              {CAROUSEL_ITEMS.map((item,i)=>(
                <div key={i} style={{ background:T.raised, borderRadius:6, padding:8, textAlign:"center", border:`1px solid ${T.text3}22` }}>
                  <div style={{ fontSize:20, marginBottom:3 }}>{item.icon}</div>
                  <div style={{ fontFamily:T.heading, fontSize:7, color:T.text2, lineHeight:1.2 }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ADVERTISING MARKETPLACE */}
        <div style={{ fontFamily:T.display, fontSize:20, color:T.teal, letterSpacing:2, marginBottom:10 }}>⚡ ADVERTISING MARKETPLACE</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:14 }}>
          {/* Campaign Builder */}
          <div style={{ background:T.card, border:`2px solid ${T.gold}`, borderRadius:10, padding:12 }}>
            <div style={{ fontFamily:T.display, fontSize:16, color:T.gold, letterSpacing:1, marginBottom:6 }}>CAMPAIGN BUILDER</div>
            <Link href="/advertiser/campaigns/new" style={{ display:"block", padding:"6px 12px", background:T.pink, color:T.text, borderRadius:6, fontFamily:T.heading, fontSize:9, letterSpacing:1, textDecoration:"none", textAlign:"center", marginBottom:5 }}>BUY AD PLACEMENT</Link>
            <button style={{ width:"100%", padding:"6px", background:T.raised, border:`1px solid ${T.teal}`, borderRadius:6, fontFamily:T.heading, fontSize:9, color:T.teal, cursor:"pointer", letterSpacing:0.5 }}>NEW CAMPAIGN (+)</button>
          </div>

          {/* Audience + Genre Targeting */}
          <div style={{ background:T.card, border:`1px solid ${T.purple}44`, borderRadius:10, padding:12 }}>
            <div style={{ fontFamily:T.heading, fontSize:9, color:T.purple, letterSpacing:1, marginBottom:6 }}>AUDIENCE TARGETING</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:3, marginBottom:6 }}>
              {["Audience Target","Fanams","Audience Celebs","Gonpocitations","Retid0Aniidng","Feaaboss","Communicatiations"].map(t=>(
                <div key={t} style={{ background:T.raised, borderRadius:99, padding:"2px 6px", fontFamily:T.heading, fontSize:7, color:T.text2 }}>{t}</div>
              ))}
            </div>
            <div style={{ fontFamily:T.heading, fontSize:9, color:T.purple, letterSpacing:1, marginBottom:4 }}>GENRE TARGETING</div>
            <div style={{ width:"100%", height:4, background:T.raised, borderRadius:2, marginBottom:2 }}>
              <div style={{ width:"65%", height:"100%", background:T.pink, borderRadius:2 }} />
            </div>
            <div style={{ fontFamily:T.heading, fontSize:7, color:T.text3 }}>Audience Targeting</div>
          </div>

          {/* Sponsorship Opportunities */}
          <div style={{ background:T.card, border:`1px solid ${T.teal}44`, borderRadius:10, padding:12, gridColumn:"span 2" }}>
            <div style={{ fontFamily:T.heading, fontSize:9, color:T.teal, letterSpacing:1, marginBottom:6 }}>SPONSORSHIP OPPORTUNITIES</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:6 }}>
              {[["🎪","Events",true],["⚡","Cyphers",true],["📡","Livestreams",true],["📄","Issues",true]].map(([ic,l,on])=>(
                <div key={l as string} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:T.raised, borderRadius:6, padding:"6px 8px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                    <span style={{ fontSize:12 }}>{ic as string}</span>
                    <span style={{ fontFamily:T.heading, fontSize:9, color:T.text2 }}>{l as string}</span>
                  </div>
                  <div style={{ width:20, height:12, borderRadius:6, background:on?T.teal:T.raised, border:`1px solid ${T.teal}` }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* INVENTORY & PLACEMENTS */}
        <div style={{ fontFamily:T.display, fontSize:20, color:T.pink, letterSpacing:2, marginBottom:10 }}>⚡ INVENTORY &amp; PLACEMENTS</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr auto", gap:10, marginBottom:14 }}>
          <div style={{ background:T.card, border:`1px solid ${T.pink}44`, borderRadius:10, padding:12 }}>
            <div style={{ fontFamily:T.heading, fontSize:9, color:T.pink, letterSpacing:1, marginBottom:8 }}>PLACEMENT INDEX</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:5 }}>
              {PLACEMENT_ZONES.slice(0,10).map((zone,i)=>(
                <div key={i} style={{ background:T.raised, borderRadius:6, padding:6, textAlign:"center", border:`1px solid ${T.text3}22` }}>
                  <div style={{ fontSize:14, marginBottom:2 }}>📌</div>
                  <div style={{ fontFamily:T.heading, fontSize:7, color:T.text2, lineHeight:1.2 }}>{zone}</div>
                  <div style={{ width:10, height:10, borderRadius:2, border:`1px solid ${T.text3}`, margin:"3px auto 0", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    {i < 5 && <div style={{ width:6, height:6, background:T.teal, borderRadius:1 }} />}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* GATEWAY */}
          <div style={{ background:T.card, border:`2px solid ${T.gold}`, borderRadius:10, padding:12, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minWidth:80 }}>
            <div style={{ fontSize:30, marginBottom:4 }}>🔒</div>
            <div style={{ fontFamily:T.display, fontSize:14, color:T.gold, letterSpacing:1 }}>GATEWAY</div>
            <div style={{ fontFamily:T.heading, fontSize:8, color:T.text3, marginTop:2 }}>INVENTORY</div>
          </div>
        </div>

        {/* ANALYTICS & PERFORMANCE */}
        <div style={{ fontFamily:T.display, fontSize:20, color:T.cyan, letterSpacing:2, marginBottom:10 }}>⚡ ANALYTICS &amp; PERFORMANCE</div>
        <div style={{ background:T.card, border:`1px solid ${T.cyan}44`, borderRadius:10, padding:14, marginBottom:14 }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:6, marginBottom:12 }}>
            {[["IMPRESSIONS","1,234,570",T.teal],["CLICKS","31,573",T.pink],["ENGAGEMENT","$186,733",T.purple],["WATCH TIME","00:13:8",T.gold],["CONVERSION RATE","10.52%",T.cyan],["SALES","$2,323",T.teal],["ROI","-0.57%",T.amber]].map(([l,v,c])=>(
              <div key={l as string} style={{ textAlign:"center" }}>
                <div style={{ fontFamily:T.heading, fontSize:7, color:T.text3, letterSpacing:0.5, marginBottom:2, lineHeight:1.1 }}>{l as string}</div>
                <div style={{ fontFamily:T.display, fontSize:14, color:c as string, lineHeight:1 }}>{v as string}</div>
              </div>
            ))}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
            {[["AUDIENCE DEMOGRAPHICS","Age, Location",T.purple],["PAGE HEATMAPS","Article, Live Room",T.pink],["TOP PERFORMING ADS","Rankings",T.gold]].map(([t,s,c])=>(
              <div key={t as string} style={{ background:T.raised, borderRadius:8, padding:10 }}>
                <div style={{ fontFamily:T.heading, fontSize:8, color:c as string, letterSpacing:1, marginBottom:4 }}>{t as string}</div>
                <div style={{ width:"100%", height:40, background:`linear-gradient(135deg,${c as string}22,${T.raised})`, borderRadius:4, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <div style={{ fontFamily:T.heading, fontSize:8, color:T.text3 }}>{s as string}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DEALS & CONTRACTS */}
        <div style={{ fontFamily:T.display, fontSize:20, color:T.gold, letterSpacing:2, marginBottom:10 }}>⚡ DEALS &amp; CONTRACTS</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr auto", gap:10, marginBottom:24 }}>
          <div style={{ background:T.card, border:`1px solid ${T.gold}44`, borderRadius:10, padding:12 }}>
            {["BRAND DEALS","SPONSORSHIP OFFERS","ARTIST PARTNERSHIPS","VENUE PARTNERSHIPS","EVENT SPONSORS"].map(d=>(
              <div key={d} style={{ marginBottom:8 }}>
                <div style={{ fontFamily:T.heading, fontSize:8, color:T.text2, marginBottom:3 }}>{d}</div>
                <div style={{ width:"100%", height:6, background:T.raised, borderRadius:3 }}>
                  <div style={{ width:`${30+Math.random()*50}%`, height:"100%", background:`linear-gradient(90deg,${T.teal},${T.cyan})`, borderRadius:3 }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ background:T.card, border:`1px solid ${T.purple}44`, borderRadius:10, padding:12 }}>
            {[["CONTRACT MANAGER","Status",T.purple],["PAYMENT TRACKING","Incoming/Outgoing",T.teal],["REVENUE SHARE","%",T.gold]].map(([t,s,c])=>(
              <div key={t as string} style={{ marginBottom:10 }}>
                <div style={{ fontFamily:T.heading, fontSize:8, color:c as string, letterSpacing:0.5, marginBottom:3 }}>{t as string}</div>
                <div style={{ width:"100%", height:6, background:T.raised, borderRadius:3 }}>
                  <div style={{ width:"70%", height:"100%", background:c as string, borderRadius:3 }} />
                </div>
                <div style={{ fontFamily:T.heading, fontSize:7, color:T.text3, marginTop:2 }}>{s as string}</div>
              </div>
            ))}
          </div>
          <div style={{ background:`linear-gradient(135deg,${T.teal}22,${T.card})`, border:`2px solid ${T.teal}`, borderRadius:10, padding:14, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minWidth:80 }}>
            <div style={{ fontSize:26, marginBottom:4 }}>🔐</div>
            <div style={{ fontFamily:T.display, fontSize:12, color:T.teal, letterSpacing:1, textAlign:"center", lineHeight:1.2 }}>SECURE<br/>DEAL<br/>GATEWAY</div>
          </div>
        </div>

      </div>
    </div>
  );
}
