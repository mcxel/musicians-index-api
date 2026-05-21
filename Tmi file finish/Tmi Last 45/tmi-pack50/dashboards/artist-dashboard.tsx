// apps/web/src/app/dashboard/artist/page.tsx — Full Artist Dashboard
"use client";
import Link from "next/link";
const T = { bg:"#0D0520",card:"#1E0D3E",raised:"#2A1452",gold:"#FFB800",teal:"#00B8A9",pink:"#FF2D78",purple:"#7B2FBE",cyan:"#00E5FF",amber:"#FF8C00",text:"#fff",text2:"#C8A8E8",text3:"#7A5F9A",teal2:"#00C896",display:"'Bebas Neue',Impact,sans-serif",heading:"'Oswald',sans-serif" };

function StatCard({ value, label, color, delta }: { value:string; label:string; color:string; delta?:string }) {
  return (
    <div style={{ background:T.card, border:`1px solid ${color}33`, borderRadius:10, padding:14 }}>
      <div style={{ fontFamily:T.display, fontSize:28, color, lineHeight:1 }}>{value}</div>
      {delta && <div style={{ fontFamily:T.heading, fontSize:9, color:T.teal2, marginBottom:2 }}>↑ {delta}</div>}
      <div style={{ fontFamily:T.heading, fontSize:9, color:T.text3, letterSpacing:1 }}>{label}</div>
    </div>
  );
}

function QuickAction({ icon, label, href, color }: { icon:string; label:string; href:string; color:string }) {
  return (
    <Link href={href} style={{ textDecoration:"none" }}>
      <div style={{ background:T.card, border:`1px solid ${color}44`, borderRadius:10, padding:14, display:"flex", alignItems:"center", gap:10, cursor:"pointer" }}>
        <span style={{ fontSize:22 }}>{icon}</span>
        <div style={{ fontFamily:T.heading, fontSize:11, color, letterSpacing:0.5 }}>{label}</div>
        <div style={{ flex:1 }} />
        <span style={{ fontFamily:T.heading, fontSize:14, color:T.text3 }}>→</span>
      </div>
    </Link>
  );
}

