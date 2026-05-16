import Link from "next/link";

export default async function MeetAndGreetPage({ params }: { params: Promise<{ artistSlug: string }> }) {
  const { artistSlug } = await params;
  const displayName = artistSlug.replace(/-/g," ").replace(/\b\w/g,c=>c.toUpperCase());

  const slots = [
    { date:"Fri, May 2",  time:"6:00 PM ET",  spots:3,  filled:1 },
    { date:"Sat, May 3",  time:"4:00 PM ET",  spots:5,  filled:3 },
    { date:"Sun, May 4",  time:"7:00 PM ET",  spots:5,  filled:0 },
  ];

  return (
    <div style={{ minHeight:"100vh", background:"#050510", padding:"60px 20px" }}>
      <div style={{ maxWidth:560, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:36 }}>
          <Link href={`/artists/${artistSlug}`} style={{ fontSize:9, letterSpacing:"0.2em", color:"rgba(255,255,255,0.3)", textDecoration:"none" }}>← {displayName}</Link>
          <div style={{ fontSize:26, fontWeight:900, color:"#fff", letterSpacing:2, marginTop:10 }}>MEET & GREET</div>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)", marginTop:6 }}>Book a private session with {displayName}. 15 minutes, 1-on-1.</div>
          <div style={{ fontSize:16, fontWeight:900, color:"#FF2DAA", marginTop:10 }}>$25 per session</div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {slots.map(s => {
            const avail = s.spots - s.filled;
            return (
              <div key={s.date} style={{ display:"flex", alignItems:"center", gap:16, padding:"16px 20px", background:"rgba(255,255,255,0.03)", border:`1px solid rgba(255,255,255,0.07)`, borderRadius:10 }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, fontWeight:800, color:"#fff" }}>{s.date} · {s.time}</div>
                  <div style={{ fontSize:9, color: avail > 0 ? "#00FF88" : "#FF5555", marginTop:3 }}>{avail > 0 ? `${avail} spot${avail!==1?"s":""} available` : "Fully booked"}</div>
                </div>
                {avail > 0 ? (
                  <Link href={`/api/stripe/checkout?product=MEET_GREET&artistSlug=${artistSlug}&date=${s.date}`}
                    style={{ padding:"9px 16px", fontSize:9, fontWeight:800, letterSpacing:"0.12em", color:"#050510", background:"linear-gradient(135deg,#FF2DAA,#AA2DFF)", borderRadius:7, textDecoration:"none", whiteSpace:"nowrap" }}>
                    BOOK $25
                  </Link>
                ) : (
                  <span style={{ fontSize:9, color:"rgba(255,255,255,0.2)", fontWeight:700, letterSpacing:"0.08em" }}>SOLD OUT</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
