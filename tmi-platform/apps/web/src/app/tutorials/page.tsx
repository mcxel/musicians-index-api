import Link from "next/link";

const TUTORIALS = [
  { id: "t1", title: "Getting Started as a Performer", desc: "Set up your profile, upload beats, and enter your first battle.", category: "Performer", mins: 5, route: "/tutorials/performer-start" },
  { id: "t2", title: "How Fan XP & Rewards Work", desc: "Learn how watching, tipping, and voting earns you XP and unlocks rewards.", category: "Fan", mins: 3, route: "/tutorials/fan-xp" },
  { id: "t3", title: "Creating Your First Sponsor Campaign", desc: "Launch a campaign, assign placements, and track ROI.", category: "Sponsor", mins: 6, route: "/tutorials/sponsor-campaign" },
  { id: "t4", title: "Booking a Venue on TMI", desc: "List your venue, manage bookings, and sell tickets.", category: "Venue", mins: 7, route: "/tutorials/venue-booking" },
  { id: "t5", title: "Minting Your First NFT", desc: "Use the NFT Lab to mint and list digital collectibles from your content.", category: "Creator", mins: 8, route: "/nft-lab" },
  { id: "t6", title: "Going Live with WebRTC", desc: "Start a live stream, manage your HUD, and engage your audience.", category: "Performer", mins: 10, route: "/go-live" },
];

const CAT_COLOR: Record<string, string> = { Performer: "#AA2DFF", Fan: "#FF2DAA", Sponsor: "#FFD700", Venue: "#22c55e", Creator: "#00FFFF" };

export default function TutorialsPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#05060c", color: "#fff", padding: "40px 24px 80px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 10, letterSpacing: 5, color: "#00FFFF", fontWeight: 800, marginBottom: 8 }}>LEARN</div>
          <h1 style={{ fontSize: "clamp(26px,5vw,44px)", fontWeight: 900, margin: "0 0 8px" }}>Tutorials</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>Everything you need to make the most of TMI &mdash; fast.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 14 }}>
          {TUTORIALS.map((t) => (
            <Link key={t.id} href={t.route} style={{ textDecoration: "none", color: "inherit" }}>
              <div style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${CAT_COLOR[t.category] ?? "#fff"}22`, borderRadius: 14, padding: "22px", height: "100%", boxSizing: "border-box" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ fontSize: 9, fontWeight: 800, color: CAT_COLOR[t.category] ?? "#fff", letterSpacing: "0.15em", textTransform: "uppercase" }}>{t.category}</span>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{t.mins} min</span>
                </div>
                <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 8, lineHeight: 1.35 }}>{t.title}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.55 }}>{t.desc}</div>
              </div>
            </Link>
          ))}
        </div>
        <div style={{ marginTop: 36 }}>
          <Link href="/help" style={{ fontSize: 12, color: "#00FFFF", textDecoration: "none", fontWeight: 700 }}>Visit Help Center →</Link>
        </div>
      </div>
    </main>
  );
}
