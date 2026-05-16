"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const GIFT_OPTIONS = [
  { label:"Member Pro – 1 Month",  price:"$9.99",  key:"MEMBER_PRO_MONTHLY",  color:"#00FFFF", icon:"🎧" },
  { label:"Member VIP – 1 Month",  price:"$19.99", key:"MEMBER_VIP_MONTHLY",  color:"#AA2DFF", icon:"👑" },
  { label:"Season Pass",           price:"$49.99", key:"SEASON_PASS",          color:"#FFD700", icon:"🎟️" },
  { label:"Artist Spotlight",      price:"$49.00", key:"ARTIST_SPOTLIGHT",     color:"#FF2DAA", icon:"⭐" },
];

export default function GiftPage() {
  const [selected, setSelected] = useState("MEMBER_PRO_MONTHLY");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [message, setMessage] = useState("");

  const sel = GIFT_OPTIONS.find(o => o.key === selected)!;

  return (
    <div style={{ minHeight:"100vh", background:"#050510", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"40px 20px" }}>
      <motion.div initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }} style={{ textAlign:"center", marginBottom:32 }}>
        <div style={{ fontSize:9, letterSpacing:"0.35em", color:"#FFD700", fontWeight:800, marginBottom:6 }}>TMI GIFTING</div>
        <div style={{ fontSize:28, fontWeight:900, color:"#fff", letterSpacing:2 }}>SEND A GIFT</div>
        <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)", marginTop:8 }}>Give someone the TMI experience</div>
      </motion.div>

      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
        style={{ width:"100%", maxWidth:460, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, padding:28 }}>
        <div style={{ fontSize:8, letterSpacing:"0.18em", color:"rgba(255,255,255,0.35)", fontWeight:700, marginBottom:8 }}>CHOOSE GIFT</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, marginBottom:18 }}>
          {GIFT_OPTIONS.map(o => (
            <button key={o.key} onClick={() => setSelected(o.key)}
              style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 12px", borderRadius:7, cursor:"pointer", background: selected===o.key ? `${o.color}12` : "rgba(255,255,255,0.03)", border:`1px solid ${selected===o.key ? o.color : "rgba(255,255,255,0.07)"}` }}>
              <span style={{ fontSize:18 }}>{o.icon}</span>
              <div style={{ textAlign:"left" }}>
                <div style={{ fontSize:9, fontWeight:800, color: selected===o.key ? o.color : "#fff" }}>{o.label}</div>
                <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)" }}>{o.price}</div>
              </div>
            </button>
          ))}
        </div>

        <div style={{ marginBottom:12 }}>
          <label style={{ display:"block", fontSize:8, letterSpacing:"0.18em", color:"rgba(255,255,255,0.35)", fontWeight:700, marginBottom:6 }}>RECIPIENT EMAIL</label>
          <input type="email" placeholder="friend@example.com" value={recipientEmail} onChange={e => setRecipientEmail(e.target.value)}
            style={{ width:"100%", padding:"11px 13px", fontSize:13, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.10)", borderRadius:7, color:"#fff", outline:"none", boxSizing:"border-box" }} />
        </div>

        <div style={{ marginBottom:20 }}>
          <label style={{ display:"block", fontSize:8, letterSpacing:"0.18em", color:"rgba(255,255,255,0.35)", fontWeight:700, marginBottom:6 }}>PERSONAL MESSAGE (OPTIONAL)</label>
          <textarea rows={3} placeholder="Enjoy the best music platform on the planet..." value={message} onChange={e => setMessage(e.target.value)}
            style={{ width:"100%", padding:"11px 13px", fontSize:12, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.10)", borderRadius:7, color:"#fff", outline:"none", resize:"none", boxSizing:"border-box" }} />
        </div>

        <Link href={`/api/stripe/checkout?product=${selected}&gift=1&recipient=${encodeURIComponent(recipientEmail)}&message=${encodeURIComponent(message)}`}
          style={{ display:"block", textAlign:"center", padding:"13px", fontSize:11, fontWeight:800, letterSpacing:"0.15em", color:"#050510", background:`linear-gradient(135deg,${sel.color},${sel.color}AA)`, borderRadius:7, textDecoration:"none" }}>
          SEND {sel.price} GIFT →
        </Link>
      </motion.div>
    </div>
  );
}
