"use client";
import Link from "next/link";
import { useState } from "react";

const T = {
  void:"#0D0520",deep:"#150830",card:"#1E0D3E",raised:"#2A1452",
  cyan:"#00E5FF",gold:"#FFB800",pink:"#FF2D78",purple:"#7B2FBE",
  teal:"#00C896",amber:"#FF8C00",text:"#fff",text2:"#C8A8E8",text3:"#7A5F9A",
  display:"'Bebas Neue',Impact,sans-serif",heading:"'Oswald',sans-serif",
};

const RARITY = { common:{color:"#C8A8E8",label:"COMMON"}, uncommon:{color:T.teal,label:"UNCOMMON"}, rare:{color:T.cyan,label:"RARE"}, epic:{color:T.purple,label:"EPIC"}, legendary:{color:T.gold,label:"LEGENDARY"} };

const DEMO_ITEMS = [
  { id:1, name:"Crown Champion Hat", category:"avatar_wearable", rarity:"legendary", cost:2500, emoji:"👑", equipped:false },
  { id:2, name:"Neon Glow Aura",     category:"avatar_effect",   rarity:"epic",      cost:1200, emoji:"✨", equipped:true },
  { id:3, name:"Cypher King Jacket", category:"avatar_wearable", rarity:"rare",      cost:800,  emoji:"🧥", equipped:false },
  { id:4, name:"DJ Headphones",      category:"avatar_wearable", rarity:"uncommon",  cost:350,  emoji:"🎧", equipped:false },
  { id:5, name:"Fire Trail",         category:"avatar_effect",   rarity:"epic",      cost:1500, emoji:"🔥", equipped:false },
  { id:6, name:"Gold Chains",        category:"avatar_wearable", rarity:"rare",      cost:600,  emoji:"📿", equipped:false },
  { id:7, name:"Victory Confetti",   category:"victory_cosmetic",rarity:"uncommon",  cost:200,  emoji:"🎉", equipped:false },
  { id:8, name:"Crown Winner Ring",  category:"victory_cosmetic",rarity:"legendary", cost:5000, emoji:"💍", equipped:false },
];

