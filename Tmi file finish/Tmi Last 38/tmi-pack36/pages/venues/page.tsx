"use client";
import Link from "next/link";

const T = { void:"#0D0520", deep:"#150830", card:"#1E0D3E", raised:"#2A1452", cyan:"#00E5FF", gold:"#FFB800", pink:"#FF2D78", amber:"#FF8C00", teal:"#00C896", text:"#fff", text2:"#C8A8E8", text3:"#7A5F9A", display:"'Bebas Neue',Impact,sans-serif", heading:"'Oswald',sans-serif" };

const VENUE_TYPES = [
  { icon:"🏟️", label:"Arena",           desc:"Large-scale shows, 5000+ capacity" },
  { icon:"🎭", label:"Concert Hall",     desc:"Seated shows, 500–2000 capacity" },
  { icon:"🎪", label:"Club",            desc:"Intimate nightlife, 200–500 capacity" },
  { icon:"🏕️", label:"Outdoor Festival", desc:"Multi-stage outdoor events" },
  { icon:"🎬", label:"Broadcast Studio", desc:"Streaming and recording studio" },
  { icon:"🏠", label:"Underground",     desc:"Underground/warehouse vibe, 100–300" },
];

function VenueTypeCard({ icon, label, desc }: { icon: string; label: string; desc: string }) {
  return (
    <div style={{ background:T.card, border:`1px solid rgba(0,229,255,0.2)`, borderRadius:10, padding:16, cursor:"pointer" }}>
      <div style={{ fontSize:28, marginBottom:8 }}>{icon}</div>
      <div style={{ fontFamily:T.heading, fontSize:13, color:T.gold, letterSpacing:1, marginBottom:4 }}>{label}</div>
      <div style={{ fontSize:11, color:T.text2 }}>{desc}</div>
    </div>
  );
}

export default function VenuesPage() {
  return (
    <div style={{ background:T.void, minHeight:"100vh", color:T.text, fontFamily:"Inter,sans-serif" }}>
      
      <div style={{ background:T.deep, borderBottom:`1px solid rgba(255,184,0,0.3)`, padding:"32px 32px 24px" }}>
        <div style={{ maxWidth:960, margin:"0 auto" }}>
          <div style={{ fontFamily:T.heading, fontSize:10, color:T.text3, letterSpacing:3, marginBottom:4 }}>THE MUSICIAN&apos;S INDEX</div>
          <h1 style={{ fontFamily:T.display, fontSize:52, color:T.gold, letterSpacing:3, margin:"0 0 8px" }}>VENUE WORLD</h1>
          <p style={{ color:T.text2, fontSize:14, marginBottom:20 }}>Connect artists with venues. Book shows. Sell tickets. Broadcast to the world.</p>
          <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
            <Link href="/venues/signup" style={{ padding:"9px 20px", background:T.amber, color:T.void, borderRadius:6, fontFamily:T.heading, fontSize:11, fontWeight:700, letterSpacing:1, textDecoration:"none" }}>🏟️ LIST YOUR VENUE</Link>
            <Link href="/booking" style={{ padding:"9px 20px", border:`1px solid ${T.gold}`, color:T.gold, borderRadius:6, fontFamily:T.heading, fontSize:11, letterSpacing:1, textDecoration:"none" }}>🎤 BOOK A SHOW</Link>
            <Link href="/events" style={{ padding:"9px 20px", border:`1px solid rgba(0,229,255,0.4)`, color:T.cyan, borderRadius:6, fontFamily:T.heading, fontSize:11, letterSpacing:1, textDecoration:"none" }}>🗓️ EVENT CALENDAR</Link>
            <Link href="/tickets" style={{ padding:"9px 20px", border:`1px solid rgba(0,229,255,0.4)`, color:T.cyan, borderRadius:6, fontFamily:T.heading, fontSize:11, letterSpacing:1, textDecoration:"none" }}>🎫 BUY TICKETS</Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:960, margin:"0 auto", padding:"32px" }}>

        {/* Venue types */}
        <div style={{ marginBottom:32 }}>
          <div style={{ fontFamily:T.display, fontSize:20, color:T.gold, letterSpacing:2, marginBottom:16 }}>VENUE TYPES</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:12 }}>
            {VENUE_TYPES.map(v => <VenueTypeCard key={v.label} {...v} />)}
          </div>
        </div>

        {/* Venue rooms system info */}
        <div style={{ background:T.card, border:`1px solid rgba(255,140,0,0.3)`, borderRadius:12, padding:24, marginBottom:24 }}>
          <div style={{ fontFamily:T.display, fontSize:20, color:T.amber, letterSpacing:2, marginBottom:16 }}>EVERY VENUE INCLUDES</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:10 }}>
            {[["🎤","Main Stage","For live performances"],["🟢","Green Room","Artist pre-show prep"],["🎚️","Control Room","Host + DJ + tech"],["👑","VIP Lounge","Premium guest area"],["🏢","Backstage","Staff + artist access"],["📸","Press Room","Media coverage"],["🎵","DJ Booth","Music control"],["🎭","Afterparty","Post-show celebration"]].map(([icon,name,desc]) => (
              <div key={name} style={{ background:T.raised, borderRadius:8, padding:10, textAlign:"center" }}>
                <div style={{ fontSize:22, marginBottom:4 }}>{icon}</div>
                <div style={{ fontFamily:T.heading, fontSize:10, color:T.amber, letterSpacing:1, marginBottom:2 }}>{name}</div>
                <div style={{ fontSize:9, color:T.text3 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Active venues placeholder */}
        <div style={{ background:T.card, border:`1px solid rgba(0,229,255,0.2)`, borderRadius:12, padding:20 }}>
          <div style={{ fontFamily:T.display, fontSize:18, color:T.cyan, letterSpacing:2, marginBottom:16 }}>VENUES ON THE INDEX</div>
          <p style={{ color:T.text3, fontSize:13 }}>Registered venues appear here when wired to the venue API. <Link href="/venues/signup" style={{ color:T.cyan }}>Sign up your venue →</Link></p>
        </div>

      </div>
    </div>
  );
}
