// apps/web/src/app/world/page.tsx — HOME 5: Advertisers & Sponsors World
// Pixel-perfect from Tmi_Homepage_5.png:
// Premium Ads Spotlight, Marketplace, Inventory (Blueprinted), Analytics, Deals
"use client";
import Link from "next/link";
const T = { bg:"#0D0520",card:"#1E0D3E",raised:"#2A1452",gold:"#FFB800",teal:"#00B8A9",pink:"#FF2D78",purple:"#7B2FBE",cyan:"#00E5FF",amber:"#FF8C00",text:"#fff",text2:"#C8A8E8",text3:"#7A5F9A",display:"'Bebas Neue',Impact,sans-serif",heading:"'Oswald',sans-serif" };

const MARKETPLACE_ITEMS = [
  ["BUY AD PLACEMENT",       "GET STARTED HERE!",    T.teal, 1],
  ["CAMPAIGN BUILDER",       "LAUNCH A NEW EFFORT",  T.gold, 2],
  ["AUDIENCE TARGETING",     "SEGMENT YOUR REACH",   T.purple, 3],
  ["GENRE TARGETING",        "",                     T.pink, 4],
  ["EVENT SPONSORSHIPS",     "",                     T.amber, 5],
  ["CYPHER SPONSORSHIPS",    "",                     T.cyan, 6],
  ["LIVESTREAM SPONSORSHIPS","",                     T.teal, 7],
  ["ISSUE SPONSORSHIPS",     "",                     T.gold, 8],
];

const INVENTORY_ITEMS = [
  ["HOMEPAGE BANNER SLOTS","🏠"],["ARTICLE PAGE ADS","📰"],["ARTIST PROFILE ADS","🎤"],
  ["LIVE ROOM OVERLAYS","📡"],["VIDEO PRE-ROLL","▶️"],["VIDEO MID-ROLL","⏯️"],
  ["SPONSORED CARDS","🃏"],["SPONSOR BELTS","🔲"],["NEWSLETTER ADS","📧"],
  ["PUSH NOTIFICATION ADS","🔔"],["EMAIL ADS","✉️"],["STORE PLACEMENT ADS","🏪"],
];

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

