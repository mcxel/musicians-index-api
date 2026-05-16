import Link from "next/link";

const HALL = [
  { name:"Ray Journey",    title:"Season 1 Champion",    genre:"Hip-Hop",   badge:"👑", color:"#FFD700" },
  { name:"Lena Sky",       title:"Top Cypher Artist",    genre:"R&B",       badge:"🎤", color:"#FF2DAA" },
  { name:"Marcus Wave",    title:"Name That Tune King",  genre:"Pop",       badge:"🎵", color:"#00FFFF" },
  { name:"Dani Cruz",      title:"Monthly Idol — Jan",   genre:"Soul",      badge:"⭐", color:"#AA2DFF" },
  { name:"DJ Storm",       title:"World Party Host MVP", genre:"Electronic",badge:"🎧", color:"#FF9500" },
];

export default function HallOfFamePage() {
  return (
    <div style={{ minHeight:"100vh", background:"#050510", padding:"60px 20px" }}>
      <div style={{ maxWidth:700, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:40 }}>
          <div style={{ fontSize:9, letterSpacing:"0.35em", color:"#FFD700", fontWeight:800, marginBottom:8 }}>TMI LEGENDS</div>
          <div style={{ fontSize:28, fontWeight:900, color:"#fff", letterSpacing:2 }}>HALL OF FAME</div>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)", marginTop:8 }}>The artists and performers who shaped TMI history.</div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {HALL.map((h, i) => (
            <Link key={h.name} href={`/artists/${h.name.toLowerCase().replace(/ /g,"-")}`}
              style={{ display:"flex", alignItems:"center", gap:16, padding:"18px 22px", background:"rgba(255,255,255,0.03)", border:`1px solid ${h.color}22`, borderRadius:12, textDecoration:"none" }}>
              <div style={{ width:36, height:36, borderRadius:"50%", background:`${h.color}20`, border:`1px solid ${h.color}44`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>{h.badge}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:800, color:"#fff" }}>{h.name}</div>
                <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)", marginTop:2 }}>{h.title} · {h.genre}</div>
              </div>
              <div style={{ fontSize:22, color:h.color, fontWeight:900 }}>#{i+1}</div>
            </Link>
          ))}
        </div>
        <div style={{ textAlign:"center", marginTop:28, fontSize:10, color:"rgba(255,255,255,0.25)" }}>
          <Link href="/contests" style={{ color:"#FFD700" }}>Compete for your spot</Link>
          {" · "}
          <Link href="/winners" style={{ color:"#00FFFF" }}>Season winners</Link>
        </div>
      </div>
    </div>
  );
}
