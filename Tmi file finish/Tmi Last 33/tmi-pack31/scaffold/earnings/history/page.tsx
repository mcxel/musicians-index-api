"use client";
import Link from "next/link";

export default function Page() {
  return (
    <div style={{minHeight:"100vh",background:"#0D0520",color:"#fff",fontFamily:"Inter,sans-serif",padding:32}}>
      <div style={{maxWidth:960,margin:"0 auto"}}>
        <div style={{marginBottom:8,fontSize:11,color:"#7A5F9A",fontFamily:"Oswald,sans-serif",letterSpacing:2}}>
          THE MUSICIAN'S INDEX
        </div>
        <h1 style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:36,color:"#FFB800",letterSpacing:2,margin:"0 0 8px"}}>
          EARNINGS HISTORY
        </h1>
        <p style={{color:"#C8A8E8",fontSize:14,marginBottom:24}}>EARNINGS HISTORY — your earnings with BerntoutGlobal LLC.</p>
        <div style={{background:"#1E0D3E",border:"1px solid rgba(0,229,255,0.25)",borderRadius:12,padding:24,marginBottom:24}}>
          <p style={{color:"#7A5F9A",fontSize:13}}>⚡ This section is being wired up. Come back soon.</p>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <a href="/dashboard/artist" style={{display:"block",padding:"8px 12px",marginBottom:4,background:"#150830",border:"1px solid rgba(0,229,255,0.2)",borderRadius:6,color:"#00E5FF",textDecoration:"none",fontSize:12,fontFamily:"Oswald,sans-serif",letterSpacing:1}}>→ Back to Dashboard</a>
        </div>
      </div>
    </div>
  );
}