export default function Home5AdvertisersWorld() {
  return (
    <div style={{ background:T.bg, minHeight:"100vh", color:T.text, fontFamily:"Inter,sans-serif" }}>
      <TopNav />

      {/* SECTION HEADER */}
      <div style={{ background:`linear-gradient(90deg,${T.purple}44,${T.card})`, borderBottom:`2px solid ${T.gold}`, padding:"14px 20px", display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ fontFamily:T.display, fontSize:22, color:T.gold, letterSpacing:3 }}>ADVERTISERS &amp; SPONSORS WORLD</div>
        <div style={{ width:1, height:30, background:T.gold }} />
        <div style={{ fontFamily:T.display, fontSize:18, color:T.text, letterSpacing:2 }}>PREMIUM ADS SPOTLIGHT</div>
      </div>

      <div style={{ maxWidth:680, margin:"0 auto", padding:"0 16px" }}>

        {/* SPONSOR SPOTLIGHT + AD BILLBOARD + SPONSORED ARTIST */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1.3fr 1fr", gap:8, margin:"16px 0" }}>
          {/* Sponsor Spotlight */}
          <div style={{ background:T.card, border:`2px solid ${T.gold}`, borderRadius:10, padding:12 }}>
            <div style={{ background:T.gold, borderRadius:4, padding:"2px 8px", display:"inline-block", fontFamily:T.heading, fontSize:8, color:"#0D0520", letterSpacing:1, marginBottom:6 }}>Sponsor Spotlight</div>
            <div style={{ fontFamily:T.display, fontSize:18, color:T.text, lineHeight:1, marginBottom:4 }}>YOUR BRAND HERE:</div>
            <div style={{ fontFamily:T.display, fontSize:16, color:T.gold, letterSpacing:1 }}>FEATURED CAMPAIGNS</div>
            <div style={{ fontFamily:T.heading, fontSize:8, color:T.text3, marginTop:6 }}>1 • Sign in to start</div>
          </div>
          {/* Billboard Ad */}
          <div style={{ background:T.card, border:`1px solid ${T.teal}44`, borderRadius:10, overflow:"hidden" }}>
            <div style={{ width:"100%", height:120, background:`linear-gradient(135deg,#0a0a1a,#1a1a2e)`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", position:"relative" }}>
              <div style={{ fontSize:40, marginBottom:4 }}>🚗</div>
              <div style={{ fontFamily:T.heading, fontSize:9, color:T.text2 }}>Luxury</div>
              <div style={{ fontFamily:T.display, fontSize:14, color:T.gold }}>GC1a</div>
              <div style={{ fontFamily:T.heading, fontSize:9, color:T.text3 }}>ad.</div>
              <div style={{ position:"absolute", top:6, right:6, fontSize:24 }}>⌚</div>
            </div>
            <div style={{ fontFamily:T.heading, fontSize:7, color:T.text3, padding:4, textAlign:"center" }}>Billboard Ad Slot</div>
          </div>
          {/* Sponsored Artist Pre-Roll */}
          <div style={{ background:T.card, border:`1px solid ${T.pink}44`, borderRadius:10, overflow:"hidden" }}>
            <div style={{ width:"100%", height:100, background:`linear-gradient(135deg,${T.purple}44,${T.raised})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:36 }}>🎤</div>
            <div style={{ padding:8 }}>
              <div style={{ fontFamily:T.heading, fontSize:9, color:T.pink, letterSpacing:0.5, lineHeight:1.2 }}>SPONSORED ARTIST PRE-ROLL</div>
              <div style={{ fontFamily:T.heading, fontSize:7, color:T.text3, marginTop:2 }}>2 • Premium slot</div>
            </div>
          </div>
        </div>

        {/* BRAND TAKEOVER BANNER */}
        <div style={{ background:`linear-gradient(90deg,${T.teal},${T.cyan},${T.teal})`, borderRadius:8, padding:"10px 20px", textAlign:"center", marginBottom:14, boxShadow:`0 0 20px ${T.teal}44` }}>
          <div style={{ fontFamily:T.display, fontSize:18, color:"#0D0520", letterSpacing:3 }}>Brand Takeover Banner</div>
          <div style={{ fontFamily:T.heading, fontSize:9, color:"#0D0520", opacity:0.7 }}>4 • Full-width premium placement</div>
        </div>

        {/* ADVERTISING MARKETPLACE */}
        <div style={{ fontFamily:T.display, fontSize:22, color:T.gold, letterSpacing:2, marginBottom:10 }}>⚡ ADVERTISING MARKETPLACE</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:6, marginBottom:6 }}>
          {MARKETPLACE_ITEMS.slice(0,4).map(([title,sub,color,n])=>(
            <div key={title as string} style={{ background:T.card, border:`1px solid ${color as string}44`, borderRadius:8, padding:10 }}>
              <div style={{ fontFamily:T.heading, fontSize:9, color:color as string, letterSpacing:0.5, marginBottom:3, lineHeight:1.2 }}>{title as string}</div>
              {sub && <div style={{ fontFamily:T.heading, fontSize:7, color:T.text3, lineHeight:1.2 }}>{sub as string}</div>}
              <div style={{ fontFamily:T.display, fontSize:14, color:color as string, marginTop:4 }}>{n as number}</div>
            </div>
          ))}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr) 1fr", gap:6, marginBottom:14 }}>
          {MARKETPLACE_ITEMS.slice(4).map(([title,sub,color,n])=>(
            <div key={title as string} style={{ background:T.card, border:`1px solid ${color as string}44`, borderRadius:8, padding:10 }}>
              <div style={{ fontFamily:T.heading, fontSize:9, color:color as string, letterSpacing:0.5, marginBottom:3, lineHeight:1.2 }}>{title as string}</div>
              <div style={{ fontFamily:T.display, fontSize:14, color:color as string }}>{n as number}</div>
            </div>
          ))}
          <div style={{ background:`linear-gradient(135deg,${T.gold}22,${T.card})`, border:`2px solid ${T.gold}`, borderRadius:8, padding:10, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
            <div style={{ fontFamily:T.heading, fontSize:7, color:T.gold, letterSpacing:0.5, textAlign:"center", lineHeight:1.3 }}>JOIN US TO PLUG YOUR PRODUCT</div>
            <div style={{ fontFamily:T.heading, fontSize:6, color:T.text3, textAlign:"center", marginTop:4 }}>SIGN IN / CREATE AN ACCOUNT</div>
            <div style={{ fontFamily:T.display, fontSize:14, color:T.gold }}>9</div>
          </div>
        </div>

        {/* INVENTORY & PLACEMENTS (BLUEPRINTED) */}
        <div style={{ fontFamily:T.display, fontSize:22, color:T.teal, letterSpacing:2, marginBottom:10 }}>⚡ INVENTORY &amp; PLACEMENTS <span style={{ fontSize:14, color:T.text3 }}>(Blueprinted)</span></div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:6, marginBottom:14 }}>
          {INVENTORY_ITEMS.map(([label,icon],i)=>(
            <div key={i} style={{ background:T.card, border:`1px solid ${T.teal}22`, borderRadius:8, padding:10, textAlign:"center" }}>
              <div style={{ fontSize:18, marginBottom:4 }}>{icon}</div>
              <div style={{ fontFamily:T.heading, fontSize:7, color:T.text2, lineHeight:1.2, marginBottom:4 }}>{label}</div>
              <div style={{ background:T.raised, borderRadius:4, padding:4, fontFamily:T.heading, fontSize:7, color:T.text3 }}>PLACE YOUR PRODUCT HERE</div>
            </div>
          ))}
        </div>

        {/* ANALYTICS & PERFORMANCE */}
        <div style={{ fontFamily:T.display, fontSize:22, color:T.cyan, letterSpacing:2, marginBottom:10 }}>⚡ ANALYTICS &amp; PERFORMANCE</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:6, marginBottom:10 }}>
          {[["IMPRESSIONS","1.2M+",T.teal],["CLICKS","35K+",T.pink],["ENGAGEMENT","12%",T.purple],["WATCH TIME","AVG. 1:45",T.gold],["CONVERSIONS","SALES",T.cyan],["ROI","150% Avg.",T.amber]].map(([l,v,c])=>(
            <div key={l as string} style={{ background:T.card, border:`1px solid ${c as string}33`, borderRadius:8, padding:8, textAlign:"center" }}>
              <div style={{ fontFamily:T.heading, fontSize:7, color:T.text3, letterSpacing:0.5, lineHeight:1.1, marginBottom:2 }}>{l as string}</div>
              <div style={{ fontFamily:T.display, fontSize:16, color:c as string }}>{v as string}</div>
            </div>
          ))}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:14 }}>
          {[["AUDIENCE DEMOGRAPHICS","Interactive Chart",T.purple],["HEATMAPS","Platform usage overlay",T.pink],["TOP PERFORMING ADS","Rankings",T.gold]].map(([t,s,c])=>(
            <div key={t as string} style={{ background:T.card, border:`1px solid ${c as string}44`, borderRadius:8, padding:10 }}>
              <div style={{ fontFamily:T.heading, fontSize:8, color:c as string, letterSpacing:0.5, marginBottom:6 }}>{t as string}</div>
              <div style={{ width:"100%", height:40, background:`linear-gradient(135deg,${c as string}22,${T.raised})`, borderRadius:4, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <span style={{ fontFamily:T.heading, fontSize:7, color:T.text3 }}>{s as string}</span>
              </div>
            </div>
          ))}
        </div>

        {/* DEALS & CONTRACTS */}
        <div style={{ fontFamily:T.display, fontSize:22, color:T.gold, letterSpacing:2, marginBottom:10 }}>⚡ DEALS &amp; CONTRACTS <span style={{ fontSize:14, color:T.text3 }}>CONTRACTS &amp; PAYMENT DASHBOARD</span></div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:24 }}>
          <div style={{ background:T.card, border:`1px solid ${T.gold}44`, borderRadius:10, padding:12 }}>
            {[["BRAND DEALS","Active & Proposed"],["SPONSORSHIP OFFERS",""],["ARTIST PARTNERSHIPS",""],["VENUE PARTNERSHIPS",""],["EVENT SPONSORS",""]].map(([t,s])=>(
              <div key={t} style={{ marginBottom:8 }}>
                <div style={{ fontFamily:T.heading, fontSize:8, color:T.gold, marginBottom:1 }}>{t}</div>
                {s && <div style={{ fontFamily:T.heading, fontSize:6, color:T.text3 }}>{s}</div>}
                <div style={{ width:"100%", height:4, background:T.raised, borderRadius:2 }}>
                  <div style={{ width:"60%", height:"100%", background:`linear-gradient(90deg,${T.teal},${T.cyan})`, borderRadius:2 }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ background:T.card, border:`1px solid ${T.teal}44`, borderRadius:10, padding:12 }}>
            <div style={{ fontFamily:T.display, fontSize:14, color:T.teal, letterSpacing:1, marginBottom:4 }}>EVENT SPONSORS</div>
            <div style={{ width:"100%", height:50, background:T.raised, borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:8 }}>
              <span style={{ fontFamily:T.heading, fontSize:9, color:T.text3 }}>Active sponsors</span>
            </div>
            <Link href="/admin/sponsors" style={{ display:"block", padding:"5px 10px", border:`1px solid ${T.gold}`, borderRadius:4, fontFamily:T.heading, fontSize:8, color:T.gold, textDecoration:"none", textAlign:"center" }}>CONTRACT MANAGER — VIEW ACTIVE DEALS</Link>
          </div>
          <div style={{ background:T.card, border:`1px solid ${T.purple}44`, borderRadius:10, padding:12 }}>
            <div style={{ fontFamily:T.heading, fontSize:8, color:T.purple, letterSpacing:0.5, marginBottom:8 }}>PAYMENT TRACKING / REVENUE SHARE</div>
            <div style={{ fontFamily:T.heading, fontSize:8, color:T.teal, marginBottom:4 }}>PAYMENT TRACKING</div>
            <div style={{ width:"100%", height:4, background:T.raised, borderRadius:2, marginBottom:8 }}><div style={{ width:"75%", height:"100%", background:T.teal, borderRadius:2 }} /></div>
            <div style={{ fontFamily:T.heading, fontSize:8, color:T.gold, marginBottom:4 }}>REVENUE SHARE (%)</div>
            <div style={{ width:"100%", height:4, background:T.raised, borderRadius:2 }}><div style={{ width:"55%", height:"100%", background:T.gold, borderRadius:2 }} /></div>
          </div>
        </div>

        {/* World Switcher — shows 5 worlds now */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:5, marginBottom:24 }}>
          {[["1","Magazine","/",T.text3],["2","Editorial","/editorial",T.text3],["3","Live","/lobby",T.text3],["4","Ad Tools","/advertise",T.text3],["5","Sponsors","#",T.gold]].map(([n,l,h,c])=>(
            <Link href={h} key={n} style={{ textDecoration:"none" }}>
              <div style={{ background:n==="5"?`${T.gold}22`:T.raised, border:`2px solid ${n==="5"?T.gold:T.text3}33`, borderRadius:8, padding:"6px 4px", textAlign:"center" }}>
                <div style={{ fontFamily:T.display, fontSize:18, color:c as string }}>{n}</div>
                <div style={{ fontFamily:T.heading, fontSize:7, color:c as string, letterSpacing:0.5 }}>{l}</div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
