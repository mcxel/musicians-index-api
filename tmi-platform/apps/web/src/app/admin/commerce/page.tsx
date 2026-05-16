import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Admin: Commerce | TMI" };

const CHANNELS = [
  { label: "Ticket Sales", revenue: 12800, cut: 1280, payout: 11520, transactions: 142, color: "#FF2DAA", href: "/admin/tickets" },
  { label: "Beat Marketplace", revenue: 8920, cut: 2676, payout: 6244, transactions: 87, color: "#FFD700", href: "/admin/beats" },
  { label: "NFT Sales", revenue: 1120, cut: 224, payout: 896, transactions: 8, color: "#00FFFF", href: "/admin/nfts" },
  { label: "Auctions", revenue: 2350, cut: 470, payout: 1880, transactions: 5, color: "#AA2DFF", href: "/admin/auctions" },
  { label: "Store / Merch", revenue: 4200, cut: 630, payout: 3570, transactions: 63, color: "#00FF88", href: "/admin/merch" },
  { label: "Sponsor Deals", revenue: 18000, cut: 0, payout: 18000, transactions: 3, color: "#00FFFF", href: "/admin/sales" },
];

export default function AdminCommercePage() {
  const totalRevenue = CHANNELS.reduce((a, c) => a + c.revenue, 0);
  const totalCut = CHANNELS.reduce((a, c) => a + c.cut, 0);

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "32px 24px 80px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 9, color: "#00FF88", fontWeight: 800, letterSpacing: "0.2em", marginBottom: 6 }}>ADMIN</div>
          <h1 style={{ fontSize: 24, fontWeight: 900 }}>Commerce Overview</h1>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>Full money chain — gross · TMI cut · creator payout · platform fees</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 40 }}>
          {[{ l: "GROSS REVENUE", v: `$${totalRevenue.toLocaleString()}`, c: "#00FF88" }, { l: "TMI PLATFORM CUT", v: `$${totalCut.toLocaleString()}`, c: "#FF2DAA" }, { l: "CREATOR PAYOUTS", v: `$${(totalRevenue - totalCut).toLocaleString()}`, c: "#00FFFF" }].map(s => (
            <div key={s.l} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${s.c}18`, borderRadius: 12, padding: "20px" }}>
              <div style={{ fontSize: 9, color: s.c, fontWeight: 800, letterSpacing: "0.12em", marginBottom: 8 }}>{s.l}</div>
              <div style={{ fontSize: 28, fontWeight: 900 }}>{s.v}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 14 }}>
          {CHANNELS.map(ch => (
            <Link key={ch.label} href={ch.href} style={{ textDecoration: "none", color: "inherit" }}>
              <div style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${ch.color}18`, borderRadius: 12, padding: "20px" }}>
                <div style={{ fontSize: 9, color: ch.color, fontWeight: 800, letterSpacing: "0.12em", marginBottom: 10 }}>{ch.label.toUpperCase()}</div>
                <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 4 }}>${ch.revenue.toLocaleString()}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginBottom: 12 }}>{ch.transactions} transactions</div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10 }}>
                  <span style={{ color: "#FF2DAA" }}>TMI cut: ${ch.cut.toLocaleString()}</span>
                  <span style={{ color: "#00FF88" }}>Payout: ${ch.payout.toLocaleString()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
