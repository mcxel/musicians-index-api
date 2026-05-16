"use client";
import { motion } from "framer-motion";
import Link from "next/link";

const TIERS = [
  { name:"Artist Spotlight", price:"$49", desc:"Featured on Homepage 1 for 7 days. Visible to all visitors.", color:"#00FFFF", href:"/api/stripe/checkout?product=ARTIST_SPOTLIGHT", icon:"⭐" },
  { name:"Homepage Banner",  price:"$299/mo", desc:"Full-width sponsor banner on homepage 1-2 rotation.", color:"#FFD700", href:"/api/stripe/checkout?product=SPONSOR_HOMEPAGE_BANNER", icon:"📣" },
  { name:"Artist Boost",     price:"$19", desc:"Discovery boost for 7 days — elevated in search + Browse.", color:"#FF2DAA", href:"/api/stripe/checkout?product=ARTIST_BOOST", icon:"🚀" },
  { name:"Featured Article", price:"$99", desc:"Sponsored editorial placement in TMI Magazine.", color:"#AA2DFF", href:"/api/stripe/checkout?product=SPONSOR_ARTICLE_PLACEMENT", icon:"📰" },
];

export default function SpotlightPage() {
  return (
    <div style={{ minHeight:"100vh", background:"#050510", padding:"60px 20px" }}>
      <div style={{ maxWidth:700, margin:"0 auto" }}>
        <motion.div initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }} style={{ textAlign:"center", marginBottom:48 }}>
          <div style={{ fontSize:9, letterSpacing:"0.35em", color:"#FFD700", fontWeight:800, marginBottom:8 }}>TMI PROMOTIONAL PLACEMENT</div>
          <div style={{ fontSize:30, fontWeight:900, color:"#fff", letterSpacing:2 }}>GET SPOTTED</div>
          <div style={{ fontSize:12, color:"rgba(255,255,255,0.4)", marginTop:10 }}>Boost your presence on The Musician's Index platform</div>
        </motion.div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          {TIERS.map((t, i) => (
            <motion.div key={t.name} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.08 }}
              style={{ background:"rgba(255,255,255,0.03)", border:`1px solid ${t.color}22`, borderRadius:12, padding:24 }}>
              <div style={{ fontSize:28, marginBottom:10 }}>{t.icon}</div>
              <div style={{ fontSize:13, fontWeight:900, color:t.color, marginBottom:4 }}>{t.name}</div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", marginBottom:16 }}>{t.desc}</div>
              <Link href={t.href}
                style={{ display:"block", textAlign:"center", padding:"11px", fontSize:10, fontWeight:800, letterSpacing:"0.15em", color:"#050510", background:`linear-gradient(135deg,${t.color},${t.color}AA)`, borderRadius:7, textDecoration:"none" }}>
                {t.price} — GET STARTED
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.4 }}
          style={{ marginTop:32, textAlign:"center", fontSize:10, color:"rgba(255,255,255,0.2)" }}>
          Questions? <Link href="/contact" style={{ color:"#00FFFF" }}>Contact our team</Link>
        </motion.div>
      </div>
    </div>
  );
}
