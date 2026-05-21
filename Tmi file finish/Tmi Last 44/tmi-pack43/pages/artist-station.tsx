// apps/web/src/app/stations/[slug]/page.tsx
// Artist Station page — Platform Law #9: articles MUST link here.
"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { artistsAPI } from "../../lib/api/api-client";

const T = { void:"#0D0520", deep:"#150830", card:"#1E0D3E", raised:"#2A1452", gold:"#FFB800", cyan:"#00E5FF", pink:"#FF2D78", text:"#fff", text2:"#C8A8E8", text3:"#7A5F9A", display:"'Bebas Neue',Impact,sans-serif", heading:"'Oswald',sans-serif" };

export default function StationPage() {
  const { slug } = useParams<{ slug: string }>();
  const [artist, setArtist] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    artistsAPI.getBySlug(slug).then(setArtist).catch(console.error).finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div style={{ background:T.void, minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", color:T.text3 }}>Loading station...</div>;
  if (!artist) return <div style={{ background:T.void, minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", color:T.pink }}>Station not found</div>;

  return (
    <div style={{ background:T.void, minHeight:"100vh", color:T.text, fontFamily:"Inter,sans-serif" }}>
      {/* Station header */}
      <div style={{ background:`linear-gradient(to bottom, ${T.raised}, ${T.void})`, padding:"48px 32px 32px", borderBottom:`2px solid ${T.gold}`, position:"relative" }}>
        <div style={{ maxWidth:960, margin:"0 auto", display:"flex", gap:24, alignItems:"flex-end" }}>
          <div style={{ width:120, height:120, borderRadius:"50%", background:T.card, border:`3px solid ${T.gold}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:48, flexShrink:0 }}>
            {artist.avatarUrl ? <img src={artist.avatarUrl} alt="" style={{ width:"100%", height:"100%", borderRadius:"50%", objectFit:"cover" }} /> : "🎤"}
          </div>
          <div>
            <div style={{ fontFamily:T.heading, fontSize:10, color:T.gold, letterSpacing:3, marginBottom:4 }}>STATION</div>
            <h1 style={{ fontFamily:T.display, fontSize:48, color:T.text, letterSpacing:2, margin:"0 0 4px" }}>{artist.stageName}</h1>
            <div style={{ color:T.text2, fontSize:14 }}>{artist.genres?.join(" · ")} {artist.city ? `· ${artist.city}, ${artist.state}` : ""}</div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:960, margin:"0 auto", padding:"32px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:24 }}>
          <div>
            {/* Latest articles */}
            <div style={{ fontFamily:T.display, fontSize:22, color:T.gold, letterSpacing:2, marginBottom:16 }}>LATEST FROM THIS STATION</div>
            {/* Articles load here — Law #9 ensures they link back */}
            <div style={{ background:T.card, borderRadius:10, padding:20, color:T.text3 }}>
              Articles auto-create on profile completion (Law #14) and always link to this station (Law #9).
            </div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <Link href={`/live?artist=${slug}`} style={{ display:"block", padding:"12px 20px", background:T.pink, color:"#fff", borderRadius:8, fontFamily:T.heading, fontSize:12, fontWeight:700, letterSpacing:1, textDecoration:"none", textAlign:"center" }}>
              🔴 WATCH LIVE
            </Link>
            <Link href={`/artists/${slug}`} style={{ display:"block", padding:"12px 20px", border:`1px solid ${T.gold}`, color:T.gold, borderRadius:8, fontFamily:T.heading, fontSize:12, letterSpacing:1, textDecoration:"none", textAlign:"center" }}>
              👤 FULL PROFILE
            </Link>
            <Link href={`/stores/${slug}`} style={{ display:"block", padding:"12px 20px", border:`1px solid rgba(0,229,255,0.4)`, color:T.cyan, borderRadius:8, fontFamily:T.heading, fontSize:12, letterSpacing:1, textDecoration:"none", textAlign:"center" }}>
              🛍️ MERCH STORE
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
