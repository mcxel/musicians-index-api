"use client";

export default function Maintenance() {
  return (
    <div style={{ background:"#0D0520", minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", color:"#fff", fontFamily:"'Inter',sans-serif", textAlign:"center", padding:32 }}>
      <div style={{ fontSize:64, marginBottom:16 }}>⚡</div>
      <div style={{ fontFamily:"'Bebas Neue',Impact,sans-serif", fontSize:36, color:"#FFB800", letterSpacing:3, marginBottom:8 }}>BACK SOON</div>
      <div style={{ fontFamily:"'Bebas Neue',Impact,sans-serif", fontSize: 20, color:"#00E5FF", letterSpacing:2, marginBottom:16 }}>THE MUSICIAN&apos;S INDEX</div>
      <p style={{ color:"#7A5F9A", fontSize:14, maxWidth:300 }}>We&apos;re upgrading the platform. Your stage will be ready shortly.</p>
    </div>
  );
}
