import Link from "next/link";

export default function BeatMarketplacePage() {
  return (
    <div style={{ minHeight:"100vh", background:"#050510", padding:"60px 20px" }}>
      <div style={{ maxWidth:800, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:40 }}>
          <div style={{ fontSize:9, letterSpacing:"0.35em", color:"#FF9500", fontWeight:800, marginBottom:8 }}>TMI BEAT MARKETPLACE</div>
          <div style={{ fontSize:28, fontWeight:900, color:"#fff", letterSpacing:2 }}>BUY & SELL BEATS</div>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)", marginTop:8 }}>License beats from the best producers on the platform.</div>
        </div>

        <div style={{ display:"flex", gap:10, marginBottom:24, flexWrap:"wrap" }}>
          {["All Genres","Hip-Hop","R&B","Pop","Electronic","Trap","Soul","Latin"].map(g => (
            <button key={g} style={{ padding:"7px 14px", fontSize:9, fontWeight:700, letterSpacing:"0.1em", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:20, cursor:"pointer", color:"rgba(255,255,255,0.5)" }}>
              {g}
            </button>
          ))}
        </div>

        <div style={{ background:"rgba(255,149,0,0.06)", border:"1px solid rgba(255,149,0,0.15)", borderRadius:10, padding:"20px 24px", marginBottom:32, textAlign:"center" }}>
          <div style={{ fontSize:28, marginBottom:8 }}>🎹</div>
          <div style={{ fontSize:13, fontWeight:800, color:"#FF9500", marginBottom:6 }}>Beat Lab Coming Soon</div>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", marginBottom:16 }}>Producers — upload your beats and start selling today.</div>
          <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
            <Link href="/beat-lab" style={{ padding:"10px 20px", fontSize:10, fontWeight:800, letterSpacing:"0.12em", color:"#050510", background:"linear-gradient(135deg,#FF9500,#FFD700)", borderRadius:7, textDecoration:"none" }}>
              OPEN BEAT LAB
            </Link>
            <Link href="/signup" style={{ padding:"10px 20px", fontSize:10, fontWeight:800, letterSpacing:"0.12em", color:"#fff", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:7, textDecoration:"none" }}>
              JOIN AS PRODUCER
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
