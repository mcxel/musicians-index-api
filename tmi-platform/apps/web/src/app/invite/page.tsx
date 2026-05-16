"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function InvitePage() {
  const [copied, setCopied] = useState(false);
  const [inviteCode, setInviteCode] = useState("TMI-XXXXXX");
  const [origin, setOrigin] = useState("themusiciansindex.com");

  useEffect(() => {
    setInviteCode(`TMI-${Math.random().toString(36).slice(2, 8).toUpperCase()}`);
    setOrigin(window.location.origin);
  }, []);

  const inviteLink = `${origin}/signup?ref=${inviteCode}`;

  function copy() {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div style={{ minHeight:"100vh", background:"#050510", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"40px 20px" }}>
      <motion.div initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }} style={{ textAlign:"center", marginBottom:32 }}>
        <div style={{ fontSize:9, letterSpacing:"0.35em", color:"#FF2DAA", fontWeight:800, marginBottom:6 }}>TMI REFERRAL PROGRAM</div>
        <div style={{ fontSize:28, fontWeight:900, color:"#fff", letterSpacing:2 }}>INVITE YOUR PEOPLE</div>
        <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)", marginTop:8 }}>Earn 500 XP + $5 platform credit for each person you bring in</div>
      </motion.div>

      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.15 }}
        style={{ width:"100%", maxWidth:440, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, padding:28 }}>
        <div style={{ fontSize:8, letterSpacing:"0.18em", color:"rgba(255,255,255,0.35)", fontWeight:700, marginBottom:8 }}>YOUR INVITE LINK</div>
        <div style={{ display:"flex", gap:8, marginBottom:20 }}>
          <div style={{ flex:1, padding:"11px 13px", fontSize:11, background:"rgba(0,255,255,0.05)", border:"1px solid rgba(0,255,255,0.15)", borderRadius:7, color:"#00FFFF", fontFamily:"monospace", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            {inviteLink}
          </div>
          <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }} onClick={copy}
            style={{ padding:"11px 16px", fontSize:10, fontWeight:800, letterSpacing:"0.1em", color:"#050510", background: copied ? "#00FF88" : "#00FFFF", border:"none", borderRadius:7, cursor:"pointer", whiteSpace:"nowrap" }}>
            {copied ? "COPIED ✓" : "COPY"}
          </motion.button>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:24 }}>
          {[["0","Friends Invited","🎧"],["0 XP","Earned","⭐"],["$0","Credits","💰"]].map(([val,lbl,icon]) => (
            <div key={lbl} style={{ textAlign:"center", padding:"14px 8px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:8 }}>
              <div style={{ fontSize:22, marginBottom:4 }}>{icon}</div>
              <div style={{ fontSize:16, fontWeight:900, color:"#fff" }}>{val}</div>
              <div style={{ fontSize:8, color:"rgba(255,255,255,0.3)", letterSpacing:"0.1em" }}>{lbl}</div>
            </div>
          ))}
        </div>

        <Link href="/rewards" style={{ display:"block", textAlign:"center", padding:"11px", fontSize:10, fontWeight:800, letterSpacing:"0.15em", color:"#050510", background:"linear-gradient(135deg,#FF2DAA,#AA2DFF)", borderRadius:7, textDecoration:"none" }}>
          VIEW MY REWARDS →
        </Link>
      </motion.div>
    </div>
  );
}
