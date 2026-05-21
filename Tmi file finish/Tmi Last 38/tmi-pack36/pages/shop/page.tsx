"use client";
import Link from "next/link";
import { useState } from "react";

const T = { void:"#0D0520", deep:"#150830", card:"#1E0D3E", raised:"#2A1452", cyan:"#00E5FF", gold:"#FFB800", pink:"#FF2D78", purple:"#7B2FBE", teal:"#00C896", amber:"#FF8C00", text:"#fff", text2:"#C8A8E8", text3:"#7A5F9A", display:"'Bebas Neue',Impact,sans-serif", heading:"'Oswald',sans-serif" };

const RARITY_COLORS = { common:"#C8A8E8", uncommon:"#00C896", rare:"#00E5FF", epic:"#7B2FBE", legendary:"#FFB800", exclusive:"#FF2D78" };

const DEMO_ITEMS = [
  { id:1, name:"Crown Champion Hat",   emoji:"👑", rarity:"legendary", points:5000, category:"avatar_wearable", isNew:true },
  { id:2, name:"Neon Wings Aura",       emoji:"✨", rarity:"epic",      points:2500, category:"avatar_effect",   isNew:true },
  { id:3, name:"Cypher Arena Badge",    emoji:"🏅", rarity:"rare",      points:1500, category:"badge",           isNew:false },
  { id:4, name:"Gold Chain Accessory",  emoji:"🔗", rarity:"uncommon",  points:500,  category:"avatar_wearable", isNew:false },
  { id:5, name:"Victory Confetti",      emoji:"🎉", rarity:"uncommon",  points:400,  category:"room_effect",     isNew:false },
  { id:6, name:"DJ Headphones",         emoji:"🎧", rarity:"common",    points:200,  category:"avatar_wearable", isNew:false },
];

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const categories = ["all","avatar_wearable","avatar_effect","badge","room_effect","collectible"];

  return (
    <div style={{ background:T.void, minHeight:"100vh", color:T.text, fontFamily:"Inter,sans-serif" }}>
      <div style={{ background:T.deep, borderBottom:`1px solid rgba(255,184,0,0.3)`, padding:"32px 32px 24px" }}>
        <div style={{ maxWidth:960, margin:"0 auto" }}>
          <div style={{ fontFamily:T.heading, fontSize:10, color:T.text3, letterSpacing:3, marginBottom:4 }}>POINTS ECONOMY</div>
          <h1 style={{ fontFamily:T.display, fontSize:52, color:T.gold, letterSpacing:3, margin:"0 0 8px" }}>ITEM SHOP</h1>
          <p style={{ color:T.text2, fontSize:14, marginBottom:16 }}>Spend your points on avatar gear, effects, badges, and collectibles. New items drop daily.</p>
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            <div style={{ background:T.raised, border:`1px solid rgba(255,184,0,0.4)`, borderRadius:8, padding:"8px 16px", fontFamily:T.display, fontSize:20, color:T.gold }}>⚡ 850 PTS</div>
            <Link href="/points/history" style={{ fontFamily:T.heading, fontSize:11, color:T.text3, textDecoration:"none", letterSpacing:1 }}>View history →</Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:960, margin:"0 auto", padding:"24px 32px" }}>

        {/* Category tabs */}
        <div style={{ display:"flex", gap:8, marginBottom:24, flexWrap:"wrap" }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} style={{ padding:"6px 14px", background:activeCategory===cat ? T.gold : T.raised, color:activeCategory===cat ? T.void : T.text2, border:`1px solid ${activeCategory===cat ? T.gold : "rgba(255,255,255,0.1)"}`, borderRadius:99, fontFamily:T.heading, fontSize:10, cursor:"pointer", letterSpacing:1, textTransform:"uppercase" as const }}>
              {cat === "all" ? "ALL ITEMS" : cat.replace("_", " ")}
            </button>
          ))}
        </div>

        {/* Daily featured */}
        <div style={{ background:`linear-gradient(135deg, ${T.raised}, ${T.deep})`, border:`2px solid ${T.gold}`, boxShadow:`0 0 20px rgba(255,184,0,0.2)`, borderRadius:12, padding:20, marginBottom:24, display:"flex", alignItems:"center", gap:20 }}>
          <div style={{ fontFamily:T.display, fontSize:48, color:T.gold, writingMode:"vertical-rl" as const, textOrientation:"mixed" as const, letterSpacing:3 }}>DAILY DROP</div>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:T.heading, fontSize:10, color:T.gold, letterSpacing:2, marginBottom:4 }}>TODAY&apos;S FEATURED ITEM</div>
            <div style={{ fontFamily:T.display, fontSize:28, color:T.text, marginBottom:8 }}>🎤 Live Stage Microphone</div>
            <div style={{ fontFamily:T.heading, fontSize:10, color:RARITY_COLORS.epic, letterSpacing:1, marginBottom:12 }}>★ EPIC RARITY — 24h only</div>
            <button style={{ padding:"8px 20px", background:T.gold, color:T.void, border:"none", borderRadius:6, fontFamily:T.heading, fontSize:12, fontWeight:700, cursor:"pointer", letterSpacing:1 }}>BUY FOR 2,500 PTS</button>
          </div>
          <div style={{ fontSize:80 }}>🎤</div>
        </div>

        {/* Item grid */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:14 }}>
          {DEMO_ITEMS.filter(item => activeCategory === "all" || item.category === activeCategory).map(item => (
            <div key={item.id} style={{ background:T.card, border:`1px solid ${(RARITY_COLORS as any)[item.rarity]}44`, borderRadius:10, overflow:"hidden" }}>
              {item.isNew && <div style={{ background:T.pink, padding:"3px 10px", fontFamily:T.heading, fontSize:9, fontWeight:700, letterSpacing:1, color:"#fff" }}>⚡ NEW</div>}
              <div style={{ padding:20, textAlign:"center" }}>
                <div style={{ fontSize:48, marginBottom:8 }}>{item.emoji}</div>
                <div style={{ fontFamily:T.heading, fontSize:12, color:T.text, marginBottom:4 }}>{item.name}</div>
                <div style={{ fontFamily:T.heading, fontSize:10, color:(RARITY_COLORS as any)[item.rarity], letterSpacing:1, marginBottom:12 }}>{item.rarity.toUpperCase()}</div>
                <button style={{ width:"100%", padding:"8px", background:`${(RARITY_COLORS as any)[item.rarity]}22`, border:`1px solid ${(RARITY_COLORS as any)[item.rarity]}`, borderRadius:6, fontFamily:T.heading, fontSize:11, color:(RARITY_COLORS as any)[item.rarity], cursor:"pointer", letterSpacing:1 }}>
                  ⚡ {item.points.toLocaleString()} PTS
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
