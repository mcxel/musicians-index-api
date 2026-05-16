"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function WaitlistPage() {
  const [email, setEmail] = useState("");
  const [role,  setRole]  = useState("MEMBER");
  const [done,  setDone]  = useState(false);
  const [loading, setLoading] = useState(false);

  const roles = [
    { value:"MEMBER",     label:"Fan / Member",   icon:"🎧" },
    { value:"ARTIST",     label:"Artist",          icon:"🎤" },
    { value:"PERFORMER",  label:"Performer",       icon:"🎭" },
    { value:"VENUE",      label:"Venue Owner",     icon:"🏟️" },
    { value:"SPONSOR",    label:"Sponsor",         icon:"🏆" },
    { value:"ADVERTISER", label:"Advertiser",      icon:"📢" },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 800)); // stub — replace with real API call
    setDone(true);
    setLoading(false);
  }

  return (
    <div style={{ minHeight:"100vh", background:"#050510", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"40px 20px" }}>
      <motion.div initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }} style={{ textAlign:"center", marginBottom:32 }}>
        <div style={{ fontSize:9, letterSpacing:"0.35em", color:"#00FFFF", fontWeight:800, marginBottom:6 }}>THE MUSICIAN'S INDEX</div>
        <div style={{ fontSize:28, fontWeight:900, letterSpacing:3, color:"#fff" }}>JOIN THE WAITLIST</div>
        <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)", marginTop:8, maxWidth:380, margin:"8px auto 0" }}>
          TMI is launching soon. Get early access, exclusive rewards, and first pick of your role.
        </div>
      </motion.div>

      {!done ? (
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
          style={{ width:"100%", maxWidth:440, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, padding:"28px 24px" }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom:16 }}>
              <label style={{ display:"block", fontSize:8, letterSpacing:"0.18em", color:"rgba(255,255,255,0.35)", fontWeight:700, marginBottom:6 }}>EMAIL ADDRESS</label>
              <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required
                style={{ width:"100%", padding:"12px 14px", fontSize:13, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.10)", borderRadius:7, color:"#fff", outline:"none", boxSizing:"border-box" }} />
            </div>
            <div style={{ marginBottom:20 }}>
              <label style={{ display:"block", fontSize:8, letterSpacing:"0.18em", color:"rgba(255,255,255,0.35)", fontWeight:700, marginBottom:8 }}>I AM JOINING AS</label>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
                {roles.map(r => (
                  <button key={r.value} type="button" onClick={() => setRole(r.value)}
                    style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 12px", borderRadius:7, cursor:"pointer", background: role === r.value ? "rgba(0,255,255,0.08)" : "rgba(255,255,255,0.03)", border:`1px solid ${role === r.value ? "#00FFFF" : "rgba(255,255,255,0.07)"}` }}>
                    <span>{r.icon}</span>
                    <span style={{ fontSize:10, fontWeight:700, color: role === r.value ? "#00FFFF" : "#fff" }}>{r.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <motion.button type="submit" disabled={loading} whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
              style={{ width:"100%", padding:"13px", fontSize:11, fontWeight:800, letterSpacing:"0.18em", color:"#050510", background:"linear-gradient(135deg,#00FFFF,#00AABB)", border:"none", borderRadius:7, cursor:loading?"not-allowed":"pointer", opacity:loading?0.7:1 }}>
              {loading ? "JOINING..." : "SECURE MY SPOT →"}
            </motion.button>
          </form>
          <div style={{ textAlign:"center", marginTop:14, fontSize:10, color:"rgba(255,255,255,0.25)" }}>
            Already have an account? <Link href="/login" style={{ color:"#00FFFF" }}>Sign in</Link>
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
          style={{ textAlign:"center", maxWidth:400 }}>
          <motion.div animate={{ scale:[1,1.2,1] }} transition={{ duration:0.5 }} style={{ fontSize:56, marginBottom:16 }}>🎉</motion.div>
          <div style={{ fontSize:18, fontWeight:900, color:"#00FF88", letterSpacing:2, marginBottom:8 }}>YOU'RE ON THE LIST</div>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", marginBottom:24 }}>
            We'll email <strong style={{ color:"#fff" }}>{email}</strong> when your access is ready.
          </div>
          <Link href="/" style={{ padding:"12px 28px", fontSize:11, fontWeight:800, letterSpacing:"0.15em", background:"linear-gradient(135deg,#00FFFF,#00AABB)", color:"#050510", borderRadius:7, textDecoration:"none" }}>
            EXPLORE TMI →
          </Link>
        </motion.div>
      )}
    </div>
  );
}
