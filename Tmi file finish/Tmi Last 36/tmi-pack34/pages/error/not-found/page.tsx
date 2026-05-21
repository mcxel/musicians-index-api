"use client";
import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ background:"#0D0520", minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", color:"#fff", fontFamily:"'Inter',sans-serif", textAlign:"center", padding:32 }}>
      <div style={{ fontFamily:"'Bebas Neue',Impact,sans-serif", fontSize:120, color:"#1E0D3E", lineHeight:1 }}>404</div>
      <div style={{ fontFamily:"'Bebas Neue',Impact,sans-serif", fontSize:28, color:"#FFB800", letterSpacing:2, marginTop:-20, marginBottom:12 }}>PAGE NOT FOUND</div>
      <p style={{ color:"#7A5F9A", fontSize:14, maxWidth:320, lineHeight:1.6 }}>This stage is empty. The artist you&apos;re looking for might have moved or never existed.</p>
      <div style={{ display:"flex", gap:12, marginTop:28 }}>
        <Link href="/" style={{ padding:"10px 24px", background:"#00E5FF", color:"#0D0520", borderRadius:6, fontFamily:"'Oswald',sans-serif", fontSize:12, fontWeight:700, letterSpacing:1, textDecoration:"none" }}>HOME</Link>
        <Link href="/magazine" style={{ padding:"10px 24px", border:"1px solid rgba(0,229,255,0.4)", color:"#00E5FF", borderRadius:6, fontFamily:"'Oswald',sans-serif", fontSize:12, letterSpacing:1, textDecoration:"none" }}>MAGAZINE</Link>
      </div>
    </div>
  );
}
