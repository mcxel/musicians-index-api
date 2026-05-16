import Link from "next/link";

// Seed schedule — replace with DB query
const SCHEDULE = [
  { time:"Mon 8PM ET",  title:"Monday Stage",          room:"/rooms/monday-stage",    type:"Performance", color:"#FF2DAA" },
  { time:"Tue 7PM ET",  title:"Cypher Room Open",      room:"/rooms/cypher",          type:"Cypher",      color:"#00FFFF" },
  { time:"Wed 9PM ET",  title:"Name That Tune",        room:"/rooms/name-that-tune",  type:"Game Show",   color:"#FFD700" },
  { time:"Thu 8PM ET",  title:"Deal or Feud",          room:"/rooms/deal-or-feud",    type:"Game Show",   color:"#AA2DFF" },
  { time:"Fri 9PM ET",  title:"World Concert",         room:"/rooms/world-concert",   type:"Concert",     color:"#00FF88" },
  { time:"Sat 7PM ET",  title:"Monthly Idol Showcase", room:"/rooms/monthly-idol",    type:"Contest",     color:"#FF9500" },
  { time:"Sun 6PM ET",  title:"World Dance Party",     room:"/rooms/world-dance-party",type:"Party",      color:"#FF2DAA" },
];

export default function LiveSchedulePage() {
  return (
    <div style={{ minHeight:"100vh", background:"#050510", padding:"60px 20px" }}>
      <div style={{ maxWidth:700, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:40 }}>
          <div style={{ fontSize:9, letterSpacing:"0.35em", color:"#00FFFF", fontWeight:800, marginBottom:8 }}>TMI LIVE WORLD</div>
          <div style={{ fontSize:28, fontWeight:900, color:"#fff", letterSpacing:2 }}>WEEKLY SCHEDULE</div>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)", marginTop:8 }}>All times Eastern. Join any room — it's free to attend.</div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {SCHEDULE.map(ev => (
            <Link key={ev.title} href={ev.room}
              style={{ display:"flex", alignItems:"center", gap:16, padding:"16px 20px", background:"rgba(255,255,255,0.03)", border:`1px solid rgba(255,255,255,0.07)`, borderRadius:10, textDecoration:"none", transition:"border-color 0.2s" }}>
              <div style={{ width:80, fontSize:9, fontWeight:700, color:"rgba(255,255,255,0.4)", letterSpacing:"0.08em", flexShrink:0 }}>{ev.time}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:800, color:"#fff", marginBottom:2 }}>{ev.title}</div>
                <span style={{ fontSize:8, fontWeight:800, letterSpacing:"0.12em", color:ev.color, background:`${ev.color}18`, padding:"2px 8px", borderRadius:10 }}>{ev.type}</span>
              </div>
              <div style={{ fontSize:18, color:ev.color }}>→</div>
            </Link>
          ))}
        </div>
        <div style={{ textAlign:"center", marginTop:28, fontSize:10, color:"rgba(255,255,255,0.25)" }}>
          <Link href="/rooms" style={{ color:"#00FFFF" }}>Browse all rooms</Link>
          {" · "}
          <Link href="/signup" style={{ color:"#FF2DAA" }}>Join TMI free</Link>
        </div>
      </div>
    </div>
  );
}