export default function ArtistDashboard() {
  return (
    <div style={{ background:T.bg, minHeight:"100vh", color:T.text, fontFamily:"Inter,sans-serif" }}>
      {/* Header */}
      <div style={{ background:"#150830", borderBottom:`1px solid ${T.gold}33`, padding:"16px 20px", display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ width:44, height:44, borderRadius:"50%", background:`linear-gradient(135deg,${T.purple}66,${T.raised})`, border:`2px solid ${T.gold}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>🎤</div>
        <div>
          <div style={{ fontFamily:T.display, fontSize:18, color:T.gold, letterSpacing:1 }}>ARTIST DASHBOARD</div>
          <div style={{ fontFamily:T.heading, fontSize:10, color:T.text3, letterSpacing:1 }}>Test Artist · PRO · Station: test-artist-station</div>
        </div>
        <div style={{ flex:1 }} />
        <Link href="/live/start" style={{ padding:"8px 16px", background:T.pink, color:T.text, border:"none", borderRadius:6, fontFamily:T.heading, fontSize:11, textDecoration:"none", letterSpacing:1, boxShadow:`0 0 12px ${T.pink}44` }}>● GO LIVE</Link>
      </div>

      <div style={{ maxWidth:680, margin:"0 auto", padding:"20px 16px" }}>

        {/* COACHING STICKY NOTES — Platform Law #11 */}
        <div style={{ background:`${T.gold}11`, border:`1px solid ${T.gold}44`, borderRadius:10, padding:14, marginBottom:20 }}>
          <div style={{ fontFamily:T.heading, fontSize:10, color:T.gold, letterSpacing:1.5, marginBottom:10 }}>📌 COACHING NOTES</div>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {[
              { p:"CRITICAL", c:T.pink,   t:"Set Up Your Station!",         b:"Station slug required for article discovery links." },
              { p:"HIGH",     c:T.amber,  t:"Upload Your 3-Second Motion Card", b:"Artists with motion cards get 3× more clicks." },
              { p:"MEDIUM",   c:T.teal,   t:"Write an Article This Week",    b:"Editorial Belt boost available." },
            ].map((n,i) => (
              <div key={i} style={{ display:"flex", gap:8, alignItems:"flex-start", padding:"8px 10px", background:T.raised, borderRadius:6, borderLeft:`3px solid ${n.c}` }}>
                <div style={{ fontFamily:T.heading, fontSize:8, color:n.c, letterSpacing:1, marginTop:1, flexShrink:0 }}>{n.p}</div>
                <div>
                  <div style={{ fontFamily:T.heading, fontSize:11, color:T.text, marginBottom:2 }}>{n.t}</div>
                  <div style={{ fontFamily:T.heading, fontSize:9, color:T.text2 }}>{n.b}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* STATS */}
        <div style={{ fontFamily:T.display, fontSize:18, color:T.gold, letterSpacing:2, marginBottom:10 }}>THIS WEEK</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:20 }}>
          <StatCard value="1,247" label="PROFILE VIEWS"    color={T.teal}  delta="+18% vs last week" />
          <StatCard value="847"   label="LIVE VIEWERS"     color={T.pink}  />
          <StatCard value="$48"   label="TIPS EARNED"      color={T.gold}  delta="+$12 vs last week" />
          <StatCard value="432"   label="ARTICLE READS"    color={T.purple}/>
          <StatCard value="89"    label="NEW FOLLOWERS"    color={T.cyan}  delta="+24 this week" />
          <StatCard value="1,850" label="POINTS EARNED"    color={T.amber} />
        </div>

        {/* QUICK ACTIONS */}
        <div style={{ fontFamily:T.display, fontSize:18, color:T.gold, letterSpacing:2, marginBottom:10 }}>QUICK ACTIONS</div>
        <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:20 }}>
          <QuickAction icon="📡" label="START LIVE SHOW"       href="/live/start"                    color={T.pink}   />
          <QuickAction icon="📝" label="WRITE ARTICLE"         href="/dashboard/artist/articles/new" color={T.teal}   />
          <QuickAction icon="🎤" label="UPLOAD TRACK / VIDEO"  href="/dashboard/artist/uploads"      color={T.purple} />
          <QuickAction icon="🎫" label="CREATE EVENT"          href="/dashboard/artist/events/new"   color={T.gold}   />
          <QuickAction icon="🏪" label="MANAGE STORE"          href="/dashboard/artist/store"        color={T.amber}  />
          <QuickAction icon="📢" label="SPONSOR TASKS"         href="/dashboard/artist/sponsors"     color={T.cyan}   />
        </div>

        {/* EARNINGS */}
        <div style={{ background:T.card, border:`1px solid ${T.gold}33`, borderRadius:12, padding:16, marginBottom:20 }}>
          <div style={{ fontFamily:T.display, fontSize:18, color:T.gold, letterSpacing:2, marginBottom:12 }}>EARNINGS</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:12 }}>
            {[["$48.00","Tips This Week",T.gold],["$0.00","Ticket Revenue",T.teal],["$0.00","Pending Payout",T.amber]].map(([v,l,c])=>(
              <div key={l} style={{ textAlign:"center" }}>
                <div style={{ fontFamily:T.display, fontSize:22, color:c }}>{v}</div>
                <div style={{ fontFamily:T.heading, fontSize:8, color:T.text3, letterSpacing:1 }}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{ fontFamily:T.heading, fontSize:9, color:T.text3, lineHeight:1.6 }}>
            Payouts require Big Ace approval. All earnings accumulate until approved weekly. Platform fee: 10%.
          </div>
          <button style={{ marginTop:10, padding:"8px 16px", background:T.raised, border:`1px solid ${T.gold}44`, borderRadius:6, fontFamily:T.heading, fontSize:10, color:T.gold, cursor:"pointer", letterSpacing:1 }}>REQUEST PAYOUT</button>
        </div>

      </div>
    </div>
  );
}
