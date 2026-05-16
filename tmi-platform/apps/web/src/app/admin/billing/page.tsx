import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Billing | TMI Admin" };

const PAYOUTS = [
  { artist: "Wavetek",    amount: 28640, method: "Stripe Connect", status: "PAID",    date: "2026-04-20", color: "#FF2DAA" },
  { artist: "Krypt",      amount: 21830, method: "Stripe Connect", status: "PAID",    date: "2026-04-20", color: "#AA2DFF" },
  { artist: "Zuri Bloom", amount: 17060, method: "Stripe Connect", status: "PAID",    date: "2026-04-20", color: "#00FF88" },
  { artist: "Neon Vibe",  amount: 13800, method: "Stripe Connect", status: "PENDING", date: "2026-04-25", color: "#00FFFF" },
  { artist: "Lyric Stone",amount: 11100, method: "Stripe Connect", status: "PENDING", date: "2026-04-25", color: "#FFD700" },
];

export default function AdminBillingPage() {
  const paidTotal = PAYOUTS.filter(p => p.status === "PAID").reduce((a, p) => a + p.amount, 0);
  const pendingTotal = PAYOUTS.filter(p => p.status === "PENDING").reduce((a, p) => a + p.amount, 0);

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
        <Link href="/admin" style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>← ADMIN</Link>
        <h1 style={{ fontSize: 24, fontWeight: 900, marginTop: 20, marginBottom: 4 }}>Billing & Payouts</h1>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 32 }}>Platform revenue splits, artist payouts, and Stripe ledger.</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 12, marginBottom: 36 }}>
          {[
            { label: "Paid Out (April)", value: `$${(paidTotal/1000).toFixed(0)}K`,    color: "#00FF88" },
            { label: "Pending Payout",   value: `$${(pendingTotal/1000).toFixed(0)}K`, color: "#FFD700" },
            { label: "Platform Cut",     value: "10%",                                 color: "#00FFFF" },
            { label: "Payout Cycle",     value: "Weekly",                              color: "#AA2DFF" },
          ].map(stat => (
            <div key={stat.label} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${stat.color}18`, borderRadius: 12, padding: "18px 16px" }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: stat.color, marginBottom: 4 }}>{stat.value}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", fontWeight: 700 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", fontWeight: 700, marginBottom: 16 }}>ARTIST PAYOUTS</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {PAYOUTS.map(payout => (
            <div key={payout.artist} style={{ display: "flex", gap: 16, alignItems: "center", background: "rgba(255,255,255,0.02)", border: `1px solid ${payout.color}14`, borderRadius: 12, padding: "16px 20px", flexWrap: "wrap" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 800 }}>{payout.artist}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>{payout.method} · {payout.date}</div>
              </div>
              <div style={{ fontSize: 18, fontWeight: 900 }}>${payout.amount.toLocaleString()}</div>
              <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.12em", color: payout.status === "PAID" ? "#00FF88" : "#FFD700", border: `1px solid ${payout.status === "PAID" ? "rgba(0,255,136,0.3)" : "rgba(255,215,0,0.3)"}`, borderRadius: 4, padding: "3px 8px" }}>
                {payout.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
