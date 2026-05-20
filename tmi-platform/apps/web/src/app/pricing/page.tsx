import Link from "next/link";

export const metadata = { title: "Pricing | TMI" };

const TIERS = [
  {
    name: "FAN",
    price: "$9.99/mo",
    priceId: "price_fan_monthly",
    color: "#00FFFF",
    icon: "🎧",
    perks: ["Access all live rooms", "Chat + reactions", "Tip performers", "Monthly magazine", "XP + achievements"],
  },
  {
    name: "ARTIST / PERFORMER",
    price: "$19.99/mo",
    priceId: "price_artist_monthly",
    color: "#FF2DAA",
    icon: "🎤",
    perks: ["Go live anytime", "Beat marketplace access", "Fan club tools", "Booking requests", "Analytics dashboard", "Everything in Fan"],
  },
  {
    name: "DIAMOND VIP",
    price: "$49.99/mo",
    priceId: "price_vip_monthly",
    color: "#FFD700",
    icon: "💎",
    perks: ["NFT minting rights", "Unlimited beat uploads", "Priority booking", "Front-row seats", "Gold avatar glow", "Everything in Artist"],
  },
];

export default function PricingPage() {
  return (
    <main style={{ minHeight:"100vh", background:"#060410", color:"#fff", padding:"60px 20px 80px" }}>
      <div style={{ maxWidth:900, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:48 }}>
          <div style={{ color:"#AA2DFF", fontSize:10, letterSpacing:4, marginBottom:8 }}>TMI MEMBERSHIP</div>
          <h1 style={{ fontSize:"clamp(26px,5vw,44px)", fontWeight:900, letterSpacing:2, margin:0 }}>PLANS & PRICING</h1>
          <p style={{ color:"#555", fontSize:13, marginTop:12 }}>Choose your level. Cancel anytime.</p>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:20, marginBottom:48 }}>
          {TIERS.map(tier => (
            <div key={tier.priceId} style={{ background:`linear-gradient(135deg,${tier.color}12,rgba(6,4,16,0.98))`, border:`1px solid ${tier.color}44`, borderRadius:14, padding:"32px 24px", display:"flex", flexDirection:"column", gap:20 }}>
              <div>
                <div style={{ fontSize:36, marginBottom:8 }}>{tier.icon}</div>
                <div style={{ color:tier.color, fontSize:11, fontWeight:900, letterSpacing:3, marginBottom:6 }}>{tier.name}</div>
                <div style={{ fontSize:"clamp(22px,4vw,32px)", fontWeight:900, color:"#fff" }}>{tier.price}</div>
              </div>
              <ul style={{ listStyle:"none", margin:0, padding:0, display:"flex", flexDirection:"column", gap:8 }}>
                {tier.perks.map(p => (
                  <li key={p} style={{ color:"#888", fontSize:12, display:"flex", gap:8, alignItems:"flex-start" }}>
                    <span style={{ color:tier.color, flexShrink:0 }}>✓</span>{p}
                  </li>
                ))}
              </ul>
              <Link
                href={`/api/stripe/checkout?priceId=${tier.priceId}&mode=subscription`}
                style={{ display:"block", textAlign:"center", padding:"12px 0", background:`linear-gradient(135deg,${tier.color},${tier.color}99)`, borderRadius:8, color:"#050510", fontWeight:900, fontSize:12, letterSpacing:2, textDecoration:"none" }}
              >
                GET STARTED
              </Link>
            </div>
          ))}
        </div>

        <div style={{ textAlign:"center", color:"#333", fontSize:11, letterSpacing:2 }}>
          All plans include a 7-day free trial · No contracts · Cancel anytime
        </div>
        <div style={{ textAlign:"center", marginTop:24 }}>
          <Link href="/season-pass" style={{ color:"#AA2DFF", fontSize:11, letterSpacing:2, textDecoration:"none" }}>VIEW SEASON PASS OPTIONS →</Link>
        </div>
      </div>
    </main>
  );
}