function ItemCard({ item, onBuy }: any) {
  const r = RARITY[item.rarity as keyof typeof RARITY] || RARITY.common;
  return (
    <div style={{background:T.card,border:`1px solid ${r.color}44`,borderRadius:10,overflow:"hidden"}}>
      <div style={{background:`${r.color}15`,height:80,display:"flex",alignItems:"center",justifyContent:"center",fontSize:44}}>{item.emoji}</div>
      <div style={{padding:12}}>
        <div style={{fontFamily:T.heading,fontSize:9,color:r.color,letterSpacing:1.5,marginBottom:4}}>{r.label}</div>
        <div style={{fontFamily:T.heading,fontSize:13,fontWeight:700,color:T.text,marginBottom:8}}>{item.name}</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:18,color:T.gold}}>{item.cost.toLocaleString()} pts</div>
          <button onClick={() => onBuy(item)} style={{padding:"4px 12px",background:item.equipped ? T.teal : T.cyan,color:T.void,border:"none",borderRadius:4,fontFamily:T.heading,fontSize:10,fontWeight:700,cursor:"pointer",letterSpacing:1}}>
            {item.equipped ? "EQUIPPED" : "BUY"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AvatarStore() {
  const [activeTab, setActiveTab] = useState("featured");
  const [points] = useState(4850);

  return (
    <div style={{background:T.void,minHeight:"100vh",color:T.text,fontFamily:"'Inter',sans-serif"}}>

      {/* ── HEADER ── */}
      <div style={{background:`linear-gradient(135deg,${T.raised},${T.deep})`,borderBottom:`1px solid rgba(255,184,0,0.3)`,padding:"32px 32px 24px"}}>
        <div style={{maxWidth:960,margin:"0 auto",display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
          <div>
            <div style={{fontFamily:T.heading,fontSize:10,color:T.text3,letterSpacing:3,marginBottom:4}}>AVATAR COMMERCE</div>
            <h1 style={{fontFamily:T.display,fontSize:48,color:T.gold,letterSpacing:3,margin:"0 0 4px"}}>AVATAR STORE</h1>
            <p style={{color:T.text2,fontSize:13}}>Earn points. Buy gear. Show up in the crowd in style.</p>
          </div>
          <div style={{background:T.raised,border:`2px solid ${T.gold}`,borderRadius:10,padding:"12px 20px",textAlign:"right"}}>
            <div style={{fontFamily:T.heading,fontSize:10,color:T.text3,letterSpacing:1.5}}>YOUR POINTS</div>
            <div style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:32,color:T.gold}}>{points.toLocaleString()}</div>
            <Link href="/points/history" style={{fontFamily:T.heading,fontSize:9,color:T.cyan,textDecoration:"underline",letterSpacing:1}}>VIEW HISTORY</Link>
          </div>
        </div>
      </div>

      <div style={{maxWidth:960,margin:"0 auto",padding:"24px 32px"}}>

        {/* ── TABS ── */}
        <div style={{display:"flex",gap:8,marginBottom:24,borderBottom:`1px solid rgba(255,255,255,0.08)`,paddingBottom:12}}>
          {[["featured","⭐ FEATURED"],["wearables","👒 WEARABLES"],["effects","✨ EFFECTS"],["victory","🏆 VICTORY"],["daily","🎁 DAILY DROPS"],["inventory","🎒 MY ITEMS"]].map(([id,label])=>(
            <button key={id} onClick={()=>setActiveTab(id)} style={{padding:"6px 14px",background:activeTab===id ? T.gold : "transparent",border:`1px solid ${activeTab===id ? T.gold : "rgba(255,255,255,0.1)"}`,borderRadius:99,color:activeTab===id ? T.void : T.text2,fontFamily:T.heading,fontSize:10,letterSpacing:1,cursor:"pointer"}}>{label}</button>
          ))}
        </div>

        {/* ── DAILY ROTATION BANNER ── */}
        <div style={{background:`linear-gradient(135deg,${T.raised},${T.deep})`,border:`1px solid ${T.pink}44`,borderRadius:10,padding:"12px 20px",marginBottom:20,display:"flex",alignItems:"center",gap:16}}>
          <span style={{fontSize:24}}>🔄</span>
          <div>
            <div style={{fontFamily:T.heading,fontSize:11,color:T.pink,letterSpacing:1.5}}>TODAY&apos;S DROPS</div>
            <div style={{fontSize:12,color:T.text2}}>New items rotate daily. Sponsor drops appear after campaigns launch. Seasonal items return each issue.</div>
          </div>
          <div style={{marginLeft:"auto",fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:18,color:T.cyan}}>RESETS IN 14:32:07</div>
        </div>

        {/* ── ITEM GRID ── */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14}}>
          {DEMO_ITEMS.map(item => <ItemCard key={item.id} item={item} onBuy={(i: any) => alert(`Purchased: ${i.name} for ${i.cost} pts`)} />)}
        </div>

        {/* ── EARN MORE POINTS STRIP ── */}
        <div style={{marginTop:32,background:T.card,border:`1px solid rgba(0,200,150,0.3)`,borderRadius:10,padding:20}}>
          <div style={{fontFamily:T.display,fontSize:20,color:T.teal,letterSpacing:2,marginBottom:12}}>EARN MORE POINTS</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
            {[["🎤 Win a Cypher","200 pts","/cypher"],["📅 Daily Login","5 pts","/"],["🏆 Enter Contest","25 pts","/contest"],["🎵 Watch 30 min","15 pts","/lobby"]].map(([l,pts,h])=>(
              <Link key={l} href={h} style={{background:T.raised,border:`1px solid rgba(0,200,150,0.3)`,borderRadius:8,padding:12,textAlign:"center",textDecoration:"none"}}>
                <div style={{fontSize:20,marginBottom:4}}>{l.split(" ")[0]}</div>
                <div style={{fontFamily:T.heading,fontSize:10,color:T.text}}>{l.slice(2)}</div>
                <div style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:16,color:T.teal}}>{pts}</div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
