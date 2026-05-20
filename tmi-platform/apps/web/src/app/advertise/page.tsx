import Link from "next/link";

export const metadata = { title: "Advertise on TMI | The Musician's Index" };

const PACKAGES = [
  { id:"starter", name:"STARTER", price:"$299/mo", color:"#00FFFF", icon:"📣", placements:["Room banner (1 room)","Magazine sidebar (3 slots)","50K impressions/mo"], cta:"GET STARTED", href:"/api/stripe/checkout?priceId=price_ad_starter&mode=subscription" },
  { id:"pro",     name:"PRO",     price:"$799/mo", color:"#FF2DAA", icon:"🚀", placements:["Room banners (3 rooms)","Homepage billboard","Magazine feature slot","150K impressions/mo","Campaign analytics"], cta:"GO PRO", href:"/api/stripe/checkout?priceId=price_ad_pro&mode=subscription" },
  { id:"premium", name:"PREMIUM", price:"$1,999/mo", color:"#FFD700", icon:"👑", placements:["All rooms + lobby","Homepage hero slot","Sponsored magazine issue","500K impressions/mo","Dedicated account manager","Giveaway & prize integration"], cta:"GO PREMIUM", href:"/api/stripe/checkout?priceId=price_ad_premium&mode=subscription" },
];

const STATS = [
  { label:"Monthly Active Users", value:"50K+" },
  { label:"Avg Session Time", value:"22 min" },
  { label:"Live Rooms", value:"20+" },
  { label:"Genres Covered", value:"30+" },
];

export default function AdvertisePage() {
  return (
    <main style={{ minHeight:"100vh", background:"#060410", color:"#fff", padding:"60px 20px 80px" }}>
      <div style={{ maxWidth:960, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:48 }}>
          <div style={{ color:"#FF9500", fontSize:10, letterSpacing:4, marginBottom:8 }}>TMI ADVERTISING</div>
          <h1 style={{ fontSize:"clamp(26px,5vw,44px)", fontWeight:900, letterSpacing:2, margin:"0 0 12px" }}>REACH MUSIC FANS</h1>
          <p style={{ color:"#555", fontSize:13, maxWidth:500, margin:"0 auto" }}>
            Advertise to 50,000+ engaged music fans, artists, and producers on the TMI platform.
          </p>
        </div>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))", gap:12, marginBottom:48 }}>
          {STATS.map(s => (
            <div key={s.label} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:10, padding:"18px 16px", textAlign:"center" }}>
              <div style={{ fontSize:22, fontWeight:900, color:"#FFD700", marginBottom:4 }}>{s.value}</div>
              <div style={{ fontSize:9, color:"#444", letterSpacing:2 }}>{s.label.toUpperCase()}</div>
            </div>
          ))}
        </div>

        {/* Packages */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:20, marginBottom:48 }}>
          {PACKAGES.map(pkg => (
            <div key={pkg.id} style={{ background:`linear-gradient(135deg,${pkg.color}12,rgba(6,4,16,0.98))`, border:`1px solid ${pkg.color}44`, borderRadius:14, padding:"32px 24px", display:"flex", flexDirection:"column", gap:20 }}>
              <div>
                <div style={{ fontSize:32, marginBottom:8 }}>{pkg.icon}</div>
                <div style={{ color:pkg.color, fontSize:11, fontWeight:900, letterSpacing:3, marginBottom:4 }}>{pkg.name}</div>
                <div style={{ fontSize:"clamp(20px,3.5vw,28px)", fontWeight:900, color:"#fff" }}>{pkg.price}</div>
              </div>
              <ul style={{ listStyle:"none", margin:0, padding:0, display:"flex", flexDirection:"column", gap:8 }}>
                {pkg.placements.map(p => (
                  <li key={p} style={{ color:"#888", fontSize:12, display:"flex", gap:8 }}>
                    <span style={{ color:pkg.color, flexShrink:0 }}>✓</span>{p}
                  </li>
                ))}
              </ul>
              <Link href={pkg.href} style={{ display:"block", textAlign:"center", padding:"12px 0", background:`linear-gradient(135deg,${pkg.color},${pkg.color}88)`, borderRadius:8, color:"#050510", fontWeight:900, fontSize:12, letterSpacing:2, textDecoration:"none" }}>
                {pkg.cta}
              </Link>
            </div>
          ))}
        </div>

        <div style={{ textAlign:"center" }}>
          <div style={{ color:"#333", fontSize:11, letterSpacing:2, marginBottom:12 }}>ENTERPRISE / CUSTOM CAMPAIGNS</div>
          <Link href="/contact" style={{ color:"#FF9500", fontSize:12, letterSpacing:2, textDecoration:"none", border:"1px solid #FF950044", padding:"10px 24px", borderRadius:8 }}>
            CONTACT SALES →
          </Link>
        </div>
      </div>
    </main>
  );
}
